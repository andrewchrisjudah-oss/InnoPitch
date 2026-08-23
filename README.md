# KNOMO

An Instagram-inspired education feed built with Python and Streamlit. It turns a university syllabus into short reels, memes, quizzes, saves, streaks, and progress tracking.

## Shadcn + Tailwind interface

The primary interface is now a React/TypeScript app in `frontend/`, built from Shadcn-style components, Radix UI primitives, Tailwind CSS, and Lucide icons. FastAPI serves the production build.

```powershell
cd frontend
npm install
npm run build
cd ..
python -m uvicorn backend.app:app --port 8501
```

For frontend development, run `npm run dev` in `frontend/` and the FastAPI backend on port 8000.

## Run locally

```powershell
python -m pip install -r requirements.txt
streamlit run streamlit_app.py
```

## Use your university syllabus

Open **Change syllabus** in the sidebar and upload a JSON file matching `data/sample_syllabus.json`. Each course contains units, and each unit contains content items of type `reel`, `meme`, or `quiz`.

This prototype uses scripted reel beats. A production build can connect those beats to generated/uploaded vertical videos, authentication, a database, moderation, and a faculty content-management workflow.

## Databases

KNOMO currently keeps SQLite active at `data/syllabite.db`. A matching MySQL 8 schema is available at `backend/mysql_schema.sql` for the second database, named `knomo_db`.

Create the MySQL database securely (the password prompt is local and hidden):

```powershell
.\scripts\setup_mysql.ps1
```

Open KNOMO through the MySQL command line:

```powershell
.\scripts\open_mysql.ps1
```

Useful commands after connecting:

```sql
SHOW TABLES;
DESCRIBE users;
SELECT id, display_name, username, email FROM users;
SELECT * FROM interests;
```
