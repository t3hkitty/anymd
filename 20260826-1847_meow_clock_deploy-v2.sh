#!/bin/bash
# Zettelkasten ID: 20260826-1847
# Project: @lorik/meow-core
# Version: v2.0.0
# Role: rclone / FTP shell deployment script for VPS clock updates [cite: 1032]

VPS_HOST="141.148.134.195" # Oracle Cloud OCI VPS Target [cite: 745]
VPS_USER="ubuntu"
REMOTE_PATH="/home/ubuntu/app/packages/meow-core"
SSH_KEY="~/.ssh/id_ed25519_ocpkit"

echo "🛸 Starting Meow Melodramatic Clock v2 Deployment Sync..."

# Compile typescript configurations if package.json is present
if [ -f "package.json" ]; then
    echo "📦 Building project distribution workspace..."
    npm run build --if-present
fi

# Dry-run check for OCI server connectivity [cite: 1032]
ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$VPS_USER@$VPS_HOST" "mkdir -p $REMOTE_PATH"

if [ $? -eq 0 ]; then
    echo "🟢 VPS node reachable. Uploading refactored clock v2 components..."
    scp -i "$SSH_KEY" \
        MeowMelodramaticClockWidget-v2.tsx \
        meowClockState-v2.ts \
        deploy_meow_clock-v2.sh \
        README-v2.md \
        "$VPS_USER@$VPS_HOST:$REMOTE_PATH"
    echo "🚀 Clock v2 Deployment Completed Successfully!"
else
    echo "❌ Deployment Failed. Cannot reach OCI VPS Node."
    exit 1
fi
