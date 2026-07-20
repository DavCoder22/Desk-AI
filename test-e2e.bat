@echo off
chcp 65001 >nul
title DeskAI - Pruebas E2E

echo ============================================
echo  DeskAI - Pruebas de Integracion y E2E
echo  BD: Prisma Postgres (pooled.db.prisma.io)
echo ============================================
echo.

echo [1/5] Instalando dependencias del backend...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo ERROR: Fallo npm install.
    pause
    exit /b 1
)

echo [2/5] Generando cliente Prisma...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Fallo prisma generate.
    pause
    exit /b 1
)

echo [3/5] Sincronizando esquema con la base de datos...
call npx prisma db push
if errorlevel 1 (
    echo ERROR: Fallo prisma db push. Verifica DATABASE_URL en .env.
    pause
    exit /b 1
)

echo [4/5] Ejecutando tests unitarios...
call npm test
if errorlevel 1 (
    echo.
    echo  ALGUNOS TESTS UNITARIOS FALLARON
    echo Revisa los detalles arriba.
) else (
    echo Tests unitarios OK.
)

echo.
echo [5/5] Ejecutando pruebas de integracion (E2E)...
set RUN_SEED=true

call npx jest --config ./test/jest-e2e.json --forceExit --detectOpenHandles
set E2E_RESULT=%errorlevel%

echo.
if %E2E_RESULT% equ 0 (
    echo ============================================
    echo  TODAS LAS PRUEBAS PASARON EXITOSAMENTE
    echo ============================================
) else (
    echo ============================================
    echo  ALGUNAS PRUEBAS E2E FALLARON
    echo  Revisa los detalles arriba.
    echo ============================================
)

echo.
echo Pruebas completadas.
pause
