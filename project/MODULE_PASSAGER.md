# 📱 Module Passager (App Utilisateur) - CongoMuv

## 🎯 Objectif du module

Permettre à chaque voyageur de :
- ✅ Réserver un trajet
- 💳 Payer sa réservation
- 📍 Suivre l'évolution de son voyage

---

## 🚀 Fonctionnalités principales

### 1. **Page d'accueil - Sélection du type de transport**

#### Description
Interface permettant de choisir parmi 4 types de transport :
- 🚆 **Train ONATRA** - Confortable et rapide
- 🚢 **Transport Fluvial** - Navigation sur le fleuve
- 🚌 **Bus Transco** - Bus inter-urbain
- 🚗 **Transport Privé** - Véhicule privé

#### Fonctionnement
- Affichage en grille responsive (2 colonnes mobile, 4 colonnes desktop)
- Sélection visuelle avec animation et indicateur
- Chargement automatique des trajets disponibles pour le type sélectionné

#### Technologies
- React + TypeScript
- TailwindCSS pour le styling
- Lucide React pour les icônes
- API `/api/trips/search` avec filtrage par type d'opérateur

---

### 2. **Recherche & Réservation**

#### Formulaire de recherche

**Champs disponibles :**
- 📍 **Départ** - Ville de départ (avec autocomplétion)
- 📍 **Arrivée** - Ville d'arrivée (avec autocomplétion)
- 📅 **Date** - Date du voyage
- 🔍 **Type de transport** - Filtrage par type

**Autocomplétion des villes :**
```typescript
// Chargement via API
GET /api/public/cities?limit=500
```

#### Affichage des trajets disponibles

**Carte de trajet inclut :**
- Itinéraire (ville départ → ville arrivée)
- Nom de l'opérateur
- Horaires de départ et d'arrivée
- Durée estimée du trajet
- Prix de base
- Nombre de places disponibles
- Boutons d'action : **Réserver** et **Suivre**

#### Gestion multi-passagers

**Fonctionnalité clé :** Bouton "Ajouter un passager"

Pour chaque passager :
- 👤 **Nom complet** (obligatoire)
- 🎂 **Âge** (obligatoire)
- 🏷️ **Badge de réduction** si âge < 5 ans

**Interface :**
- Numérotation automatique des passagers
- Bouton de suppression (minimum 1 passager)
- Validation en temps réel
- Design avec cartes individuelles

---

### 3. **Calcul automatique des tarifs**

#### Règles de tarification

**Prix de base :**
```typescript
const basePrice = trip.route?.base_price || 0;
```

**Réduction enfant (-50%) :**
```typescript
const isChild = passenger.age < 5;
const discount = isChild ? 0.5 : 0; // 50% de réduction
const finalPrice = originalPrice * (1 - discount);
```

#### Récapitulatif des tarifs

Affiche pour chaque passager :
- Nom du passager
- Âge
- Prix original (barré si réduction)
- Badge de réduction (-50%)
- Prix final

**Totaux :**
- 💰 Économie totale réalisée
- 💳 **Montant total à payer** (en FC - Francs Congolais)

#### Exemple de calcul

```
Passager 1 : Jean Kabongo (25 ans)    50 000 FC
Passager 2 : Marie Kabongo (3 ans)    25 000 FC (-50%)
Passager 3 : Paul Kabongo (30 ans)    50 000 FC
─────────────────────────────────────────────────
Économie totale                       -25 000 FC
TOTAL À PAYER                         125 000 FC
```

---

## 🛠️ Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **TailwindCSS** - Styling moderne et responsive
- **Lucide React** - Icônes
- **Vite** - Build tool

### APIs utilisées

#### 1. Recherche de villes
```http
GET /api/public/cities?limit=500
```
Retourne la liste des villes pour l'autocomplétion.

#### 2. Recherche de trajets
```http
GET /api/trips/search?date=2024-01-15&departure_city_id=1&arrival_city_id=2&operator_type=ONATRA
```
**Paramètres :**
- `date` - Date du voyage (obligatoire)
- `departure_city_id` / `departure_city` - Ville de départ
- `arrival_city_id` / `arrival_city` - Ville d'arrivée
- `operator_type` - Type d'opérateur (ONATRA, Fluvial, Transco, Private)
- `limit` - Nombre de résultats
- `order` - Tri des résultats

#### 3. Création de réservation
```http
POST /api/bookings
Authorization: Bearer <JWT_TOKEN>

{
  "trip_id": 123,
  "number_of_passengers": 3,
  "total_amount": 125000,
  "passenger_details": [
    {
      "full_name": "Jean Kabongo",
      "age": 25,
      "is_child": false,
      "discount_applied": false
    },
    {
      "full_name": "Marie Kabongo",
      "age": 3,
      "is_child": true,
      "discount_applied": true
    }
  ]
}
```

---

## 📂 Structure des fichiers

```
project/src/
├── types/
│   └── passenger.ts           # Types TypeScript du module passager
├── pages/
│   └── PassengerApp.tsx       # Page principale du module
├── components/
│   ├── PassengerBookingModal.tsx  # Modal de réservation
│   ├── MyTripsModal.tsx       # Liste des voyages du passager
│   └── TrackingModal.tsx      # Suivi en temps réel du voyage
├── Root.tsx                   # Routing (route #/passenger)
└── index.css                  # Styles et animations
```

---

## 🚦 Accès et navigation

### URL d'accès
```
http://localhost:5173/#/passenger
```

### Navigation dans l'app

**Header :**
- Logo CongoMuv
- Bouton "Mes Voyages" (si connecté)
- Bouton "Connexion" / "Déconnexion"

**Routes disponibles :**
- `#/passenger` - Module passager
- `#/login` - Connexion
- `#/signup` - Inscription
- `#/admin` - Dashboard admin (rôles admin)

