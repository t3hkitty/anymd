import os
import shutil

def deploy():
    print("🛸 Initializing AnyMD Widget Dashboard Deployment...")
    
    src_dir = "/workspace/scratch"
    out_dir = "/workspace/out"
    
    # Files to copy
    files = [
        "20260826-1610_anymd_widget_dashboard.tsx",
        "20260826-1611_anymd_widget_dashboard_deploy.py",
        "20260826-1612_anymd_widget_dashboard_readme.md"
    ]
    
    for filename in files:
        src_path = os.path.join(src_dir, filename)
        out_path = os.path.join(out_dir, filename)
        
        if os.path.exists(src_path):
            shutil.copy(src_path, out_path)
            print(f"🟢 Copied: {filename} -> {out_path}")
        else:
            print(f"⚠️ Source file not found: {filename}")
            
    print("🚀 Deployment Complete!")

if __name__ == "__main__":
    deploy()
