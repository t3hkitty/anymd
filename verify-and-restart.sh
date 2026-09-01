#!/bin/bash
# verify-and-restart.sh
# Autorecovery runner: validates server.js before reloading, rolls back to server.js.working if startup crashes.

WORKDIR="/home/ubuntu/app/text-webhook-gateway"
cd "$WORKDIR" || exit 1

# If there is no backup of a working version, make one if server is running
if [ ! -f "server.js.working" ]; then
    if [ -f "server.js" ]; then
        cp server.js server.js.working
    fi
fi

echo "🔍 Initiating syntax verification..."
if ! node --check server.js; then
    echo "❌ Syntax error detected in new server.js! Rolling back to last working version..."
    cp server.js.working server.js
    exit 1
fi

echo "🟢 Syntax OK. Preparing test boot..."
# Copy current to temp backup
cp server.js server.js.temp

# Restart service
echo "📡 Restarting anymd-webhook service..."
sudo systemctl restart anymd-webhook.service

# Wait 5 seconds to verify stability
sleep 5

# Check if active and healthy
STATUS=$(systemctl is-active anymd-webhook.service)
if [ "$STATUS" != "active" ]; then
    echo "🚨 Service crashed or failed to start! Rolling back to last known working state..."
    cp server.js.working server.js
    sudo systemctl restart anymd-webhook.service
    exit 1
else
    echo "🏆 Verification passed. Updating last known working snapshot."
    cp server.js.temp server.js.working
    rm -f server.js.temp
fi
