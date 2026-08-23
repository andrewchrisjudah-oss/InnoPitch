import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

from backend.database import DB_PATH, connection, hash_password, initialize_database, iso_after, new_token, verify_password

ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIST = ROOT / "frontend" / "dist"
VIDEO = ROOT / "assets" / "videos" / "featured-space-facts.mp4"

@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
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
    conn = sqlite3.connect(DB_PATH)
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

@app.get("/media/featured-space-facts.mp4")
def featured_video(): return FileResponse(VIDEO,media_type="video/mp4",filename="featured-space-facts.mp4")

if FRONTEND_DIST.exists():
    app.mount("/assets",StaticFiles(directory=FRONTEND_DIST/"assets"),name="frontend-assets")
    @app.get("/{path:path}")
    def frontend(path:str):
        candidate=FRONTEND_DIST/path
        return FileResponse(candidate if candidate.is_file() else FRONTEND_DIST/"index.html")
