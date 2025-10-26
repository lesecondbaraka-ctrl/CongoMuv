@echo off
echo ========================================
echo   CongoMuv Frontend Startup Script
echo ========================================
echo.

cd /d "C:\Users\LEGRAND\Downloads\CongoMuv\project"

echo Checking if frontend directory exists...
if not exist "package.json" (
    echo ERROR: Frontend directory not found or invalid!
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo ✅ Frontend directory found
echo.

echo Checking for .env file...
if not exist ".env" (
    echo ⚠️ No .env file found, creating one...
    echo VITE_API_URL=http://localhost:3002 > .env
    echo VITE_SUPABASE_URL=https://bnyoyldctqbppvwqfodc.supabase.co >> .env
    echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzE3MTksImV4cCI6MjA3NjIwNzcxOX0.8P1ynhqJGKZJVbKNVdNLKPPCOJdFnWkKJjxqKjxqKjxq >> .env
    echo VITE_APP_ENCRYPTION_KEY=dev-secret-key-123 >> .env
    echo ✅ .env file created
) else (
    echo ✅ .env file exists
)
echo.

echo Checking if port 5173 is available...
netstat -ano | findstr :5173 > nul
if %errorlevel% == 0 (
    echo ⚠️ Port 5173 is already in use!
    echo Trying to kill existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        echo Killing process %%a
        taskkill /PID %%a /F > nul 2>&1
    )
    timeout /t 2 > nul
)

echo ✅ Port 5173 is now available
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

echo Starting frontend server...
echo ========================================
echo Frontend will start on: http://localhost:5173
echo Make sure backend is running on: http://localhost:3002
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

echo.
echo Frontend server stopped.
pause
