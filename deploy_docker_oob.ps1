# AnyMD Out-Of-The-Box (OOB) Docker Deployment Script (PowerShell)
# 🐾 Kawaiianism v3.1 Anti-Slop Specification

$ErrorActionPreference = "Stop"

Write-Host "🐾 [AnyMD OOB Docker Deployer] Checking container runtime environment..." -ForegroundColor Cyan

if (Get-Command docker -ErrorAction SilentlyContinue) {
    $runtime = "docker"
} elseif (Get-Command podman -ErrorAction SilentlyContinue) {
    $runtime = "podman"
} else {
    Write-Error "❌ Error: Neither docker nor podman was found on PATH."
    exit 1
}

if (-not (Test-Path "sandbox_vault\.anymd")) {
    New-Item -ItemType Directory -Path "sandbox_vault\.anymd" -Force | Out-Null
}

Write-Host "🌸 Building and starting AnyMD standalone container..." -ForegroundColor Magenta

try {
    docker compose up -d --build
} catch {
    Write-Host "Fallback to direct container build and run..." -ForegroundColor Yellow
    & $runtime build -t anymd-standalone:latest .
    & $runtime run -d --name anymd-standalone --restart unless-stopped -p 8080:80 -v "${PWD}\sandbox_vault:/data/vault" anymd-standalone:latest
}

Write-Host "`n✨ AnyMD deployed successfully OOB!" -ForegroundColor Green
Write-Host "👉 Open http://localhost:8080 in your browser to access AnyMD Local-First Mode." -ForegroundColor Cyan
