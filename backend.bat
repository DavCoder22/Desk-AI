@echo off
chcp 65001 >nul
title DeskAI - Backend

echo ============================================
echo  DeskAI - Gestion de Incidentes (Backend)
echo  IA con deteccion automatica de proveedor
echo  BD: Prisma Postgres (pooled.db.prisma.io)
echo ============================================
echo.

:: ---- PASO 1: CONFIGURACION DE IA ----
echo [Paso 1/4] Configuracion de IA...
cd /d "%~dp0backend"

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js no encontrado. Instala Node.js 18+.
    pause
    exit /b 1
)

node setup-ai.js
set AI_EXIT=%errorlevel%

echo.
echo --- Resultado de configuracion IA (codigo: %AI_EXIT%) ---
echo   0 = IA configurada y operativa
echo   1 = Usando clasificador local
echo   2 = Salida del usuario
echo.

if "%AI_EXIT%"=="2" (
    echo Saliendo por solicitud del usuario.
    pause
    exit /b 0
)

pause
echo.

:: ---- PASO 2: DEPENDENCIAS ----
echo [Paso 2/4] Instalando dependencias del backend...
cd /d "%~dp0backend"

if not exist "node_modules" (
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo npm install.
        pause
        exit /b 1
    )
) else (
    echo Dependencias ya instaladas.
    call npm run prisma:generate
)
echo.

:: ---- PASO 3: SINCORNIZAR ESQUEMA PRISMA ----
echo [Paso 3/4] Sincronizando esquema con la base de datos...
cd /d "%~dp0backend"
call npx prisma db push
if errorlevel 1 (
    echo ERROR: Fallo la sincronizacion del esquema Prisma.
    echo Verifica que DATABASE_URL en .env sea correcto.
    pause
    exit /b 1
)
echo.

:: ---- PASO 4: INICIAR BACKEND ----
echo [Paso 4/4] Iniciando servidor backend...
echo.
echo  El backend estara disponible en: http://localhost:3000
echo  Presiona Ctrl+C para detenerlo.
echo.

cd /d "%~dp0backend"
call npm run start:dev

echo.
echo El servidor backend se detuvo.
pause
