#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# setup-termux-n8n.sh
# Complete bootstrap script for running local-only n8n on Android via Termux
# ==============================================================================

set -e

echo "[+] Updating Termux package repository..."
pkg update -y && pkg upgrade -y

echo "[+] Installing core runtime dependencies (Node.js LTS, Python, Build tools, OpenSSL)..."
pkg install -y nodejs-lts python build-essential git openssl termux-api termux-tools

echo "[+] Verifying Node.js and NPM versions..."
node -v
npm -v

echo "[+] Installing n8n and PM2 process supervisor globally..."
# SQLite build flags for ARM64 Android environment
export PYTHON=/data/data/com.termux/files/usr/bin/python
npm install -g pm2 n8n --unsafe-perm

echo "[+] Creating configuration directory (~/.n8n)..."
mkdir -p "$HOME/.n8n"
mkdir -p "$HOME/.n8n-ssl"
mkdir -p "$HOME/.termux/boot"

echo "[+] Creating Termux:Boot autostart hook..."
cat << 'BOOT_EOF' > "$HOME/.termux/boot/start-n8n-boot.sh"
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
pm2 resurrect
BOOT_EOF
chmod +x "$HOME/.termux/boot/start-n8n-boot.sh"

echo "[+] Acquiring Termux Wake Lock..."
termux-wake-lock

echo "======================================================================"
echo "[SUCCESS] n8n local environment is ready."
echo "To start n8n, run: ./scripts/start-n8n.sh"
echo "Or start via PM2: pm2 start n8n --name 'n8n-local' -- --tunnel=false"
echo "======================================================================"
