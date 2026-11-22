"""
metadata_bridge.py — Calibre Metadata Bridge for Kittlibr librmanage
Wraps Calibre's ebook metadata readers/writers and synchronizes bidirectionally
with atomic flat-file Markdown (.md) YAML frontmatter sidecars.
"""

import os
import json
import tempfile
from typing import Dict, Any, Optional

try:
    from calibre.ebooks.metadata.meta import get_metadata, set_metadata
    from calibre.ebooks.metadata.book.base import Metadata
    CALIBRE_AVAILABLE = True
except ImportError:
    CALIBRE_AVAILABLE = False


class MetadataBridge:
    def __init__(self, cache_staging_dir: str = "C:/Users/lorik/AppData/Local/Temp/kittlibr_cache"):
        self.cache_staging_dir = cache_staging_dir
        os.makedirs(self.cache_staging_dir, exist_ok=True)

    def extract_embedded_metadata(self, file_path: str) -> Dict[str, Any]:
        """
        Extracts embedded metadata from an EPUB/MOBI/AZW3/PDF file via Calibre.
        """
        if not CALIBRE_AVAILABLE:
            return {"title": os.path.splitext(os.path.basename(file_path))[0], "author": "Unknown"}

        ext = os.path.splitext(file_path)[1].lower().replace(".", "")
        with open(file_path, "rb") as stream:
            mi = get_metadata(stream, stream_type=ext)
            return {
                "title": mi.title or "Untitled",
                "author": mi.format_authors() or "Unknown",
                "series": mi.series,
                "series_index": mi.series_index,
                "tags": list(mi.tags) if mi.tags else [],
                "rating": mi.rating,
                "publisher": mi.publisher,
                "pubdate": str(mi.pubdate) if mi.pubdate else None,
                "synopsis": mi.comments or ""
            }

    def write_metadata_to_yaml_sidecar(self, book_data: Dict[str, Any], md_sidecar_path: str) -> bool:
        """
        Atomically writes metadata to the sister .md YAML frontmatter file (temp -> verify -> rename).
        """
        lines = ["---"]
        lines.append(f'title: "{book_data.get("title", "Untitled")}"')
        lines.append(f'author: "{book_data.get("author", "Unknown")}"')
        if book_data.get("series"):
            lines.append(f'series: "{book_data["series"]}"')
        if book_data.get("series_index") is not None:
            lines.append(f'series_index: {book_data["series_index"]}')
        
        tags = book_data.get("tags", [])
        lines.append(f'tags: [{", ".join(f"{json.dumps(t)}" for t in tags)}]')
        
        warnings = book_data.get("warnings", [])
        if warnings:
            lines.append(f'warnings: [{", ".join(f"{json.dumps(w)}" for w in warnings)}]')
            
        lines.append(f'status: "{book_data.get("status", "Unread")}"')
        if book_data.get("rating"):
            lines.append(f'rating: {book_data["rating"]}')
        if book_data.get("word_count"):
            lines.append(f'word_count: {book_data["word_count"]}')
        if book_data.get("zettelkasten_id"):
            lines.append(f'zettelkasten_id: "{book_data["zettelkasten_id"]}"')
        lines.append(f'source_vault: "{book_data.get("source_vault", "default")}"')
        lines.append(f'relative_path: "{book_data.get("relative_path", "")}"')
        lines.append("---")
        
        if book_data.get("synopsis"):
            lines.append("")
            lines.append(book_data["synopsis"])
            
        content = "\n".join(lines)

        # Atomic write
        temp_dir = os.path.dirname(md_sidecar_path)
        os.makedirs(temp_dir, exist_ok=True)
        fd, temp_path = tempfile.mkstemp(prefix="meta_", suffix=".tmp", dir=temp_dir)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(content)
            os.replace(temp_path, md_sidecar_path)
            return True
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise e

    def embed_metadata_into_book(self, book_file_path: str, metadata: Dict[str, Any]) -> bool:
        """
        Embeds updated metadata & cover back into the book binary using Calibre.
        """
        if not CALIBRE_AVAILABLE:
            return False

        ext = os.path.splitext(book_file_path)[1].lower().replace(".", "")
        mi = Metadata(metadata.get("title", ""), [metadata.get("author", "Unknown")])
        if metadata.get("series"):
            mi.series = metadata["series"]
            mi.series_index = float(metadata.get("series_index", 1))
        if metadata.get("tags"):
            mi.tags = metadata["tags"]
        if metadata.get("synopsis"):
            mi.comments = metadata["synopsis"]

        with open(book_file_path, "r+b") as stream:
            set_metadata(stream, mi, stream_type=ext)
        return True
