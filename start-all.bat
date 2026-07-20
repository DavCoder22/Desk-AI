@echo off
title DeskAI - Inicio Rapido
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   DeskAI - Inicio de Servicios
echo ============================================
echo.

echo [1/4] Deteniendo procesos anteriores...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo   Procesos detenidos correctamente.
) else (
    echo   No habia procesos ejecutandose.
)
timeout /t 2 /nobreak >nul

echo [2/4] Iniciando backend (puerto 3000)...
start "DeskAI Backend" cmd /k "cd /d "%~dp0backend" && echo.
echo   ======================================== && echo   DeskAI - Backend && echo   ======================================== && npm run start:dev"

echo   Esperando 8 segundos para que el backend inicialice...
timeout /t 8 /nobreak >nul

echo [3/4] Iniciando frontend (puerto 3001)...
start "DeskAI Frontend" cmd /k "cd /d "%~dp0frontend" && echo.
echo   ======================================== && echo   DeskAI - Frontend && echo   ======================================== && echo   Abre http://localhost:3001 en tu navegador && echo. && npm run dev"

echo [4/4] Abriendo navegador...
timeout /t 6 /nobreak >nul
start http://localhost:3001

echo.
echo ============================================
echo   Servicios iniciados correctamente
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:3001
echo ============================================
echo.
echo   Cierra las ventanas CMD para detener los servicios.
echo.
pause
