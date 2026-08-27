#!/usr/bin/env python3
/**
 * deploy_unified.py - Data-Driven Reusable FTP Deployment Script
 * Coordinates uploading compiled Vite/React assets safely to public_html remote paths.
 * Reads configurations from a local meow.config.json (to prevent secret leaks to Git).
 */

import os
import sys
import json
import ftplib
from pathlib import Path

CONFIG_FILENAME = "meow.config.json"

def load_deployment_config():
    config_path = Path(__file__).parent / CONFIG_FILENAME
    if not config_path.exists():
        # Create a helper template
        example_config = {
            "ftp_host": "ftp.us.stackcp.com",
            "ftp_user": "kitty@artkitty.net",
            "ftp_pass": "YOUR_PASS_HERE",
            "local_dist_dir": "./dist",
            "remote_webroot": "/public_html/meow/lcmd"
        }
        with open(config_path, "w") as f:
            json.dump(example_config, f, indent=4)
        print(f"[!] Created example deployment config '{CONFIG_FILENAME}'. Please populate credentials locally.")
        sys.exit(0)
    
    with open(config_path, "r") as f:
        return json.load(f)

def upload_directory_recursive(ftp, local_dir, remote_dir):
    try:
        ftp.mkd(remote_dir)
        print(f"[+] Created remote folder: {remote_dir}")
    except Exception:
        pass # Directory already exists
        
    for item in os.listdir(local_dir):
        local_path = os.path.join(local_dir, item)
        remote_path = f"{remote_dir}/{item}"
        
        if os.path.isdir(local_path):
            upload_directory_recursive(ftp, local_path, remote_path)
        else:
            with open(local_path, "rb") as f:
                ftp.storbinary(f"STOR {remote_path}", f)
            print(f" -> Uploaded: {item} -> {remote_path}")

def main():
    print("=== UNIFIED SOVEREIGN FTP DEPLOYER ===")
    config = load_deployment_config()
    
    local_dist = Path(config["local_dist_dir"])
    if not local_dist.exists():
        print(f"[ERROR] Local build directory '{local_dist}' not found! Run npm run build first.")
        sys.exit(1)
        
    print(f"[*] Connecting to FTP server: {config['ftp_host']}...")
    try:
        with ftplib.FTP(config["ftp_host"]) as ftp:
            ftp.login(user=config["ftp_user"], passwd=config["ftp_pass"])
            print("[+] Authenticated successfully with remote server.")
            
            print(f"[*] Mirroring local '{local_dist}' to '{config['remote_webroot']}'...")
            upload_directory_recursive(ftp, str(local_dist), config["remote_webroot"])
            
            print("\n🎉 ALL TARGET DIRECTORIES SUCCESSFULLY SYNCED WITH FRESH BAKED BUILD!")
            print(f"Live Portal: https://meow.artkitty.net")
    except Exception as e:
        print(f"[FATAL] Deployment failed: {str(e)}")
        print("[!] Note: Midphase shared hosting has standard 'FTP Security Locking' enabled.")
        print("[!] Make sure to log into StackCP panel and click 'Unlock FTP' for your current IP.")

if __name__ == "__main__":
    main()
