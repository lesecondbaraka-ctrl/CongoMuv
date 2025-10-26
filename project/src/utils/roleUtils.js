// Définition des rôles et de leurs hiérarchies
export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  DRIVER: 'driver',
  PASSENGER: 'passenger'
};

// Définition des permissions par rôle
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'manage_all', // Toutes les permissions
    'manage_users',
    'manage_roles',
    'manage_vehicles',
    'manage_routes',
    'view_reports',
    'manage_bookings',
    'manage_settings',
    'manage_operators',
    'manage_drivers',
    'manage_passengers',
    'view_system_logs',
    'configure_system'
  ],
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_vehicles',
    'manage_routes',
    'view_reports',
    'manage_bookings',
    'manage_operators',
    'manage_drivers'
  ],
  [ROLES.OPERATOR]: [
    'manage_routes',
    'manage_vehicles',
    'view_reports',
    'manage_bookings',
    'view_driver_schedules'
  ],
  [ROLES.DRIVER]: [
    'view_own_schedule',
    'update_trip_status',
    'view_assigned_bookings',
    'update_vehicle_status'
  ],
  [ROLES.PASSENGER]: [
    'book_ride',
    'view_booking_history',
    'cancel_booking',
    'rate_driver',
    'update_profile'
  ]
};

// Hiérarchie des rôles (du plus élevé au plus bas)
const rolesHierarchy = [
  ROLES.SUPER_ADMIN, // Plus haut niveau d'autorisation
  ROLES.ADMIN,
  ROLES.OPERATOR,
  ROLES.DRIVER,
  ROLES.PASSENGER     // Niveau d'autorisation le plus bas
];

// Vérifie si un utilisateur a un rôle spécifique ou supérieur
export const hasRole = (userRole, requiredRole) => {
  if (!userRole) return false;
  
  const userRoleIndex = rolesHierarchy.indexOf(userRole.toLowerCase());
  const requiredRoleIndex = rolesHierarchy.indexOf(requiredRole.toLowerCase());
  
  // Si l'utilisateur a un rôle supérieur ou égal à celui requis
  return userRoleIndex <= requiredRoleIndex;
};

// Obtient le tableau de bord par défaut pour un rôle
export const getDashboardByRole = (role) => {
  if (!role) {
    console.warn('Aucun rôle fourni, redirection vers la page d\'accueil');
    return { path: '/', name: 'Accueil' };
  }
  
  const roleLower = String(role).toLowerCase().trim();
  console.log(`Rôle détecté pour la redirection: ${roleLower}`);
  
  // Gestion spéciale pour le rôle "user" qui devrait être "passenger"
  const normalizedRole = roleLower === 'user' ? 'passenger' : roleLower;
  
  // Le superadmin a accès à tout, y compris l'interface d'administration
  if (normalizedRole === ROLES.SUPER_ADMIN) {
    console.log('Redirection vers le tableau de bord Super Admin (accès complet)');
    return { 
      path: '/admin/dashboard', 
      name: 'Tableau de bord Super Admin',
      isAdmin: true,
      isSuperAdmin: true,
      // S'assurer que le chemin commence par un slash
      path: '/admin/dashboard'
    };
  }
  
  // Les autres rôles
  switch (normalizedRole) {
    case ROLES.ADMIN:
      console.log('Redirection vers le tableau de bord Admin');
      return { 
        path: '/admin/dashboard', 
        name: 'Tableau de bord Admin',
        isAdmin: true
      };
    case ROLES.OPERATOR:
      console.log('Redirection vers le tableau de bord Opérateur');
      return { 
        path: '/operator/dashboard', 
        name: 'Tableau de bord Opérateur',
        isOperator: true
      };
    case ROLES.DRIVER:
      console.log('Redirection vers le tableau de bord Chauffeur');
      return { 
        path: '/driver/dashboard', 
        name: 'Tableau de bord Chauffeur',
        isDriver: true
      };
    case ROLES.PASSENGER:
      console.log('Redirection vers le tableau de bord Passager');
      return { 
        path: '/dashboard', 
        name: 'Mon Tableau de bord',
        isPassenger: true
      };
    default:
      console.warn(`Rôle inconnu: ${role}, redirection vers la page d'accueil`);
      return { path: '/', name: 'Accueil' };
  }
};

// Vérifie si un rôle a une permission spécifique
export const checkPermission = (role, requiredPermission) => {
  if (!role) {
    console.log('[PERMISSION] Aucun rôle fourni');
    return false;
  }
  
  const roleLower = String(role).toLowerCase().trim();
  
  // Le superadmin a automatiquement toutes les permissions
  if (roleLower === ROLES.SUPER_ADMIN) {
    console.log(`[PERMISSION] SuperAdmin - Accès accordé à: ${requiredPermission}`);
    return true;
  }
  
  // Normalisation du rôle
  let normalizedRole = roleLower;
  if (roleLower === 'super_admin') {
    normalizedRole = 'superadmin';
  }
  
  // Recherche du rôle dans ROLES
  const roleKey = Object.keys(ROLES).find(key => 
    ROLES[key].toLowerCase() === normalizedRole
  );

  if (!roleKey) {
    console.warn(`[PERMISSION] Rôle inconnu: ${role} (normalisé: ${normalizedRole})`);
    return false;
  }

  // Vérifie si le rôle a la permission demandée ou la permission 'manage_all'
  const permissions = PERMISSIONS[roleKey] || [];
  return permissions.includes(requiredPermission) || permissions.includes('manage_all');
};
