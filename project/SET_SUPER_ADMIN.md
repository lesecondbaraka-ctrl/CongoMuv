# 🛡️ Comment devenir SUPER_ADMIN pour tester

## Méthode 1 : Console du navigateur (RECOMMANDÉ)

1. **Ouvrez votre application** dans le navigateur : http://localhost:5174
2. **Ouvrez la console** : Appuyez sur `F12` ou clic droit → Inspecter
3. **Collez ce code** dans la console et appuyez sur Entrée :

```javascript
// Définir le rôle SUPER_ADMIN
localStorage.setItem('app_role', 'SUPER_ADMIN');
localStorage.setItem('app_email', 'superadmin@congomuv.cd');
localStorage.setItem('app_jwt', 'test-super-admin-token-123');

// Rediriger vers le dashboard admin
window.location.hash = '#/admin';
window.location.reload();
```

4. **Rechargez la page** - Vous verrez maintenant le badge "🛡️ SUPER ADMIN"

---

## Méthode 2 : Créer un compte SUPER_ADMIN via la page d'accès

Si vous êtes déjà connecté en tant que SUPER_ADMIN :
1. Allez dans **"Gestion des accès"** (menu latéral)
2. Invitez un nouvel admin avec le rôle **"SUPER_ADMIN (Contrôle total)"**

---

## ✅ Vérification

Une fois connecté en SUPER_ADMIN, vous devriez voir :

### Badge visible
- 🛡️ **"SUPER ADMIN"** dans la sidebar (en haut)
- 🛡️ **"SUPER ADMIN - Contrôle Total"** dans le header (desktop)

### Accès complet à :
- ✓ **Dashboard** - Statistiques générales
- ✓ **Trajets** - Créer, modifier, supprimer (avec indication "Accès complet")
- ✓ **Voyages** - Gérer tous les voyages
- ✓ **Opérateurs** 🔒 - Section réservée SUPER_ADMIN
- ✓ **Utilisateurs** - Modifier rôles et permissions
- ✓ **Incidents** - Gestion complète
- ✓ **Gestion des accès** 🔒 - Section critique (inviter d'autres admins, y compris SUPER_ADMIN)

### Permissions spéciales
- **Peut inviter d'autres SUPER_ADMIN** (option dans le dropdown)
- **Contrôle tous les opérateurs** de transport
- **Modifier les rôles** de tous les utilisateurs

---

## 🔄 Revenir en mode ADMIN normal

```javascript
localStorage.setItem('app_role', 'ADMIN');
window.location.reload();
```

---

## 🎨 Indicateurs visuels du SUPER_ADMIN

1. **Badge violet/rose** en haut de la sidebar
2. **Badge horizontal** dans le header (desktop)
3. **Messages en violet** sous chaque titre de section :
   - "✓ Accès complet : Créer, Modifier, Supprimer"
   - "🛡️ Section réservée SUPER_ADMIN"
   - "✓ Tous les utilisateurs - Modifier rôles et permissions"

---

## 📝 Notes importantes

- Le SUPER_ADMIN a **TOUS les droits** sans exception
- Les sections "Opérateurs" et "Gestion des accès" sont **exclusives** au SUPER_ADMIN
- Les autres admins (ADMIN, CONGOMUV_HQ, etc.) ne verront PAS ces sections
