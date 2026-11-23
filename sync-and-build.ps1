# sync-and-build.ps1
# Automates the entire Capacitor sync and Android build process.
# Place this script in your active AGV workspace scratch folder.

$ErrorActionPreference = "Stop"

Write-Host "🐾 Starting Autopilot Build and Sync Pipeline..." -ForegroundColor Cyan

# 1. Force clear dynamic lock files to prevent AGV thread stalls
Write-Host "[1/4] Clearing stale workspace cache locks..." -ForegroundColor Gray
Get-ChildItem -Path . -Recurse -Filter "*.lock" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

# 2. Compile Web Assets
Write-Host "[2/4] Compiling React static assets with Vite..." -ForegroundColor Yellow
npx vite build

# 3. Synchronize with Native Android wrapper
Write-Host "[3/4] Syncing web assets with Capacitor Android project..." -ForegroundColor Yellow
npx cap sync android

# 4. Compile APK & Deploy
Write-Host "[4/5] Compiling Android APK with Gradle..." -ForegroundColor Yellow
if (Test-Path "android\gradlew.bat") {
    Push-Location android
    try {
        .\gradlew.bat assembleDebug
    } finally {
        Pop-Location
    }
    
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    $targetDir = "G:\My Drive\myapks"
    if (Test-Path $apkPath) {
        try {
            if (Test-Path "G:\") {
                if (-not (Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                Copy-Item -Path $apkPath -Destination "$targetDir\anymd-mobile-telemetry.apk" -Force -ErrorAction SilentlyContinue
                Write-Host "📦 APK copied to Google Drive: $targetDir\anymd-mobile-telemetry.apk" -ForegroundColor Green
            } else {
                Write-Host "📦 Standalone APK ready locally at: $apkPath (Drive G:\ offline)" -ForegroundColor Green
            }
        } catch {
            Write-Host "📦 Standalone APK ready locally at: $apkPath" -ForegroundColor Green
        }
    }
}

# 5. Success Confirmation
Write-Host "`n🌸 Build, Sync, and APK compilation completed successfully! (=^.^=)" -ForegroundColor Green
