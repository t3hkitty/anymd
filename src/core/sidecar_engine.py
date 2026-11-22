"""
AnyMD High-Performance Python Sidecar & Sharded Index Engine (`sidecar_engine.py`)
Uses os.scandir, C-backed PyYAML (CSafeLoader/CSafeDumper), xxhash, and atomic os.replace.
"""

import os
import tempfile
from pathlib import Path
from typing import Dict, Any, List, Optional
import xxhash

try:
    import yaml
    # Use C-backed CSafeLoader / CSafeDumper if available for maximum speed
    YAML_LOADER = getattr(yaml, 'CSafeLoader', yaml.SafeLoader)
    YAML_DUMPER = getattr(yaml, 'CSafeDumper', yaml.SafeDumper)
except ImportError:
    import yaml
    YAML_LOADER = yaml.SafeLoader
    YAML_DUMPER = yaml.SafeDumper


class SidecarEngine:
    def __init__(self, vault_root: str = "./sandbox_vault", mode: str = "anymd-subfolder"):
        self.vault_root = Path(vault_root)
        self.mode = mode # 'side-by-side' or 'anymd-subfolder'

    def compute_xxhash(self, file_path: Path) -> str:
        """Compute fast xxhash64 for file drift detection"""
        h = xxhash.xxh64()
        try:
            with open(file_path, "rb") as f:
                while chunk := f.read(8192):
                    h.update(chunk)
            return h.hexdigest()
        except Exception:
            return "error-hash"

    def get_sidecar_path(self, target_file: Path) -> Path:
        """Determine sidecar path based on placement mode"""
        if self.mode == 'side-by-side':
            return target_file.with_suffix(target_file.suffix + '.md')
        else:
            anymd_dir = target_file.parent / '.anymd'
            return anymd_dir / f"{target_file.name}.md"

    def atomic_write_yaml(self, file_path: Path, data: Dict[str, Any]) -> None:
        """Atomic write using tempfile and os.replace to prevent cloud sync corruption"""
        file_path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_path = tempfile.mkstemp(dir=file_path.parent, prefix=".tmp-anymd-")
        try:
            with os.fdopen(fd, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, Dumper=YAML_DUMPER, default_flow_style=False)
            os.replace(tmp_path, file_path)
        except Exception as e:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            raise e

    def read_yaml(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Read YAML sidecar with C-backed loader"""
        if not file_path.exists():
            return None
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return yaml.load(f, Loader=YAML_LOADER)
        except Exception:
            return None

    def scan_and_index_directory(self, dir_path: Optional[Path] = None) -> List[Dict[str, Any]]:
        """High-performance directory scanner using os.scandir"""
        target_dir = dir_path or self.vault_root
        results = []

        if not target_dir.exists():
            return results

        # Non-recursive or recursive scan using os.scandir
        with os.scandir(target_dir) as it:
            for entry in it:
                if entry.name.startswith('.'):
                    continue # Skip hidden folders like .anymd during raw file scan
                if entry.is_file():
                    p = Path(entry.path)
                    file_hash = self.compute_xxhash(p)
                    stat = entry.stat()
                    record = {
                        "path": str(p.relative_to(self.vault_root)),
                        "size": stat.st_size,
                        "mtime": stat.st_mtime,
                        "xxhash": file_hash
                    }
                    results.append(record)
                elif entry.is_dir():
                    results.extend(self.scan_and_index_directory(Path(entry.path)))

        return results
