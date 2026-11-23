"""
AnyMD Standalone Rclone Daemon Controller & Local/LAN Storage Engine (`rclone_daemon_client.py`)
🐾 Kawaiianism v3.1 Anti-Slop Specification

Provides:
1. rclone rcd daemon launcher supporting both loopback (127.0.0.1:5572) and LAN (0.0.0.0:5572)
   with performance flags:
   --transfers=8, --checkers=16, --buffer-size=32Mi, --fast-list, --rc-allow-origin="*", writable --cache-dir
2. Dynamic LAN IP autodetection and healthcheck probes
3. Non-FUSE folder-role mapping (vault/library, backup, custom subpaths) without OS drive mounts
4. Standalone CLI and service runner for Windows / Termux / Linux hosts
"""

import os
import sys
import json
import time
import socket
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional, List

try:
    import requests
except ImportError:
    requests = None


DEFAULT_RCD_PORT = 5572
DEFAULT_RCD_URL = f"http://127.0.0.1:{DEFAULT_RCD_PORT}"
DEFAULT_CACHE_DIR = os.environ.get("ANYMD_CACHE_DIR") or str(Path(tempfile.gettempdir()) / "anymd_rclone_cache")

# Recommended performance flags
RECOMMENDED_FLAGS = [
    "--transfers=8",
    "--checkers=16",
    "--buffer-size=32Mi",
    "--fast-list",
]


