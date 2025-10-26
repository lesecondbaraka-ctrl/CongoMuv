@echo off
echo ========================================
echo   CongoMuv Backend Startup Script
echo ========================================
echo.

echo Changing to backend directory...
cd /d "C:\Users\LEGRAND\Downloads\CongoMuv\project\backend"
echo Current directory: %CD%

echo Checking if backend directory exists...
if not exist "package.json" (
    echo ERROR: Backend directory not found or invalid!
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✅ Backend directory found
echo.

echo Checking for .env file...
if not exist ".env" (
    echo ⚠️ No .env file found, creating one...
    echo PORT=3002 > .env
    echo NODE_ENV=development >> .env
    echo SUPABASE_URL=https://bnyoyldctqbppvwqfodc.supabase.co >> .env
    echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs >> .env
    echo JWT_SECRET=7f64bc5c7ec6f1bd3470803c8b3f8fe12d00982b6c90e648dd01f6d3a8eee61edc285a433f0cf5abb3ffd8ee04624cb6a9b36ab08add02503b5e358ce6d58bf8 >> .env
    echo FRONTEND_URL=http://localhost:5173 >> .env
    echo ALLOW_START_WITHOUT_DB=true >> .env
    echo DB_SKIP_INIT=true >> .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)
echo.

echo Checking if port 3002 is available...
netstat -ano | findstr :3002 > nul
if %errorlevel% == 0 (
    echo ⚠️ Port 3002 is already in use!
    echo Trying to kill existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
        echo Killing process %%a
        taskkill /PID %%a /F > nul 2>&1
    )
    timeout /t 2 > nul
)

echo ✅ Port 3002 is now available
echo.

echo Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ node_modules exists
)
echo.

echo Starting backend server...
echo ========================================
echo Backend will start on: http://localhost:3002
echo Health check: http://localhost:3002/health
echo Debug: http://localhost:3002/api/debug/test-supabase
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

echo.
echo Backend server stopped.
pause
