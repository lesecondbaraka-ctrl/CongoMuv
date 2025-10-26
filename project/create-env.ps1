# Script PowerShell pour créer le fichier .env
# Exécutez ce script dans le dossier project

Write-Host "🚀 Création du fichier .env pour CongoMuv..." -ForegroundColor Cyan

$envContent = @"
# Core backend API URL
VITE_API_URL=http://localhost:3002

# Auth / Supabase (REQUIRED)
VITE_SUPABASE_URL=https://bnyoyldctqbppvwqfodc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzE3MTksImV4cCI6MjA3NjIwNzcxOX0.ppgkZPtp1dsmQxjcm32bn_v5xrlevJrAcGrqZdNVR18

# Crypto (REQUIS)
VITE_APP_ENCRYPTION_KEY=mon-secret-dev-congomuv-2025

# Payments (optionnel)
VITE_FLUTTERWAVE_PUBLIC_KEY=
VITE_FLUTTERWAVE_SECRET_KEY=
"@

# Créer le fichier .env
$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host "⚠️  Le fichier .env existe déjà !" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous le remplacer ? (o/n)"
    if ($response -ne "o") {
        Write-Host "❌ Opération annulée." -ForegroundColor Red
        exit
    }
}

Set-Content -Path $envPath -Value $envContent -Encoding UTF8

Write-Host "✅ Fichier .env créé avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "  1. Arrêtez le serveur (Ctrl+C)" -ForegroundColor White
Write-Host "  2. Redémarrez avec: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Votre application devrait maintenant fonctionner !" -ForegroundColor Green