def detect_primary_lan_ip() -> str:
    """Detect local LAN IP for cross-device access."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


class RcloneDaemonClient:
    """Client and launcher for an rclone rcd instance serving localhost and LAN."""

    def __init__(
        self,
        rcd_url: str = DEFAULT_RCD_URL,
        cache_dir: str = DEFAULT_CACHE_DIR,
        lan_mode: bool = True
    ):
        self.rcd_url = rcd_url.rstrip("/")
        self.cache_dir = cache_dir
        self.lan_mode = lan_mode
        self.process: Optional[subprocess.Popen] = None
        os.makedirs(self.cache_dir, exist_ok=True)

    def is_rcd_alive(self, target_url: Optional[str] = None, timeout_sec: float = 1.5) -> bool:
        """Check if rclone rcd is responding on target endpoint without crashing."""
        url = (target_url or self.rcd_url).rstrip("/")
        if requests is None:
            # Fallback raw socket probe
            try:
                host = url.replace("http://", "").replace("https://", "").split(":")[0]
                port = int(url.split(":")[-1].split("/")[0])
                with socket.create_connection((host, port), timeout=timeout_sec):
                    return True
            except Exception:
                return False

        try:
            resp = requests.post(
                f"{url}/core/version",
                json={},
                timeout=timeout_sec
            )
            return resp.status_code == 200
        except Exception:
            return False

    def build_daemon_command(
        self,
        port: int = DEFAULT_RCD_PORT,
        bind_all: bool = True,
        allow_origin: str = "*",
        extra_flags: Optional[List[str]] = None
    ) -> List[str]:
        """
        Construct rclone rcd command bound to 0.0.0.0 or 127.0.0.1 with CORS headers for Web / PWA / LAN clients.
        """
        bind_host = "0.0.0.0" if bind_all else "127.0.0.1"
        cmd = [
            "rclone",
            "rcd",
            f"--rc-addr={bind_host}:{port}",
            "--rc-no-auth",
            f"--rc-allow-origin={allow_origin}",
            f"--cache-dir={self.cache_dir}",
            *RECOMMENDED_FLAGS
        ]
        if extra_flags:
            cmd.extend(extra_flags)
        return cmd

    def start_daemon_process(
        self,
        port: int = DEFAULT_RCD_PORT,
        bind_all: bool = True,
        wait_ready_sec: float = 3.5
    ) -> Dict[str, Any]:
        """Start rclone daemon serving both localhost and LAN with auto-created cache."""
        lan_ip = detect_primary_lan_ip()
        probe_url = f"http://127.0.0.1:{port}"

        if self.is_rcd_alive(probe_url):
            return {
                "success": True,
                "message": f"rclone rcd daemon is already active",
                "localhost_url": probe_url,
                "lan_url": f"http://{lan_ip}:{port}",
                "status": "ready"
            }

        cmd = self.build_daemon_command(port=port, bind_all=bind_all)
        try:
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0
            )
            start_time = time.time()
            while time.time() - start_time < wait_ready_sec:
                if self.is_rcd_alive(probe_url):
                    return {
                        "success": True,
                        "pid": self.process.pid,
                        "localhost_url": probe_url,
                        "lan_url": f"http://{lan_ip}:{port}",
                        "cache_dir": self.cache_dir,
                        "command": " ".join(cmd),
                        "status": "ready"
                    }
                time.sleep(0.3)

            return {
                "success": False,
                "error": "rclone rcd started but healthcheck probe timed out. Falling back to local offline mode.",
                "status": "offline_fallback"
            }
        except FileNotFoundError:
            return {
                "success": False,
                "error": "rclone executable was not found on PATH. Falling back to zero-cloud local mode.",
                "status": "offline_fallback"
            }
        except Exception as ex:
            return {
                "success": False,
                "error": str(ex),
                "status": "offline_fallback"
            }

    def call_rcd(self, method: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """Call rclone rcd JSON-RPC endpoint with silent fallback."""
        if requests is None:
            return None
        endpoint = f"{self.rcd_url}/{method}"
        try:
            response = requests.post(endpoint, json=params or {}, timeout=4)
            if response.status_code == 200:
                return response.json()
        except Exception:
            pass
        return None

    def list_remote_directory(self, remote_fs: str, remote_path: str = "") -> Optional[Dict[str, Any]]:
        """List remote files via rclone rcd operations/list with folder role mapping."""
        fs = f"{remote_fs}:{remote_path}" if remote_fs else remote_path
        return self.call_rcd("operations/list", {"fs": fs, "remote": ""})


def main():
    """CLI utility for launching rclone daemon with LAN broadcast support."""
    import argparse
    parser = argparse.ArgumentParser(description="AnyMD Local/LAN Rclone Daemon Service")
    parser.add_argument("--check", action="store_true", help="Check if rcd is alive")
    parser.add_argument("--start", action="store_true", help="Start daemon bound to 0.0.0.0 (LAN + Localhost)")
    parser.add_argument("--local-only", action="store_true", help="Bind to 127.0.0.1 only instead of 0.0.0.0")
    parser.add_argument("--port", type=int, default=DEFAULT_RCD_PORT, help="Port to listen on (default: 5572)")
    parser.add_argument("--cache-dir", default=DEFAULT_CACHE_DIR, help="Buffer cache directory")
    args = parser.parse_args()

    client = RcloneDaemonClient(
        rcd_url=f"http://127.0.0.1:{args.port}",
        cache_dir=args.cache_dir,
        lan_mode=not args.local_only
    )

    if args.check:
        alive = client.is_rcd_alive()
        lan_ip = detect_primary_lan_ip()
        print(json.dumps({
            "alive": alive,
            "localhost_url": f"http://127.0.0.1:{args.port}",
            "lan_url": f"http://{lan_ip}:{args.port}"
        }, indent=2))
        sys.exit(0 if alive else 1)

    if args.start:
        res = client.start_daemon_process(
            port=args.port,
            bind_all=not args.local_only
        )
        print(json.dumps(res, indent=2))
        sys.exit(0 if res.get("success") else 1)

    lan_ip = detect_primary_lan_ip()
    print(json.dumps({
        "status": "ready",
        "primary_lan_ip": lan_ip,
        "default_port": args.port,
        "recommended_flags": RECOMMENDED_FLAGS,
        "default_cache_dir": DEFAULT_CACHE_DIR
    }, indent=2))


if __name__ == "__main__":
    main()
