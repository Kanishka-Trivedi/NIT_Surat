#!/usr/bin/env pwsh
# Start script for seller dashboard - handles cleanup automatically

Write-Host "Cleaning up existing Node processes..." -ForegroundColor Yellow

# Kill all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Milliseconds 500

# Clear .next cache if exists
if (Test-Path ".next\dev\lock") {
    Write-Host "Removing lock file..." -ForegroundColor Yellow
    Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue
}

Write-Host "Starting Seller Dashboard on port 3001..." -ForegroundColor Green

# Start the dev server
npm run dev -- -p 3001
