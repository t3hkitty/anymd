"""
AnyMD Rclone Daemon Client (`rclone_daemon_client.py`)
Connects to rclone rcd loopback daemon (127.0.0.1:5572) for non-FUSE cloud sync and listing.
"""

import requests
from typing import Dict, Any, Optional

class RcloneDaemonClient:
    def __init__(self, rcd_url: str = "http://127.0.0.1:5572"):
        self.rcd_url = rcd_url

    def call_rcd(self, method: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Call rclone rcd JSON-RPC endpoint"""
        endpoint = f"{self.rcd_url}/{method}"
        try:
            response = requests.post(endpoint, json=params, timeout=5)
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"[RcloneClient] Connection warning to rcd at {endpoint}: {e}")
        return None

    def list_remote_directory(self, remote_fs: str, remote_path: str = "") -> Optional[Dict[str, Any]]:
        """List remote files via rclone rcd operations/list"""
        return self.call_rcd("operations/list", {"fs": f"{remote_fs}:{remote_path}", "remote": ""})
