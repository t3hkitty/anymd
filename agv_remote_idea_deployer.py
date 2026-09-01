import os
import sys
import time
import asyncio
import logging
import shutil
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
from google.antigravity.hooks import policy

# Logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

WATCH_DIR = os.path.expanduser("~/.antigravity/incoming_ideas")
PROCESSED_DIR = os.path.expanduser("~/.antigravity/processed_ideas")

async def deploy_idea(file_path):
    logging.info(f"[*] Deploying idea from file: {file_path}")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            blueprint_content = f.read()
    except Exception as e:
        logging.error(f"[!] Failed to read file {file_path}: {e}")
        return False

    # Goal Mode with fully permissive capabilities and policies
    config = LocalAgentConfig(
        system_instructions=(
            "You are an autonomous engineering assistant. Implement the features, "
            "write tests, and verify deployment as described in this blueprint. "
            "Write a detailed walkthrough.md when finished."
        ),
        capabilities=CapabilitiesConfig(),
        policies=[policy.allow_all()]
    )

    try:
        async with Agent(config=config) as agent:
            response = await agent.chat(blueprint_content)
            logging.info("[*] Agent run completed.")
            print(await response.text())
            return True
    except Exception as e:
        logging.error(f"[!] Error running agent: {e}")
        return False

async def watch_loop():
    os.makedirs(WATCH_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    logging.info(f"[*] Watching directory: {WATCH_DIR}")

    while True:
        try:
            if os.path.exists(WATCH_DIR):
                files = [f for f in os.listdir(WATCH_DIR) if f.endswith(".md")]
                for file in files:
                    file_path = os.path.join(WATCH_DIR, file)
                    logging.info(f"[+] Found new blueprint: {file}")
                    
                    success = await deploy_idea(file_path)
                    
                    dest_path = os.path.join(PROCESSED_DIR, file)
                    if os.path.exists(dest_path):
                        base, ext = os.path.splitext(file)
                        dest_path = os.path.join(PROCESSED_DIR, f"{base}_{int(time.time())}{ext}")
                    
                    shutil.move(file_path, dest_path)
                    logging.info(f"[*] Moved blueprint to: {dest_path}")
        except Exception as e:
            logging.error(f"[!] Error in watch loop: {e}")

        await asyncio.sleep(5)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--watch":
        asyncio.run(watch_loop())
    else:
        print("Usage: python3 agv_remote_idea_deployer.py --watch")
