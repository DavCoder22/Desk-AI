@echo off
title DeskAI - Detener todo
chcp 65001 >nul
color 0C

echo ============================================
echo   DeskAI - Deteniendo todos los procesos
echo ============================================
echo.

echo [1/3] Matando procesos node...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
echo    Procesos node detenidos.

echo [2/3] Matando terminales Powershell abiertas...
taskkill /F /IM powershell.exe >nul 2>&1
taskkill /F /IM pwsh.exe >nul 2>&1
echo    Terminales detenidas.
echo    Cierra manualmente las ventanas de CMD si aun quedan abiertas.

echo [3/3] Esperando limpieza...
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   Sistema limpio. Ahora ejecuta:
echo   1) seed.bat
echo   2) start-all.bat
echo ============================================
echo.
pause
