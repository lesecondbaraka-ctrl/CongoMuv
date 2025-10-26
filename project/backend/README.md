# Backend CongoMuv - API REST

Backend API pour le système E-Ticket CongoMuv, développé avec Node.js/Express et PostgreSQL.

## 🚀 Fonctionnalités

- **API REST complète** pour tous les modules (opérateurs, trajets, réservations, paiements)
- **Authentification sécurisée** avec JWT et gestion des rôles
- **Intégration des paiements** (Flutterwave, Mobile Money)
- **Base de données PostgreSQL** avec schéma optimisé
- **WebSocket temps réel** pour le suivi GPS
- **Audit et logging** complets
- **Sécurité avancée** (2FA, chiffrement AES-256)

## 📋 Prérequis

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- Redis (optionnel, pour le cache)

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd congomuv/backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Configurer PostgreSQL**
```sql
-- Créer la base de données
CREATE DATABASE congomuv;

-- Le schéma sera créé automatiquement au démarrage
```

5. **Démarrer le serveur**
```bash
npm run dev  # Développement avec nodemon
# ou
npm start    # Production
```

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── config/          # Configuration (DB, Redis, etc.)
│   ├── controllers/     # Contrôleurs API
│   ├── middleware/      # Middleware personnalisé
│   ├── models/         # Modèles de données (optionnel)
│   ├── routes/         # Routes API
│   ├── services/       # Services métier (paiements, emails, etc.)
│   ├── utils/          # Utilitaires (QR codes, validation, etc.)
│   └── server.js       # Point d'entrée de l'application
├── tests/              # Tests unitaires et d'intégration
└── package.json
```

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Opérateurs
- `GET /api/operators` - Liste des opérateurs
- `GET /api/operators/:id` - Détails d'un opérateur
- `POST /api/operators` - Créer un opérateur (Admin uniquement)
- `PUT /api/operators/:id` - Modifier un opérateur
- `DELETE /api/operators/:id` - Supprimer un opérateur

### Trajets et Réservations
- `GET /api/trips` - Rechercher des trajets
- `POST /api/bookings` - Créer une réservation
- `GET /api/bookings` - Mes réservations
- `PUT /api/bookings/:id/cancel` - Annuler une réservation

### Paiements
- `POST /api/payments/initiate` - Initialiser un paiement
- `GET /api/payments/verify/:id` - Vérifier un paiement
- `POST /api/payments/refund/:id` - Rembourser un paiement

### Administration
- `GET /api/admin/stats` - Statistiques générales
- `GET /api/admin/users` - Gestion des utilisateurs
- `POST /api/admin/operators` - Gestion des opérateurs

## 🔐 Sécurité

- **JWT Authentication** avec gestion des rôles
- **Rate limiting** (100 requêtes/15min par IP)
- **CORS** configuré
- **Helmet.js** pour la sécurité des headers
- **Validation des données** avec Joi
- **Audit logging** de toutes les actions
- **Chiffrement AES-256** pour les données sensibles

## 🚀 Déploiement

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build  # Si applicable
npm start
```

### Docker (optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Base de Données

### Schéma PostgreSQL
- **users** - Utilisateurs du système
- **organizations** - Opérateurs de transport
- **routes** - Lignes de transport
- **trips** - Trajets programmés
- **bookings** - Réservations
- **payments** - Transactions de paiement
- **notifications** - Notifications utilisateurs
- **audit_logs** - Journal d'audit

### Migration automatique
Le schéma est créé automatiquement au démarrage si les tables n'existent pas.

## 🔧 Configuration Environnementale

Voir `.env.example` pour la liste complète des variables d'environnement requises.

Variables importantes :
- `DB_*` - Configuration PostgreSQL
- `FLW_*` - Clés API Flutterwave
- `JWT_SECRET` - Secret JWT
- `FRONTEND_URL` - URL du frontend

## 📱 Intégrations Externes

- **Flutterwave** - Passerelle de paiement
- **Twilio** - SMS de confirmation
- **Nodemailer** - Emails transactionnels
- **Socket.IO** - Communication temps réel
- **Redis** - Cache et sessions

## 🧪 Tests

```bash
npm test                    # Lancer tous les tests
npm test -- --coverage      # Avec couverture de code
npm test -- --watch         # Mode watch
```

## 📈 Monitoring

- **Morgan** - Logging HTTP
- **Health check** endpoint `/health`
- **Métriques de performance** intégrées
- **Alertes automatiques** configurables

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence propriétaire CongoMuv.

## 📞 Support

Pour toute question ou support :
- Email : support@congomuv.cd
- Téléphone : +243 821 938 773

---

**Développé avec ❤️ pour la République Démocratique du Congo** 🇨🇩