---

## ✨ Fonctionnalités avancées

### 1. Authentification
- Les utilisateurs **non connectés** peuvent consulter les trajets
- La **réservation nécessite une connexion**
- Redirection automatique vers `#/login` si non authentifié

### 2. Suivi en temps réel
- Modal de suivi avec carte interactive
- Affichage de la position du véhicule
- Statut du trajet (programmé, en cours, terminé)

### 3. Historique des voyages
- Modal "Mes Voyages" accessible via le header
- Liste de toutes les réservations
- Affichage des billets numériques
- Statut des réservations

### 4. Notifications
- Système de toasts global
- Confirmation de réservation
- Messages d'erreur contextuel
- Affichage pendant 4 secondes

### 5. Responsive Design
- Mobile first
- Adaptation tablette et desktop
- Grilles adaptatives
- Navigation optimisée

---

## 🎨 Design et UX

### Palette de couleurs
- **Primaire** : Emerald (vert) - `from-emerald-600 to-teal-600`
- **Secondaire** : Slate (gris) - `bg-slate-50`
- **Accent** : Yellow (jaune) - Réductions enfants
- **Erreur** : Red (rouge) - Messages d'erreur
- **Succès** : Green (vert) - Confirmations

### Animations
- **fadeIn** - Apparition progressive des éléments
- **hover** - Effets au survol
- **transform** - Élévation des cartes
- **transition** - Changements fluides

### Icônes et Emojis
- Utilisation combinée d'icônes Lucide et d'emojis
- Emojis pour les types de transport (🚆 🚢 🚌 🚗)
- Icônes pour les actions et informations

---

## 🧪 Tests et validation

### Validation du formulaire

**Règles de validation :**
1. Tous les noms de passagers obligatoires
2. Âges valides (1-120 ans)
3. Nombre de passagers ≤ places disponibles
4. Date de départ obligatoire

**Messages d'erreur :**
```typescript
"Veuillez renseigner le nom de tous les passagers"
"Veuillez renseigner un âge valide pour tous les passagers"
"Ce trajet n'a que X places disponibles"
```

### Scénarios de test

#### Test 1 : Réservation simple (1 adulte)
1. Sélectionner un type de transport
2. Rechercher un trajet
3. Cliquer sur "Réserver"
4. Remplir les informations (nom, âge ≥ 5)
5. Vérifier le montant = prix de base
6. Confirmer la réservation

#### Test 2 : Réservation avec réduction enfant
1. Ajouter 2 passagers
2. Passager 1 : adulte (25 ans)
3. Passager 2 : enfant (3 ans)
4. Vérifier badge "-50%" sur l'enfant
5. Vérifier calcul : adulte 50K + enfant 25K = 75K
6. Vérifier économie affichée : 25K

#### Test 3 : Autocomplétion des villes
1. Taper "Kin" dans le champ départ
2. Vérifier proposition "Kinshasa"
3. Sélectionner dans la liste
4. Vérifier recherche avec ville exacte

---

## 🔧 Configuration

### Variables d'environnement

Fichier `.env` :
```env
VITE_API_URL=http://localhost:3002
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Démarrage

```bash
# Frontend
cd project
npm install
npm run dev

# Backend (dans un autre terminal)
cd project/backend
npm install
npm run dev
```

### Accès
- Frontend : http://localhost:5173/#/passenger
- Backend : http://localhost:3002

---

## 📊 Flux de données

### 1. Sélection du transport
```mermaid
User → Clic sur type → State Update → API Request → Display Trips
```

### 2. Réservation
```mermaid
User → Fill Form → Add Passengers → Calculate Price → Submit → API → Success
```

### 3. Calcul tarifaire
```mermaid
Passenger Added → Check Age → Apply Discount → Update Total → Display
```

---

## 🐛 Résolution de problèmes

### Problème : Trajets ne s'affichent pas
**Solution :**
1. Vérifier que le backend est démarré
2. Vérifier `VITE_API_URL` dans `.env`
3. Ouvrir la console (F12) pour voir les erreurs

### Problème : Autocomplétion ne fonctionne pas
**Solution :**
1. Vérifier l'endpoint `/api/public/cities`
2. Vérifier que des villes existent en base de données

### Problème : Réservation échoue
**Solution :**
1. Vérifier que l'utilisateur est connecté (JWT dans localStorage)
2. Vérifier les logs backend
3. Vérifier que le trajet a des places disponibles

---

## 📝 Notes importantes

### Réduction enfant
- Appliquée automatiquement pour les **moins de 5 ans**
- Réduction de **50%** sur le prix de base
- Badge visuel "-50%" affiché
- Calcul en temps réel

### Gestion des passagers
- **Minimum** : 1 passager
- **Maximum** : nombre de places disponibles
- Ajout/suppression dynamique
- Validation individuelle

### Sécurité
- JWT requis pour les réservations
- Validation côté serveur
- Timeout d'inactivité (2 minutes)
- Protection CORS

---

## 🎯 Prochaines améliorations possibles

1. **Paiement intégré** - Intégration de moyens de paiement (Mobile Money, etc.)
2. **Notifications SMS/Email** - Envoi automatique des billets
3. **Programme de fidélité** - Points et récompenses
4. **Avis et notes** - Système de notation des trajets
5. **Multi-langue** - Support français/lingala/swahili
6. **Mode hors ligne** - Cache des données importantes
7. **QR Code** - Billets avec QR code pour validation
8. **Partage de trajet** - Partager ses infos de voyage

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@congomuv.cd
- 📱 Téléphone : +243 XXX XXX XXX
- 🌐 Site web : https://congomuv.cd

---

**Développé avec ❤️ pour CongoMuv**
