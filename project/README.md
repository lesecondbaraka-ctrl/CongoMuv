# CongoMuv E-Ticket System

Système de réservation de billets de transport en ligne pour la République Démocratique du Congo.

## 🚀 Fonctionnalités

- **Authentification 2FA** : Connexion sécurisée en deux étapes (email + code OTP)
- **Base de données dynamique** : Intégration complète avec Supabase PostgreSQL
- **Recherche de trajets** : Recherche avancée avec filtres
- **Réservation en ligne** : Système de réservation complet
- **Paiements intégrés** : Support Flutterwave, Airtel Money, Orange Money
- **Interface responsive** : Compatible mobile et desktop
- **Système entièrement dynamique** : Aucune donnée statique ou mock

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd congomuv/project
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase (OBLIGATOIRE)**
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer .env.local avec vos configurations Supabase
```

## 🔧 Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anonyme

### 2. Configurer les variables d'environnement

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ENCRYPTION_KEY=your-strong-encryption-key
```

### 3. Créer le schéma de base de données

Exécuter ce script SQL dans l'éditeur SQL de Supabase :

```sql
-- Créer les tables de base
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  timezone VARCHAR(50) DEFAULT 'Africa/Kinshasa',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transport_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(10),
  icon VARCHAR(10),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id),
  transport_type_id UUID REFERENCES transport_types(id),
  departure_city_id UUID REFERENCES cities(id),
  arrival_city_id UUID REFERENCES cities(id),
  route_code VARCHAR(20),
  name VARCHAR(100),
  distance_km DECIMAL(8, 2),
  duration_minutes INTEGER,
  base_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id),
  vehicle_id UUID,
  driver_id UUID,
  departure_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer des données de base
INSERT INTO cities (name, province) VALUES
('Kinshasa', 'Kinshasa'),
('Matadi', 'Kongo-Central'),
('Lubumbashi', 'Haut-Katanga'),
('Mbuji-Mayi', 'Kasaï-Oriental'),
('Kananga', 'Kasaï-Central');

INSERT INTO transport_types (name, code, icon) VALUES
('Bus', 'BUS', '🚌'),
('Minibus', 'MINI', '🚐'),
('Taxi', 'TAXI', '🚕');

INSERT INTO operators (name, type, contact_email) VALUES
('Transco', 'Bus', 'contact@transco.cd'),
('Express Congo', 'Minibus', 'contact@express.cd'),
('Rapide Transport', 'Bus', 'contact@rapide.cd');
```

## 🚀 Démarrage

```bash
# Mode développement
npm run dev

# Build de production
npm run build
npm run preview
```

## 🔐 Authentification

Le système utilise l'authentification 2FA avec Supabase :

1. Saisir l'email
2. Recevoir un code OTP par email
3. Saisir le code pour se connecter

## 📱 Utilisation

### Recherche de Trajets

1. Sélectionner ville de départ et d'arrivée
2. Choisir la date de voyage
3. Spécifier le nombre de passagers
4. Cliquer sur "Rechercher"

### Réservation

1. Choisir un trajet dans les résultats
2. Sélectionner les sièges
3. Remplir les informations passagers
4. Choisir le mode de paiement
5. Confirmer la réservation

### Administration

1. Se connecter avec un compte admin
2. Accéder au dashboard via `#/admin`
3. Gérer les opérateurs, routes, et trajets
4. Consulter les statistiques

## 🏗️ Architecture

```
src/
├── api/                 # APIs Supabase
├── components/          # Composants React
├── lib/                 # Utilitaires et configuration
│   ├── auth2FA.ts      # Système d'authentification 2FA
│   ├── supabase.ts     # Configuration Supabase
│   └── production.ts   # Services de production (paiements, email, SMS)
├── pages/              # Pages de l'application
└── types/              # Types TypeScript
```

## 🔧 Développement

### Ajout de Nouvelles Fonctionnalités

1. **Base de données** : Créer les tables dans Supabase
2. **Types** : Ajouter les types TypeScript dans `src/types/`
3. **APIs** : Créer dans `src/api/`
4. **Composants** : Ajouter dans `src/components/`
5. **Pages** : Créer dans `src/pages/`

### Tests

```bash
# Vérification TypeScript
npm run typecheck

# Linting
npm run lint
```

## 🚨 Dépannage

### L'application ne se charge pas

1. Vérifier que `npm install` a été exécuté
2. Vérifier les variables d'environnement dans `.env.local`
3. Vérifier que Supabase est configuré correctement
4. Consulter la console du navigateur pour les erreurs

### Problèmes d'authentification

1. Vérifier les variables `VITE_SUPABASE_*`
2. Vérifier que l'email est configuré dans Supabase
3. Consulter les logs dans la console

### Données non chargées

1. Vérifier la connexion Supabase
2. Vérifier que les tables existent dans la base de données
3. Vérifier les logs dans la console

## 📞 Support

Pour toute question ou problème :

1. Consulter les logs dans la console du navigateur
2. Vérifier la configuration des variables d'environnement
3. Vérifier la configuration Supabase

## 🔄 Mise à Jour

```bash
# Mettre à jour les dépendances
npm update

# Reconstruire
npm run build
```

---

**CongoMuv E-Ticket** - Système de réservation de transport moderne et sécurisé pour la RDC.

## ⚠️ Important

Ce système est **entièrement dynamique** et nécessite une configuration Supabase valide. Il n'y a plus de mode mock ou de données statiques.