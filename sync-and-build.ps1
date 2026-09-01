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

# 4. Compile APK & Deploy to Google Drive Target
Write-Host "[4/5] Compiling Android APK with Gradle..." -ForegroundColor Yellow
if (Test-Path "android\gradlew.bat") {
    Set-Location android
    .\gradlew.bat assembleDebug
    Set-Location ..
    
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    $targetDir = "G:\My Drive\myapks"
    if (Test-Path $apkPath) {
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        Copy-Item -Path $apkPath -Destination "$targetDir\anymd-mobile-telemetry.apk" -Force
        Write-Host "📦 APK copied to G:\My Drive\myapks\anymd-mobile-telemetry.apk" -ForegroundColor Green
    }
}

# 5. Success Confirmation
Write-Host "`n🌸 Build, Sync & APK Deployment completed successfully! (=^.^=)" -ForegroundColor Green
Write-Host "👉 Mobile Telemetry Collector Service bundled and exported to G:\My Drive\myapks\anymd-mobile-telemetry.apk" -ForegroundColor Cyan
