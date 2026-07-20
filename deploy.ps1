# DeskAI - Script de despliegue a produccion
param(
  [string]$Mode = "build"
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== DeskAI - Despliegue a Produccion ===" -ForegroundColor Cyan
Write-Host "Modo: $Mode" -ForegroundColor Cyan

if ($Mode -eq "build" -or $Mode -eq "all") {
  # 1. Instalar dependencias
  Write-Host "`n[1/4] Instalando dependencias del backend..." -ForegroundColor Yellow
  Set-Location "$rootDir\backend"
  npm install

  Write-Host "`n[2/4] Instalando dependencias del frontend..." -ForegroundColor Yellow
  Set-Location "$rootDir\frontend"
  npm install

  # 2. Compilar backend
  Write-Host "`n[3/4] Compilando backend..." -ForegroundColor Yellow
  Set-Location "$rootDir\backend"
  npm run build

  # 3. Compilar frontend
  Write-Host "`n[4/4] Compilando frontend (Next.js)..." -ForegroundColor Yellow
  Set-Location "$rootDir\frontend"
  npm run build

  Set-Location $rootDir
  Write-Host "`n=== Build completado exitosamente ===" -ForegroundColor Green
  Write-Host "Backend: $rootDir\backend\dist" -ForegroundColor Green
  Write-Host "Frontend: $rootDir\frontend\.next" -ForegroundColor Green
}

if ($Mode -eq "start" -or $Mode -eq "all") {
  Write-Host "`n=== Iniciando servicios en produccion ===" -ForegroundColor Cyan

  # Iniciar backend en background
  Write-Host "`nIniciando backend (puerto 3000)..." -ForegroundColor Yellow
  $backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:rootDir\backend"
    $env:NODE_ENV = "production"
    node dist/main.js
  }

  Start-Sleep -Seconds 3

  # Iniciar frontend en background
  Write-Host "Iniciando frontend (puerto 3001)..." -ForegroundColor Yellow
  $frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:rootDir\frontend"
    $env:NODE_ENV = "production"
    npx next start -p 3001
  }

  Start-Sleep -Seconds 3

  Write-Host "`n=== Servicios iniciados ===" -ForegroundColor Green
  Write-Host "Backend: http://localhost:3000" -ForegroundColor Green
  Write-Host "Frontend: http://localhost:3001" -ForegroundColor Green
  Write-Host "Health: http://localhost:3000/api/health" -ForegroundColor Green

  Write-Host "`nPresiona Ctrl+C para detener los servicios" -ForegroundColor Yellow
  Wait-Job $backendJob, $frontendJob
}

if ($Mode -eq "start:prod") {
  Write-Host "`n=== Iniciando backend en produccion ===" -ForegroundColor Cyan
  Set-Location "$rootDir\backend"
  $env:NODE_ENV = "production"
  node dist/main.js
}
