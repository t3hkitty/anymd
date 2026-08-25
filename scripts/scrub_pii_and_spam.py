#!/usr/bin/env python3
import os
import re
import sys

# Define regex patterns for scrubbing
# Using custom replacement functions where needed (e.g. for EMAIL)
PATTERNS = {
    "GITHUB_TOKEN": (re.compile(r"ghp_[a-zA-Z0-9]{36,255}"), "[REDACTED_GITHUB_TOKEN]"),
    "GOOGLE_API_KEY": (re.compile(r"AIza[0-9A-Za-z-_]{35}"), "[REDACTED_GOOGLE_API_KEY]"),
    "BEARER_TOKEN": (re.compile(r"Bearer\s+[a-zA-Z0-9._\-+=]{15,}"), "Bearer [REDACTED_BEARER_TOKEN]"),
    "PHONE_US": (re.compile(r"\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b"), "[REDACTED_PHONE]"),
    "SPAM_CASINO": (re.compile(r"\b(?:casino|viagra|buy bitcoin|free crypto|betting online)\b", re.IGNORECASE), "[REDACTED_SPAM]")
}

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PRIVATE_KEY_PATTERN = re.compile(
    r"-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----\r?\n[\s\S]+?-----END(?: [A-Z]+)? PRIVATE KEY-----"
)

# Placeholder email domains to ignore
IGNORE_EMAIL_DOMAINS = {"example.com", "domain.com", "yourdomain.com", "myprovider.com"}

def scrub_email(match) -> str:
    email = match.group(0)
    domain = email.split("@")[-1].lower()
    if domain in IGNORE_EMAIL_DOMAINS:
        return email
    return "[REDACTED_EMAIL]"

def scrub_content(content: str) -> tuple[str, bool]:
    modified = False
    
    # First scrub private keys block
    if PRIVATE_KEY_PATTERN.search(content):
        content = PRIVATE_KEY_PATTERN.sub("[REDACTED_PRIVATE_KEY]", content)
        modified = True

    # Scrub inline patterns
    for label, (pattern, replacement) in PATTERNS.items():
        if pattern.search(content):
            content = pattern.sub(replacement, content)
            modified = True

    # Scrub email pattern with domain check
    if EMAIL_PATTERN.search(content):
        new_content = EMAIL_PATTERN.sub(scrub_email, content)
        if new_content != content:
            content = new_content
            modified = True
            
    return content, modified

def scrub_file(file_path: str) -> None:
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        scrubbed, modified = scrub_content(content)
        
        if modified:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(scrubbed)
            print(f"Scrubbed: {file_path}")
    except Exception as e:
        print(f"Error reading/writing {file_path}: {e}")

def walk_and_scrub(target_dir: str) -> None:
    for root, dirs, files in os.walk(target_dir):
        # Skip node_modules, .git, and binary cache dirs
        if any(ignored in root for ignored in ["node_modules", ".git", "__pycache__", ".gradle", "gradle", "build", "dist", "out"]):
            continue
        
        for file in files:
            file_path = os.path.join(root, file)
            # Skip python/script/config/binary files to avoid self-redaction of patterns and corruption
            if file.endswith((".py", ".yml", ".json", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".zip", ".jar", ".tar.gz", ".mp3", ".mp4", ".pdf", ".woff", ".woff2", ".ttf", ".eot")):
                continue
            scrub_file(file_path)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    print(f"Scanning target path: {target}")
    walk_and_scrub(target)
    print("Scrubbing process completed.")
