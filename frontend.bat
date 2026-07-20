@echo off
chcp 65001 >nul
title DeskAI - Frontend

echo ============================================
echo  DeskAI - Gestion de Incidentes (Frontend)
echo ============================================
echo.

:: Ir al directorio del frontend
cd /d "%~dp0frontend"

:: Verificar si existe node_modules
if not exist "node_modules" (
    echo [1/2] Instalando dependencias del frontend...
    call npm install
    if errorlevel 1 (
        echo ERROR: Fallo la instalacion de dependencias.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencias ya instaladas.
)

:: Iniciar frontend
echo.
echo [2/2] Iniciando servidor frontend (Next.js)...
echo.
echo El frontend estara disponible en: http://localhost:3001
echo Asegurate de que el backend este corriendo en http://localhost:3000
echo Presiona Ctrl+C para detenerlo.
echo.

call npm run dev
pause
