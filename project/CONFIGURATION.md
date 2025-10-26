# Configuration CongoMuv - Instructions

## 🚨 Problème résolu : Écran blanc

Le problème d'écran blanc était causé par l'absence du fichier `.env` avec les variables d'environnement requises.

## ✅ Corrections apportées

1. **`src/lib/crypto.ts`** : Modifié pour ne plus planter si la clé d'encryption manque
2. **`src/lib/authContext.tsx`** : Amélioration de la gestion des erreurs de décryptage

## 📝 Instructions pour créer le fichier .env

### Étape 1 : Créer le fichier .env

Dans le dossier `project`, créez un nouveau fichier nommé `.env` (avec le point au début).

**Sous Windows :**
- Ouvrez l'explorateur de fichiers
- Naviguez vers `C:\Users\LEGRAND\Downloads\CongoMuv\project`
- Clic droit → Nouveau → Document texte
- Renommez-le en `.env` (incluez bien le point au début)
- Si Windows vous empêche, renommez-le en `.env.` (avec un point à la fin aussi, Windows le retirera automatiquement)

### Étape 2 : Copier le contenu

Copiez le contenu suivant dans votre fichier `.env` :

```env
# Core backend API URL
VITE_API_URL=http://localhost:3002

# Auth / Supabase (REQUIRED)
VITE_SUPABASE_URL=https://bnyoyldctqbppvwqfodc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzE3MTksImV4cCI6MjA3NjIwNzcxOX0.ppgkZPtp1dsmQxjcm32bn_v5xrlevJrAcGrqZdNVR18

# Crypto (REQUIS - utilisez une clé forte en production)
VITE_APP_ENCRYPTION_KEY=mon-secret-dev-congomuv-2025

# Payments (optionnel pour l'instant)
VITE_FLUTTERWAVE_PUBLIC_KEY=
VITE_FLUTTERWAVE_SECRET_KEY=
```

### Étape 3 : Sauvegarder et redémarrer

1. **Sauvegardez** le fichier `.env`
2. **Arrêtez** le serveur de développement (Ctrl+C dans le terminal)
3. **Redémarrez** avec `npm run dev`

## 🔧 Alternative rapide : Ligne de commande

Ouvrez PowerShell dans le dossier `project` et exécutez :

```powershell
Copy-Item .env.example .env
```

Puis éditez le fichier `.env` créé et remplacez les valeurs par celles ci-dessus.

## ✨ Résultat attendu

Une fois le fichier créé et le serveur redémarré :
- ✅ La page ne sera plus blanche
- ✅ L'application CongoMuv s'affichera correctement
- ✅ Vous verrez la page d'accueil avec le formulaire de recherche de voyages

## 🔒 Sécurité

⚠️ **Important** : Le fichier `.env` contient des clés sensibles et est automatiquement ignoré par Git (`.gitignore`). Ne le partagez jamais publiquement.

## ❓ Questions

Si vous rencontrez toujours des problèmes après avoir créé le fichier `.env`, vérifiez :
1. Que le nom du fichier est bien `.env` (pas `.env.txt`)
2. Que le fichier est bien dans le dossier `project` (à côté de `package.json`)
3. Que vous avez redémarré le serveur de développement
4. Les erreurs dans la console du navigateur (F12)
