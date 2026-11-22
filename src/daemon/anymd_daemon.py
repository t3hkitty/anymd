"""
AnyMD FastAPI Loopback Daemon (`anymd_daemon.py`)
Runs locally on 127.0.0.1:3050. Cross-platform (Windows, Termux, Linux).
Integrates with sidecar engine, librmanage hooks, and rclone rcd.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from pathlib import Path
import uvicorn

import sys
import os

# Add src to python path
sys.path.append(str(Path(__file__).parent.parent))

from core.sidecar_engine import SidecarEngine
from core.rclone_daemon_client import RcloneDaemonClient

app = FastAPI(
    title="AnyMD Universal Loopback Daemon",
    version="3.8.1-python",
    description="Cross-platform Python 3.11+ Markdown/YAML SQL replacement & cloud-efficient indexer"
)

engine = SidecarEngine(vault_root="./sandbox_vault", mode="anymd-subfolder")
rclone_client = RcloneDaemonClient(rcd_url="http://127.0.0.1:5572")

class WriteSidecarRequest(BaseModel):
    file_path: str
    metadata: Dict[str, Any]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AnyMD Python Loopback Daemon",
        "version": "3.8.1",
        "vault_root": str(engine.vault_root)
    }

@app.get("/scan")
def scan_vault():
    """Scan vault using high-performance os.scandir and xxhash"""
    records = engine.scan_and_index_directory()
    return {
        "total_scanned": len(records),
        "records": records
    }

@app.get("/rclone/status")
def rclone_status():
    """Check connection to local rclone rcd daemon (127.0.0.1:5572)"""
    res = rclone_client.list_remote_directory("gdrive-cold", "")
    connected = res is not None
    return {
        "rclone_rcd_connected": connected,
        "endpoint": "http://127.0.0.1:5572",
        "raw_response": res
    }

@app.post("/sidecar/write")
def write_sidecar(req: WriteSidecarRequest):
    """Atomic write of sidecar YAML/Markdown metadata"""
    target = engine.vault_root / req.file_path
    sidecar_path = engine.get_sidecar_path(target)
    try:
        engine.atomic_write_yaml(sidecar_path, req.metadata)
        return {"success": True, "sidecar_path": str(sidecar_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("anymd_daemon:app", host="127.0.0.1", port=3050, reload=True)
