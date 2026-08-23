import sqlite3
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

from backend.database import DB_PATH, connection, hash_password, initialize_database, iso_after, new_token, verify_password

ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIST = ROOT / "frontend" / "dist"
VIDEO = ROOT / "assets" / "videos" / "featured-space-facts.mp4"
UPLOADS = ROOT / "data" / "uploads"

@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    UPLOADS.mkdir(parents=True, exist_ok=True)
    yield

app = FastAPI(title="KNOMO API", version="3.0", lifespan=lifespan)

class SignupBody(BaseModel):
    display_name: str = Field(min_length=2, max_length=60)
    username: str = Field(pattern=r"^[a-zA-Z0-9_]{3,24}$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginBody(BaseModel):
    email: EmailStr
    password: str

class ForgotBody(BaseModel):
    email: EmailStr

class ResetBody(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)

class InterestBody(BaseModel):
    interests: list[str] = Field(min_length=3, max_length=8)

class StudyBody(BaseModel):
    subject: str = Field(default="General study", min_length=1, max_length=80)
    duration_seconds: int = Field(ge=0, le=86400)

def public_user(row: sqlite3.Row, conn: sqlite3.Connection) -> dict:
    interests = [r["name"] for r in conn.execute("SELECT i.name FROM interests i JOIN user_interests ui ON ui.interest_id=i.id WHERE ui.user_id=? ORDER BY i.name", (row["id"],))]
    return {"id":row["id"],"email":row["email"],"display_name":row["display_name"],"username":row["username"],"study_hours":round(row["study_seconds"]/3600,1),"streak":row["current_streak"],"interests":interests,"needs_onboarding":len(interests)<3}

def create_session(conn: sqlite3.Connection, user_id: int) -> str:
    token = new_token()
    conn.execute("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", (token,user_id,iso_after(24*30)))
    return token

def current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401,"Sign in required")
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    row = conn.execute("SELECT u.* FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token=? AND s.expires_at > datetime('now')",(authorization.removeprefix("Bearer "),)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(401,"Session expired")
    return row,conn

@app.get("/api/health")
def health(): return {"status":"healthy","app":"KNOMO","database":"sqlite"}

@app.post("/api/auth/signup")
def signup(body: SignupBody):
    password_hash,salt=hash_password(body.password)
    try:
        with connection() as conn:
            user_id=conn.execute("INSERT INTO users(email,display_name,username,password_hash,password_salt,last_login_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP)",(body.email.lower(),body.display_name.strip(),body.username.lower(),password_hash,salt)).lastrowid
            token=create_session(conn,user_id)
            return {"token":token,"user":public_user(conn.execute("SELECT * FROM users WHERE id=?",(user_id,)).fetchone(),conn)}
    except sqlite3.IntegrityError as exc:
        raise HTTPException(409,"Email or username already exists") from exc

@app.post("/api/auth/login")
def login(body: LoginBody):
    with connection() as conn:
        row=conn.execute("SELECT * FROM users WHERE email=? COLLATE NOCASE",(body.email,)).fetchone()
        if not row or not verify_password(body.password,row["password_hash"],row["password_salt"]): raise HTTPException(401,"Incorrect email or password")
        conn.execute("UPDATE users SET last_login_at=CURRENT_TIMESTAMP WHERE id=?",(row["id"],))
        return {"token":create_session(conn,row["id"]),"user":public_user(row,conn)}

@app.get("/api/auth/me")
def me(auth=Depends(current_user)):
    row,conn=auth
    try: return {"user":public_user(row,conn)}
    finally: conn.close()

@app.post("/api/auth/logout")
def logout(auth=Depends(current_user)):
    user, conn = auth
    try:
        conn.execute("DELETE FROM sessions WHERE user_id=?", (user["id"],))
        conn.commit()
        return {"message": "Signed out"}
    finally: conn.close()

@app.post("/api/me/study")
def record_study(body: StudyBody, auth=Depends(current_user)):
    user, conn = auth
    try:
        conn.execute("INSERT INTO study_sessions(user_id,subject,duration_seconds) VALUES(?,?,?)", (user["id"], body.subject.strip(), body.duration_seconds))
        conn.execute("UPDATE users SET study_seconds=study_seconds+? WHERE id=?", (body.duration_seconds, user["id"]))
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE id=?", (user["id"],)).fetchone()
        return {"user": public_user(row, conn)}
    finally: conn.close()

@app.post("/api/auth/forgot-password")
def forgot(body: ForgotBody):
    with connection() as conn:
        row=conn.execute("SELECT id FROM users WHERE email=? COLLATE NOCASE",(body.email,)).fetchone()
        if not row: return {"message":"If that account exists, a reset link was created."}
        token=new_token(); conn.execute("INSERT INTO password_resets(token,user_id,expires_at) VALUES(?,?,?)",(token,row["id"],iso_after(1)))
        return {"message":"Reset link created. In production this is emailed.","demo_reset_token":token}

@app.post("/api/auth/reset-password")
def reset(body: ResetBody):
    with connection() as conn:
        item=conn.execute("SELECT * FROM password_resets WHERE token=? AND used=0 AND expires_at > datetime('now')",(body.token,)).fetchone()
        if not item: raise HTTPException(400,"Reset link is invalid or expired")
        password_hash,salt=hash_password(body.password)
        conn.execute("UPDATE users SET password_hash=?,password_salt=? WHERE id=?",(password_hash,salt,item["user_id"])); conn.execute("UPDATE password_resets SET used=1 WHERE token=?",(body.token,)); conn.execute("DELETE FROM sessions WHERE user_id=?",(item["user_id"],))
        return {"message":"Password updated. Sign in again."}

@app.get("/api/interests")
def interests():
    with connection() as conn: return {"interests":[dict(r) for r in conn.execute("SELECT name,icon FROM interests ORDER BY name")]}

@app.put("/api/me/interests")
def update_interests(body: InterestBody,auth=Depends(current_user)):
    user,conn=auth
    try:
        conn.execute("DELETE FROM user_interests WHERE user_id=?",(user["id"],))
        for name in body.interests:
            interest=conn.execute("SELECT id FROM interests WHERE name=? COLLATE NOCASE",(name,)).fetchone()
            if interest: conn.execute("INSERT OR IGNORE INTO user_interests(user_id,interest_id) VALUES(?,?)",(user["id"],interest["id"]))
        conn.commit(); row=conn.execute("SELECT * FROM users WHERE id=?",(user["id"],)).fetchone()
        return {"user":public_user(row,conn)}
    finally: conn.close()

def reel_json(row: sqlite3.Row) -> dict:
    initials = "".join(part[0] for part in row["display_name"].split()[:2]).upper()
    return {"id": row["id"], "kind": "video", "creator": row["username"], "name": row["display_name"], "initials": initials, "course": row["course"], "unit": row["unit"], "title": row["title"], "body": "Student-created syllabus reel", "caption": "Fresh from the KNOMO studio.", "likes": row["likes"], "comments": row["comments"], "video": f"/media/uploads/{row['video_path']}", "color": "from-fuchsia-500 to-rose-500"}

@app.get("/api/reels")
def reels():
    with connection() as conn:
        rows = conn.execute("SELECT r.*,u.username,u.display_name FROM reels r JOIN users u ON u.id=r.user_id ORDER BY r.created_at DESC").fetchall()
        return {"reels": [reel_json(row) for row in rows]}

@app.post("/api/reels")
async def create_reel(title: str = Form(...), course: str = Form("Data structures"), unit: str = Form("Student reel"), file: UploadFile = File(...), auth=Depends(current_user)):
    user, conn = auth
    suffix = Path(file.filename or "upload.mp4").suffix.lower() or ".mp4"
    filename = f"{uuid.uuid4().hex}{suffix}"
    try:
        (UPLOADS / filename).write_bytes(await file.read())
        reel_id = uuid.uuid4().hex
        conn.execute("INSERT INTO reels(id,user_id,title,course,unit,video_path) VALUES(?,?,?,?,?,?)", (reel_id, user["id"], title.strip(), course.strip(), unit.strip(), filename))
        conn.commit()
        row = conn.execute("SELECT r.*,u.username,u.display_name FROM reels r JOIN users u ON u.id=r.user_id WHERE r.id=?", (reel_id,)).fetchone()
        return {"reel": reel_json(row)}
    finally: conn.close()

@app.get("/media/featured-space-facts.mp4")
def featured_video(): return FileResponse(VIDEO,media_type="video/mp4",filename="featured-space-facts.mp4")

@app.get("/media/uploads/{filename}")
def uploaded_video(filename: str):
    candidate = (UPLOADS / Path(filename).name).resolve()
    if not candidate.is_file() or UPLOADS.resolve() not in candidate.parents: raise HTTPException(404, "Video not found")
    return FileResponse(candidate, media_type="video/mp4")

if FRONTEND_DIST.exists():
    app.mount("/assets",StaticFiles(directory=FRONTEND_DIST/"assets"),name="frontend-assets")
    @app.get("/{path:path}")
    def frontend(path:str):
        candidate=FRONTEND_DIST/path
        return FileResponse(candidate if candidate.is_file() else FRONTEND_DIST/"index.html")
