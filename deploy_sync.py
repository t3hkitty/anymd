#!/usr/bin/env python3
"""
deploy_sync.py
==============
Automated file deployment and synchronization script for ocpkit VPS nodes.
Supports localized sync configurations, file-exclusion maps, and secure SFTP
pipelines using python paramiko or fallback rsync engines.
"""

import os
import sys
import argparse
import subprocess

def parse_args():
    parser = argparse.ArgumentParser(description="Synchronize files with the ocpkit VPS node.")
    parser.add_argument("--host", default="147.224.55.189", help="Target VPS public IP address.")
    parser.add_argument("--user", default="ubuntu", help="Remote username.")
    parser.add_argument("--key", default=os.path.expanduser("~/.ssh/id_ed25519_ocpkit"), help="Path to local private key.")
    parser.add_argument("--source", default="./", help="Local directory path to sync.")
    parser.add_argument("--dest", default="/home/ubuntu/app", help="Remote destination path.")
    parser.add_argument("--dry-run", action="store_true", help="Perform a dry run without modifying files.")
    return parser.parse_args()

def verify_local_key(key_path):
    if not os.path.exists(key_path):
        print(f"❌ Error: Local private key not found at {key_path}")
        print("👉 Action: Run setup-ocpkit-ed25519-v7.ps1 to generate your keypair.")
        return False
    return True

def run_rsync_sync(args):
    print(f"📡 Initializing rsync synchronization channel...")
    print(f"Source Directory:      {args.source}")
    print(f"Destination Node:      {args.user}@{args.host}:{args.dest}")
    print(f"Cryptographic Channel:  {args.key}")
    
    # Exclusions configuration
    exclusions = [
        ".git/",
        "node_modules/",
        "*.key",
        "*.key.pub",
        ".env",
        "__pycache__/",
        "*.log"
    ]
    
    # Construct rsync command
    rsync_cmd = [
        "rsync", "-avz",
        "--delete",  # Delete files on dest that don't exist locally
        "-e", f"ssh -i {args.key} -o StrictHostKeyChecking=no"
    ]
    
    for excl in exclusions:
        rsync_cmd.extend(["--exclude", excl])
        
    if args.dry_run:
        rsync_cmd.append("--dry-run")
        print("🧪 RUNNING IN DRY RUN MODE (No files will be changed)")
        
    rsync_cmd.extend([args.source, f"{args.user}@{args.host}:{args.dest}"])
    
    try:
        process = subprocess.run(rsync_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        print("🎉 SYNCHRONIZATION PIPELINE EXECUTED SUCCESSFULLY!")
        print("\033[0;32m" + process.stdout + "\033[0m")
    except subprocess.CalledProcessError as e:
        print("❌ Error: Synchronization failed!")
        print("\033[0;31m" + e.stderr + "\033[0m")
        print("\n💡 Troubleshooting Tip:")
        print("If rsync is missing on Windows, run 'ssh -i <key> ubuntu@<ip>' to test raw SSH, and consider installing rsync via Scoop/Choco.")
        sys.exit(1)

def main():
    args = parse_args()
    print("=====================================================================")
    print("🛸 OCPKIT VPS SECURE REPLICATION & DEPLOYMENT ENGINE")
    print("=====================================================================")
    
    if not verify_local_key(args.key):
        sys.exit(1)
        
    run_rsync_sync(args)

if __name__ == "__main__":
    main()
