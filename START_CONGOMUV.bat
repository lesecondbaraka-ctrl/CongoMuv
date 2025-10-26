@echo off
title CongoMuv - Démarrage Automatique
color 0A

echo.
echo ██████╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗ ███╗   ███╗██╗   ██╗██╗   ██╗
echo ██╔════╝██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗████╗ ████║██║   ██║██║   ██║
echo ██║     ██║   ██║██╔██╗ ██║██║  ███╗██║   ██║██╔████╔██║██║   ██║██║   ██║
echo ██║     ██║   ██║██║╚██╗██║██║   ██║██║   ██║██║╚██╔╝██║██║   ██║╚██╗ ██╔╝
echo ╚██████╗╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ 
echo  ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝ ╚═════╝   ╚═══╝  
echo.
echo ========================================================================
echo                    DÉMARRAGE AUTOMATIQUE - CongoMuv
echo ========================================================================
echo.

set "PROJECT_ROOT=C:\Users\LEGRAND\Downloads\CongoMuv\project"
set "BACKEND_DIR=%PROJECT_ROOT%\backend"
set "FRONTEND_DIR=%PROJECT_ROOT%"

echo 🔍 Vérification des répertoires...
if not exist "%BACKEND_DIR%\package.json" (
    echo ❌ ERREUR: Répertoire backend introuvable!
    echo Chemin attendu: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%\package.json" (
    echo ❌ ERREUR: Répertoire frontend introuvable!
    echo Chemin attendu: %FRONTEND_DIR%
    pause
    exit /b 1
)

echo ✅ Répertoires trouvés
echo.

echo 🔧 Configuration des fichiers .env...

REM Créer .env pour le backend
if not exist "%BACKEND_DIR%\.env" (
    echo Création du fichier .env backend...
    (
        echo PORT=3002
        echo NODE_ENV=development
        echo SUPABASE_URL=https://bnyoyldctqbppvwqfodc.supabase.co
        echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs
        echo JWT_SECRET=7f64bc5c7ec6f1bd3470803c8b3f8fe12d00982b6c90e648dd01f6d3a8eee61edc285a433f0cf5abb3ffd8ee04624cb6a9b36ab08add02503b5e358ce6d58bf8
        echo FRONTEND_URL=http://localhost:5173
        echo ALLOW_START_WITHOUT_DB=true
        echo DB_SKIP_INIT=true
    ) > "%BACKEND_DIR%\.env"
    echo ✅ Fichier .env backend créé
) else (
    echo ✅ Fichier .env backend existe déjà
)

REM Créer .env pour le frontend
if not exist "%FRONTEND_DIR%\.env" (
    echo Création du fichier .env frontend...
    (
        echo VITE_API_URL=http://localhost:3002
        echo VITE_SUPABASE_URL=https://bnyoyldctqbppvwqfodc.supabase.co
        echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzE3MTksImV4cCI6MjA3NjIwNzcxOX0.8P1ynhqJGKZJVbKNVdNLKPPCOJdFnWkKJjxqKjxqKjxq
        echo VITE_APP_ENCRYPTION_KEY=dev-secret-key-123
    ) > "%FRONTEND_DIR%\.env"
    echo ✅ Fichier .env frontend créé
) else (
    echo ✅ Fichier .env frontend existe déjà
)

echo.
echo 🚀 Installation des dépendances...

echo Installation backend...
cd /d "%BACKEND_DIR%"
if not exist "node_modules" (
    echo Exécution de npm install pour le backend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ ERREUR: Installation backend échouée!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dépendances backend déjà installées
)

echo Installation frontend...
cd /d "%FRONTEND_DIR%"
if not exist "node_modules" (
    echo Exécution de npm install pour le frontend...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ ERREUR: Installation frontend échouée!
        pause
        exit /b 1
    )
) else (
    echo ✅ Dépendances frontend déjà installées
)

echo.
echo 🔄 Libération des ports...
echo Arrêt des processus existants sur les ports 3002 et 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 >nul

echo.
echo 🚀 DÉMARRAGE DES SERVEURS...
echo ========================================================================
echo.

echo 📡 Démarrage du BACKEND sur http://localhost:3002
cd /d "%BACKEND_DIR%"
start "CongoMuv Backend" cmd /k "echo ========== BACKEND CongoMuv ========== && npm run dev"

echo ⏳ Attente du démarrage du backend (5 secondes)...
timeout /t 5 >nul

echo 🌐 Démarrage du FRONTEND sur http://localhost:5173
cd /d "%FRONTEND_DIR%"
start "CongoMuv Frontend" cmd /k "echo ========== FRONTEND CongoMuv ========== && npm run dev"

echo.
echo ========================================================================
echo                           ✅ DÉMARRAGE TERMINÉ!
echo ========================================================================
echo.
echo 🎉 CongoMuv est maintenant en cours de démarrage!
echo.
echo 📱 URLs importantes:
echo    • Application:     http://localhost:5173
echo    • API Backend:     http://localhost:3002
echo    • Health Check:    http://localhost:3002/health
echo    • Test Supabase:   http://localhost:3002/api/debug/test-supabase
echo.
echo ⏳ Attendez 10-15 secondes que tout se charge, puis:
echo    1. Ouvrez votre navigateur
echo    2. Allez sur: http://localhost:5173
echo    3. Profitez de CongoMuv! 🚀
echo.
echo ⚠️  IMPORTANT: Ne fermez pas les fenêtres Backend et Frontend!
echo.

timeout /t 3 >nul
start http://localhost:5173

echo 🔍 Ouverture automatique du navigateur...
echo.
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
