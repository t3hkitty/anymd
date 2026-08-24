#!/usr/bin/env bash
# ==============================================================================
# sync-wishlist-vps.sh
# Synchronizes AnyMDDB Wishlist and Acquired EPUBs to a remote VPS / Cloud storage
# Usage: ./scripts/sync-wishlist-vps.sh [remote_name:destination_path]
# ==============================================================================

set -e

LOCAL_DIR="${ANYMD_LIBRARY_PATH:-./library}"
REMOTE_TARGET="${1:-myvps:/var/www/anymd-library}"

echo "[*] Synchronizing AnyMDDB catalog from '${LOCAL_DIR}' to '${REMOTE_TARGET}'..."

if command -v rclone >/dev/null 2>&1; then
    echo "[+] Using rclone to sync wishlist and downloads..."
    rclone sync "${LOCAL_DIR}" "${REMOTE_TARGET}" \
        --progress \
        --transfers 4 \
        --checkers 8 \
        --fast-list \
        --exclude ".DS_Store"
    echo "[SUCCESS] rclone sync completed."
elif command -v rsync >/dev/null 2>&1; then
    echo "[+] Using rsync over SSH..."
    rsync -avz --progress "${LOCAL_DIR}/" "${REMOTE_TARGET}/"
    echo "[SUCCESS] rsync sync completed."
else
    echo "[ERROR] Neither rclone nor rsync is installed."
    exit 1
fi
