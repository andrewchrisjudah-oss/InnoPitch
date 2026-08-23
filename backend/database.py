import base64
import hashlib
import hmac
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Iterator

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "syllabite.db"
SCHEMA_PATH = Path(__file__).with_name("schema.sql")

@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def initialize_database() -> None:
    with connection() as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

def hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 310_000)
    return base64.b64encode(digest).decode(), base64.b64encode(salt).decode()

def verify_password(password: str, expected: str, salt_text: str) -> bool:
    digest, _ = hash_password(password, base64.b64decode(salt_text))
    return hmac.compare_digest(digest, expected)

def new_token() -> str:
    return secrets.token_urlsafe(32)

def iso_after(hours: int) -> str:
    return (datetime.now(UTC) + timedelta(hours=hours)).isoformat()
