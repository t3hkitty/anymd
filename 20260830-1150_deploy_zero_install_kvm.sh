#!/bin/bash
# automated zero-host KVM deployment script
set -e

echo "🐙 Compiling Zero-Host KVM Frontend Assets..."
npm run build

echo "🚀 Syncing builds to local Google Drive backup..."
mkdir -p "/mnt/g/My Drive/myapks"
cp -r ./dist/* "/mnt/g/My Drive/myapks/"

echo "🎀 Hot deploying assets to remote OCI Ubuntu VPS..."
rsync -avz --delete ./dist/ ubuntu@141.148.134.195:/var/www/meow.artkitty.net/html/kvm/

echo "🎉 Success! Deployment sequence complete."
