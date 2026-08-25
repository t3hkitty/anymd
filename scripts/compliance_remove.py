#!/usr/bin/env python3
import sys
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: compliance_remove.py <file_path_or_pattern>")
        sys.exit(1)
        
    target = sys.argv[1]
    if os.path.exists(target):
        try:
            if os.path.isdir(target):
                # Clean directory or delete it
                import shutil
                shutil.rmtree(target)
                print(f"[COMPLIANCE] Deleted folder: {target}")
            else:
                os.remove(target)
                print(f"[COMPLIANCE] Deleted file: {target}")
        except Exception as e:
            print(f"Error executing takedown for {target}: {e}")
            sys.exit(1)
    else:
        print(f"[COMPLIANCE] Target {target} does not exist.")

if __name__ == "__main__":
    main()
