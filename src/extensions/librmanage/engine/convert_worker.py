"""
convert_worker.py — Calibre Conversion Worker for Kittlibr librmanage
Normalizes exotic formats (FB2, MOBI, AZW3, DOCX, RTF) into clean EPUB 3 and Markdown
using Calibre's headless conversion pipeline in local C:\\ cache staging.
"""

import os
import subprocess
from typing import Optional, Dict, Any

CALIBRE_BIN_DIR = r"C:\Program Files\Calibre2"
EBOOK_CONVERT = os.path.join(CALIBRE_BIN_DIR, "ebook-convert.exe")


class ConvertWorker:
    def __init__(self, cache_staging_dir: str = r"C:\Users\lorik\AppData\Local\Temp\kittlibr_cache"):
        self.cache_staging_dir = cache_staging_dir
        os.makedirs(self.cache_staging_dir, exist_ok=True)

    def convert_to_epub3(self, input_file_path: str, output_file_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Converts any supported input format to EPUB 3 in the C:\\ cache staging folder.
        """
        base_name = os.path.splitext(os.path.basename(input_file_path))[0]
        out_name = output_file_name or f"{base_name}.epub"
        output_path = os.path.join(self.cache_staging_dir, out_name)

        cmd = [
            EBOOK_CONVERT if os.path.exists(EBOOK_CONVERT) else "ebook-convert",
            input_file_path,
            output_path,
            "--epub-version", "3",
            "--enable-heuristics",
            "--smarten-punctuation"
        ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
            return {
                "success": True,
                "output_path": output_path,
                "log": res.stdout[-500:] if res.stdout else "Conversion succeeded."
            }
        except subprocess.CalledProcessError as e:
            return {
                "success": False,
                "error": e.stderr[-500:] if e.stderr else str(e),
                "output_path": None
            }
        except FileNotFoundError:
            # Fallback if ebook-convert is not on PATH
            return {
                "success": False,
                "error": "Calibre ebook-convert binary not found. Please install Calibre in C:\\Program Files\\Calibre2.",
                "output_path": None
            }
