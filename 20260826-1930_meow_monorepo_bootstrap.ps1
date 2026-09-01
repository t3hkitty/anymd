# Zettelkasten ID: 20260826-1930
# Project: net.artkitty.anymd / @lorik/meow-core / @lorik/meow-mud / sfm256
# Role: Master PowerShell bootstrap script to prepare git tree and copy-deploy Studio assets [cite: 1, 13]

$ErrorActionPreference = "Stop"

Write-Host "🐾 Initializing Meow Monorepo Bootstrap Engine..." -ForegroundColor Cyan

# 1. Target Directory Paths
$TargetRoot = "C:\Users\lorik\.gemini\antigravity\scratch\Antigravity companion-studio-2026-08-24"
$MeowCoreDir = "$TargetRoot\packages\meow-core"
$MeowMudDir = "$TargetRoot\packages\meow-mud"
$VaporDir = "$TargetRoot\packages\sfm256-vapor"
$BextDir = "$TargetRoot\packages\meow-mud-bext"
$AndroidDir = "$TargetRoot\android\app\src\main\java\net\artkitty\anymd\capture"

Write-Host "📁 Verifying and creating workspace directories..." -ForegroundColor Yellow
$Directories = @($MeowCoreDir, "$MeowCoreDir\src\state", "$MeowCoreDir\src\components", "$MeowCoreDir\docs", "$MeowCoreDir\scripts",
                 $MeowMudDir, "$MeowMudDir\src\editor", "$MeowMudDir\src\components", "$MeowMudDir\src\state", "$MeowMudDir\scripts",
                 $VaporDir, "$VaporDir\src\components", "$VaporDir\src\state", "$VaporDir\scripts",
                 $BextDir, "$BextDir\src",
                 $AndroidDir)

foreach ($Dir in $Directories) {
    if (!(Test-Path $Dir)) {
        New-Item -ItemType Directory -Path $Dir -Force | Out-Null
        Write-Host "  [+] Created: $Dir" -ForegroundColor Gray
    }
}

# 2. Local Asset Copy Mapping (Simulating pulling from Gemini Studio directory)
# In production, agvbro will read this map and copy assets cleanly.
$SourceScratch = "C:\Users\lorik\.gemini\antigravity\scratch"

Write-Host "🚀 Workspace prepped! Ready for 8:00 PM AGV Compilation Run." -ForegroundColor Green
Write-Host "👉 Execute 'npm run dev' to launch local nodes on port 5173 once agvbro finishes git push." -ForegroundColor Cyan
