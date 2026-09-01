# sync-and-build.ps1
# Automates the entire Capacitor sync and Android build process.
# Place this script in your active AGV workspace scratch folder.

$ErrorActionPreference = "Stop"

Write-Host "🛸 Starting Autopilot Build & Sync Pipeline..." -ForegroundColor Cyan

# 1. Force clear dynamic lock files to prevent AGV thread stalls
Write-Host "[1/4] Clearing stale AGV workspace cache locks..." -ForegroundColor Gray
Remove-Item -Recurse -Force "*.lock" -ErrorAction SilentlyContinue

# 2. Compile Web Assets
Write-Host "[2/4] Compiling React static assets (npm run build)..." -ForegroundColor Yellow
npm run build

# 3. Synchronize with Native Android wrapper
Write-Host "[3/4] Syncing web assets with Capacitor Android project..." -ForegroundColor Yellow
npx cap sync android

# 4. Success Confirmation
Write-Host "`n🌸 Build & Sync completed successfully! (=^.^=)" -ForegroundColor Green
Write-Host "👉 You can now run the Android build from Android Studio or let AGV compile the APK." -ForegroundColor Cyan
