#!/usr/bin/env python3
"""
deploy_mixtmoji.py - Integration deployment helper for AnyMD Mixtmoji Extension
"""
import shutil
from pathlib import Path

def main():
    src_dir = Path(__file__).parent
    dest_dir = Path.home() / ".gemini" / "antigravity" / "scratch" / "anymd-mixtmoji"
    
    print("⏳ Synchronizing Mixtmoji Extension Assets...")
    
    if not dest_dir.exists():
        dest_dir.mkdir(parents=True, exist_ok=True)
        print(f"Created destination directory: {dest_dir}")
        
    files_to_sync = [
        "anymd-mixtmoji-manifest.json",
        "anymd-mixtmoji-popup.html",
        "anymd-mixtmoji-popup.js",
        "anymd-mixtmoji-content.js",
        "README-MIXTMoji.md",
        "CHANGELOG-MIXTMoji.md"
    ]
    
    for f_name in files_to_sync:
        src_path = src_dir / f_name
        dest_path = dest_dir / f_name
        if src_path.exists():
            shutil.copy2(src_path, dest_path)
            print(f"  [Synced] {f_name} -> {dest_path}")
        else:
            print(f"  [⚠️ Missing] {src_path}")
            
    print("🎉 Sync completed successfully!")

if __name__ == "__main__":
    main()
