# C:\Scripts\universal_directory_profiler.py
import os
import sqlite3
from pathlib import Path

# Configurable target seedbox / local mount path
WATCH_DIR = Path(r"Z:\seedbox_downloads") 
DB_PATH = Path(r"Z:\kittlib\metadata.db")

def scan_and_profile_directory(target_path: Path):
    """Recursively scans any directory, extracts metadata/author heuristics, 
    and categorizes findings into local SQLite for instant querying."""
    print(f"[*] Scanning directory: {target_path}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Ensure profile table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS directory_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path TEXT UNIQUE NOT NULL,
            filename TEXT,
            inferred_author TEXT,
            inferred_title TEXT,
            detected_genre TEXT,
            file_size_mb REAL,
            status TEXT DEFAULT 'unprocessed'
        )
    """)
    
    extensions = {'.epub', '.mobi', '.pdf', '.cbz', '.cbr', '.txt', '.md'}
    count = 0
    
    for file_path in target_path.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in extensions:
            filename = file_path.name
            size_mb = round(file_path.stat().st_size / (1024 * 1024), 2)
            
            # Simple heuristic parsing (Author - Title or variations)
            parts = filename.replace(file_path.suffix, "").split(" - ")
            author = parts[0].strip() if len(parts) > 1 else "Unknown Author"
            title = parts[1].strip() if len(parts) > 1 else parts[0].strip()
            
            # Simple keyword matching for genre clustering
            lower_name = filename.lower()
            genre = "General Fiction"
            if any(w in lower_name for w in ['western', 'cowboy', 'frontier']):
                genre = "Westerns"
            elif any(w in lower_name for w in ['nora roberts', 'jd robb', 'robert', 'robb']):
                genre = "Nora Roberts / J.D. Robb"
            elif any(w in lower_name for w in ['litrpg', 'system', 'apocalypse']):
                genre = "LitRPG & Progression"
                
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO directory_profiles 
                    (file_path, filename, inferred_author, inferred_title, detected_genre, file_size_mb)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (str(file_path), filename, author, title, genre, size_mb))
                count += 1
            except Exception as e:
                print(f"[!] Error logging {filename}: {e}")
                
    conn.commit()
    conn.close()
    print(f"[✓] Scanned and profiled {count} items successfully.")

if __name__ == "__main__":
    if WATCH_DIR.exists():
        scan_and_profile_directory(WATCH_DIR)
    else:
        print(f"[!] Watch directory not found: {WATCH_DIR}. Update WATCH_DIR path as needed.")
