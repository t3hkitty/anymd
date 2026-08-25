#!/usr/bin/env python3
import sys
import re

# Sensitive patterns
PATTERNS = {
    "GITHUB_TOKEN": r"ghp_[a-zA-Z0-9]{36,40}",
    "GOOGLE_API_KEY": r"AIzaSy[a-zA-Z0-9_-]{33}",
    "BEARER_TOKEN": r"Bearer\s+[a-zA-Z0-9_\-\.\~+\/]+=*",
    "PRIVATE_KEY": r"-----BEGIN\s+?(?:RSA\s+?)?PRIVATE\s+?KEY-----[\s\S]+?-----END\s+?(?:RSA\s+?)?PRIVATE\s+?KEY-----",
    "EMAIL": r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+",
    "PHONE": r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
}

SPAM_KEYWORDS = [
    r"buy\s+cheap\s+viagra",
    r"online\s+casino",
    r"make\s+money\s+fast\s+online",
]

def scrub_text(text):
    # Scrub API keys, emails, phone numbers
    for name, pattern in PATTERNS.items():
        text = re.sub(pattern, f"[REDACTED_{name}]", text, flags=re.IGNORECASE)
    
    # Scrub spam keywords
    for pattern in SPAM_KEYWORDS:
        text = re.sub(pattern, "[REDACTED_SPAM]", text, flags=re.IGNORECASE)
        
    return text

def main():
    if len(sys.argv) < 2:
        print("Usage: scrub_pii_and_spam.py <file_path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        scrubbed = scrub_text(content)
        
        if scrubbed != content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(scrubbed)
            print(f"Scrubbed {file_path}")
        else:
            print(f"No PII/spam found in {file_path}")
    except Exception as e:
        print(f"Error reading/writing {file_path}: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
