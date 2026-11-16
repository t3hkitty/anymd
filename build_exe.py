import PyInstaller.__main__
from pathlib import Path

def build():
    script_path = str(Path(r"openlib_torrent_indexer.py"))
    PyInstaller.__main__.run([
        script_path,
        '--name=OpenlibExtended',
        '--onefile',
        '--console',
        '--clean',
        '--noconfirm',
    ])
    print("[✓] Build complete: OpenlibExtended.exe")

if __name__ == "__main__":
    build()
