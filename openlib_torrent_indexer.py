import sqlite3
import hashlib
from pathlib import Path
import os

VAULT_ROOT = Path(r"Z:\kittlib")
DB_PATH = VAULT_ROOT / "openlib_torrent_contributions.db"

def init_contribution_db():
    VAULT_ROOT.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS torrent_file_mapping (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            torrent_hash TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER,
            extracted_title TEXT,
            extracted_author TEXT,
            confidence_score REAL,
            matched_genre TEXT,
            status TEXT DEFAULT 'indexed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()
    print(f"[✓] Contribution database initialized at {DB_PATH}")

if __name__ == "__main__":
    init_contribution_db()
