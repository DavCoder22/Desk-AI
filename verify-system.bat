@echo off
chcp 65001 >nul
title DeskAI - Verificacion del Sistema

echo ============================================
echo  DeskAI - Verificacion del Sistema Completo
echo ============================================
echo.

:: 1. Verificar estructura de archivos
echo [1/6] Verificando estructura de archivos...
set MISSING=0

if not exist "backend\package.json" (echo  ERROR: backend\package.json no encontrado & set MISSING=1)
if not exist "backend\src\main.ts" (echo  ERROR: backend\src\main.ts no encontrado & set MISSING=1)
if not exist "backend\src\app.module.ts" (echo  ERROR: backend\src\app.module.ts no encontrado & set MISSING=1)
if not exist "backend\src\tickets\tickets.service.ts" (echo  ERROR: tickets.service.ts no encontrado & set MISSING=1)
if not exist "backend\src\tickets\enums.ts" (echo  ERROR: enums.ts no encontrado & set MISSING=1)
if not exist "backend\prisma\schema.prisma" (echo  ERROR: schema.prisma no encontrado & set MISSING=1)
if not exist "backend\src\ai\ai.service.ts" (echo  ERROR: ai.service.ts no encontrado & set MISSING=1)
if not exist "backend\src\feedback\feedback.service.ts" (echo  ERROR: feedback.service.ts no encontrado & set MISSING=1)
if not exist "backend\src\seed\seed.service.ts" (echo  ERROR: seed.service.ts no encontrado & set MISSING=1)
if not exist "backend\src\ai\ai-api-client.ts" (echo  ERROR: ai-api-client.ts no encontrado & set MISSING=1)
if not exist "backend\setup-ai.js" (echo  ERROR: setup-ai.js no encontrado & set MISSING=1)
if not exist "backend\Dockerfile" (echo  ERROR: backend\Dockerfile no encontrado & set MISSING=1)

if not exist "frontend\package.json" (echo  ERROR: frontend\package.json no encontrado & set MISSING=1)
if not exist "frontend\src\app\dashboard\page.tsx" (echo  ERROR: dashboard page no encontrada & set MISSING=1)
if not exist "frontend\src\app\tickets\page.tsx" (echo  ERROR: tickets page no encontrada & set MISSING=1)
if not exist "frontend\src\components\Sidebar.tsx" (echo  ERROR: Sidebar component no encontrado & set MISSING=1)
if not exist "frontend\src\components\TicketDrawer.tsx" (echo  ERROR: TicketDrawer no encontrado & set MISSING=1)
if not exist "frontend\src\components\NewTicketModal.tsx" (echo  ERROR: NewTicketModal no encontrado & set MISSING=1)
if not exist "frontend\Dockerfile" (echo  ERROR: frontend\Dockerfile no encontrado & set MISSING=1)

if not exist "docker-compose.yml" (echo  ERROR: docker-compose.yml no encontrado & set MISSING=1)
if not exist "backend.bat" (echo  ERROR: backend.bat no encontrado & set MISSING=1)
if not exist "frontend.bat" (echo  ERROR: frontend.bat no encontrado & set MISSING=1)

if %MISSING% equ 1 (
    echo.
    echo  ⚠ Se encontraron archivos faltantes.
) else (
    echo  Estructura de archivos OK.
)

:: 2. Verificar dependencias
echo.
echo [2/6] Verificando dependencias del backend...
cd /d "%~dp0backend"
if exist "package-lock.json" (echo  package-lock.json presente) else (echo  package-lock.json no encontrado)
echo  Dependencias en package.json:
for /f "tokens=2 delims=:" %%a in ('findstr /c:"@nestjs/" package.json') do echo    - @nestjs%%a
for /f "tokens=2 delims=:" %%a in ('findstr "prisma" package.json') do echo    - prisma%%a
for /f "tokens=2 delims=:" %%a in ('findstr "@prisma/client" package.json') do echo    - @prisma/client%%a

:: 3. Verificar endpoints backend
echo.
echo [3/6] Verificando endpoints definidos...
cd /d "%~dp0backend"
findstr /c:"@Post(" src\**\*.ts 2>nul > endpoints.txt
findstr /c:"@Get(" src\**\*.ts 2>nul >> endpoints.txt
findstr /c:"@Patch(" src\**\*.ts 2>nul >> endpoints.txt
echo  Endpoints encontrados:
type endpoints.txt
del endpoints.txt

:: 4. Verificar componentes frontend
echo.
echo [4/6] Verificando componentes frontend...
cd /d "%~dp0frontend"
echo  Componentes:
dir /b src\components\*.tsx 2>nul
echo  Paginas:
dir /b src\app\**\page.tsx 2>nul

:: 5. Verificar Docker config
echo.
echo [5/6] Verificando configuracion Docker...
cd /d "%~dp0"
findstr "image:" docker-compose.yml
findstr "build:" docker-compose.yml
findstr "ports:" docker-compose.yml

:: 6. Resumen final
echo.
echo [6/6] Resumen de verificacion:
echo.
echo  Proyecto DeskAI - Sistema de Gestion de Incidentes
echo  ================================================
echo  Backend:  NestJS + Prisma ORM + PostgreSQL
echo  Frontend: Next.js 14 + Tailwind CSS + Recharts
echo  IA:       Clasificacion automatica por keywords
echo  BD:       Prisma Postgres (pooled.db.prisma.io)
echo  Docker:   2 servicios (backend, frontend)
echo.
echo  Archivos .bat disponibles:
echo    backend.bat   - Iniciar backend en localhost:3000
echo    frontend.bat  - Iniciar frontend en localhost:3001
echo    test-e2e.bat  - Ejecutar pruebas de integracion
echo    verify-system.bat - Esta verificacion
echo.
echo  Inicio rapido con Docker:
echo    docker-compose up --build
echo.
echo  Verificacion completada.

cd /d "%~dp0"
pause
