import os
import re

def rebrand_content(content):
    # Order matters: replace longer patterns first
    content = content.replace("Anymd", "Anymd")
    content = content.replace("Anymd", "Anymd")
    content = content.replace("anymd", "anymd")
    content = content.replace("Meow", "Meow")
    content = content.replace("meow", "meow")
    return content

def rename_file_path(path):
    dir_name = os.path.dirname(path)
    base_name = os.path.basename(path)
    
    new_base_name = base_name.replace("Anymd", "Anymd")
    new_base_name = new_base_name.replace("Anymd", "Anymd")
    new_base_name = new_base_name.replace("anymd", "anymd")
    new_base_name = new_base_name.replace("Meow", "Meow")
    new_base_name = new_base_name.replace("meow", "meow")
    
    if new_base_name != base_name:
        return os.path.join(dir_name, new_base_name)
    return path

def process_tree(root_dir):
    files_to_rename = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip git, node_modules, dist, .github
        normalized_dir = dirpath.replace("\\", "/")
        path_parts = normalized_dir.split("/")
        if any(p in path_parts for p in [".git", "node_modules", "dist"]):
            continue
            
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            # Read and replace content
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                
                new_content = rebrand_content(content)
                if new_content != content:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Rebranded content: {file_path}")
            except Exception as e:
                print(f"Error processing content of {file_path}: {e}")
            
            # Check for renaming
            new_path = rename_file_path(file_path)
            if new_path != file_path:
                files_to_rename.append((file_path, new_path))
                
    # Rename files (process after all contents are rebranded)
    for old_path, new_path in files_to_rename:
        try:
            os.rename(old_path, new_path)
            print(f"Renamed: {old_path} -> {new_path}")
        except Exception as e:
            print(f"Error renaming {old_path}: {e}")

if __name__ == "__main__":
    process_tree(".")
