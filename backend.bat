@echo off
chcp 65001 >nul
title DeskAI - Backend

echo ============================================
echo  DeskAI - Gestion de Incidentes (Backend)
echo  Base de datos: SQLite (backend/prisma/dev.db)
echo ============================================
echo.

:: ---- PASO 1: VERIFICAR DEPENDENCIAS ----
echo [Paso 1/4] Verificando dependencias...
cd /d "%~dp0backend"

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js no encontrado. Instala Node.js 18+.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo    Instalando dependencias del backend...
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo npm install.
        pause
        exit /b 1
    )
) else (
    echo    Dependencias ya instaladas.
)
echo.

:: ---- PASO 2: CONFIGURACION DE IA ----
echo [Paso 2/4] Verificando configuracion de IA...
if not exist "ai-config.json" (
    echo    No se encontro ai-config.json. Usando clasificador local de keywords.
    echo    Para configurar IA remota ejecuta manualmente: cd backend && node setup-ai.js
) else (
    echo    ai-config.json encontrado. Si tiene API key valida se usara, sino clasificador local.
)
echo.

:: ---- PASO 3: GENERAR PRISMA CLIENT Y CREAR BD ----
echo [Paso 3/4] Preparando Prisma Client y base de datos SQLite...
cd /d "%~dp0backend"

if not exist "node_modules\.bin\prisma.cmd" (
    echo ERROR: Prisma CLI no encontrado.
    pause
    exit /b 1
)

echo    - Generando Prisma Client...
call node_modules\.bin\prisma.cmd generate
if errorlevel 1 (
    echo ERROR: Fallo prisma generate.
    pause
    exit /b 1
)

echo    - Limpiando base de datos SQLite anterior...
if exist "prisma\dev.db" del /Q "prisma\dev.db"
if exist "prisma\dev.db-journal" del /Q "prisma\dev.db-journal"

echo    - Creando tablas...
call node_modules\.bin\prisma.cmd db push --accept-data-loss
if errorlevel 1 (
    echo ERROR: Fallo prisma db push.
    pause
    exit /b 1
)
echo.

:: ---- PASO 4: SEMBRAR EJEMPLOS ----
echo [Paso 4/4] Verificando datos de ejemplo...
call npx ts-node seed-standalone.ts
if errorlevel 1 (
    echo    [i] Seed ya ejecutado o base con datos.
)
echo.

echo ============================================
echo  Iniciando servidor backend...
echo  http://localhost:3000
echo  Presiona Ctrl+C para detenerlo
echo ============================================
echo.

call npm run start:dev

echo.
echo El servidor backend se detuvo.
pause
