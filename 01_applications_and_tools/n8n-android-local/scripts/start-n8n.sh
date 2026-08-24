#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# start-n8n.sh
# Production runner for local n8n daemon with memory caps and loopback bindings
# ==============================================================================

# Prevent Android CPU sleep
termux-wake-lock

# Network & Host Binding
export N8N_HOST="127.0.0.1"
export N8N_PORT=5678
export N8N_PROTOCOL="http"
export WEBHOOK_URL="http://127.0.0.1:5678/"

# Environment & Performance Optimization for Mobile ARM64
export NODE_OPTIONS="--max-old-space-size=1024"
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
export GENERIC_TIMEZONE="America/Los_Angeles"
export N8N_METRICS=false
export N8N_DIAGNOSTICS_ENABLED=false
export N8N_LOG_LEVEL="info"
export N8N_RUNNERS_ENABLED=false

echo "[*] Starting local n8n daemon on ${N8N_PROTOCOL}://${N8N_HOST}:${N8N_PORT}..."

if command -v pm2 >/dev/null 2>&1; then
    pm2 start n8n --name "n8n-local" -- --tunnel=false
    pm2 save
    echo "[+] n8n daemon launched under PM2 supervision."
else
    echo "[*] PM2 not detected, launching foreground process..."
    exec n8n start --tunnel=false
fi
