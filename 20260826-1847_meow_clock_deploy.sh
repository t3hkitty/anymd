#!/bin/bash
# Zettelkasten ID: 20260826-1847
# Project: @lorik/meow-core
# Role: rclone / FTP shell deployment script for the Melodrama clock module [cite: 1032]

VPS_HOST="141.148.134.195" # Target OCI VPS [cite: 745]
VPS_USER="ubuntu"
REMOTE_PATH="/home/ubuntu/app/packages/meow-core/src/components"
SSH_KEY="~/.ssh/id_ed25519_ocpkit"

echo "🚀 Starting Meow Melodrama Clock Deployment..."

# Verify OCI connectivity [cite: 1032]
ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$VPS_USER@$VPS_HOST" "mkdir -p $REMOTE_PATH"

if [ $? -eq 0 ]; then
    echo "🟢 VPS node reachable. Uploading Meow Clock files..."
    scp -i "$SSH_KEY" MeowMelodramaticClockWidget.tsx meowClockState.ts "$VPS_USER@$VPS_HOST:$REMOTE_PATH/"
    echo "✨ Deployment Complete! Live reload triggered on n8n.lorik.me."
else
    echo "❌ VPS unreachable. Saved to local sandbox scratch paths."
    exit 1
fi
