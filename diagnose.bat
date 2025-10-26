@echo off
echo ========================================
echo   CongoMuv Diagnostic Script
echo ========================================
echo.

echo 1. Checking directory structure...
echo ----------------------------------------
if exist "project\package.json" (
    echo ✅ Frontend directory exists
) else (
    echo ❌ Frontend directory missing
)

if exist "project\backend\package.json" (
    echo ✅ Backend directory exists
) else (
    echo ❌ Backend directory missing
)
echo.

echo 2. Checking environment files...
echo ----------------------------------------
if exist "project\.env" (
    echo ✅ Frontend .env exists
    echo Content preview:
    type "project\.env" | findstr "VITE_API_URL"
) else (
    echo ❌ Frontend .env missing
)

if exist "project\backend\.env" (
    echo ✅ Backend .env exists
    echo Content preview:
    type "project\backend\.env" | findstr "PORT"
) else (
    echo ❌ Backend .env missing
)
echo.

echo 3. Checking running processes...
echo ----------------------------------------
echo Node.js processes:
tasklist | findstr "node.exe"
echo.

echo 4. Checking ports...
echo ----------------------------------------
echo Port 3002 (Backend):
netstat -ano | findstr :3002
echo.
echo Port 5173 (Frontend):
netstat -ano | findstr :5173
echo.

echo 5. Testing backend connection...
echo ----------------------------------------
echo Testing http://localhost:3002/health
curl -s http://localhost:3002/health 2>nul
if %errorlevel% == 0 (
    echo ✅ Backend is responding
) else (
    echo ❌ Backend is not responding
)
echo.

echo 6. Recommendations...
echo ----------------------------------------
netstat -ano | findstr :3002 > nul
if %errorlevel% neq 0 (
    echo ❌ Backend is not running
    echo 👉 Run: start-backend.bat
) else (
    echo ✅ Backend appears to be running
)

netstat -ano | findstr :5173 > nul
if %errorlevel% neq 0 (
    echo ❌ Frontend is not running
    echo 👉 Run: start-frontend.bat
) else (
    echo ✅ Frontend appears to be running
)

echo.
echo ========================================
echo Diagnostic complete!
echo ========================================
pause
