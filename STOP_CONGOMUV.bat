@echo off
title CongoMuv - Arrêt des serveurs
color 0C

echo.
echo ========================================
echo     ARRÊT DES SERVEURS CongoMuv
echo ========================================
echo.

echo 🛑 Arrêt du backend (port 3002)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002 2^>nul') do (
    echo Arrêt du processus %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo 🛑 Arrêt du frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 2^>nul') do (
    echo Arrêt du processus %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo 🛑 Arrêt des processus Node.js CongoMuv...
for /f "tokens=2" %%a in ('tasklist ^| findstr "CongoMuv" 2^>nul') do (
    echo Arrêt du processus %%a
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ✅ Tous les serveurs CongoMuv ont été arrêtés!
echo.
echo Vous pouvez maintenant fermer cette fenêtre.
timeout /t 3 >nul
