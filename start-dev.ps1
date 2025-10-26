# One-command dev startup for CongoMuv (Windows PowerShell)
# - Starts Postgres via Docker Compose
# - Starts backend (install + dev)
# - Starts frontend (install + dev)

Write-Host "Starting PostgreSQL (docker-compose)" -ForegroundColor Cyan
try {
  docker compose -f ".\project\backend\docker-compose.yml" up -d
} catch {
  Write-Host "Docker is required. Please install Docker Desktop and retry." -ForegroundColor Red
  exit 1
}

Write-Host "Starting backend (install + dev)" -ForegroundColor Cyan
Start-Process powershell -ArgumentList @("-NoExit","-Command","cd '.\project\backend'; npm install; npm run dev")

Write-Host "Starting frontend (install + dev)" -ForegroundColor Cyan
Start-Process powershell -ArgumentList @("-NoExit","-Command","cd '.\project'; npm install; npm run dev")

Write-Host "All processes started. Backend on http://localhost:3001, Frontend on http://localhost:5173" -ForegroundColor Green
