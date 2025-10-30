// Rôles des utilisateurs
export const USER_ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  CUSTOMER: 'customer',
  GUEST: 'guest'
};

// Permissions
export const PERMISSIONS = {
  // Gestion des utilisateurs
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Gestion des rôles et permissions
  MANAGE_ROLES: 'manage_roles',
  MANAGE_PERMISSIONS: 'manage_permissions',
  
  // Gestion des itinéraires
  VIEW_ROUTES: 'view_routes',
  CREATE_ROUTES: 'create_routes',
  EDIT_ROUTES: 'edit_routes',
  DELETE_ROUTES: 'delete_routes',
  
  // Gestion des trajets
  VIEW_TRIPS: 'view_trips',
  CREATE_TRIPS: 'create_trips',
  EDIT_TRIPS: 'edit_trips',
  DELETE_TRIPS: 'delete_trips',
  
  // Gestion des véhicules
  VIEW_VEHICLES: 'view_vehicles',
  CREATE_VEHICLES: 'create_vehicles',
  EDIT_VEHICLES: 'edit_vehicles',
  DELETE_VEHICLES: 'delete_vehicles',
  
  // Gestion des réservations
  VIEW_BOOKINGS: 'view_bookings',
  CREATE_BOOKINGS: 'create_bookings',
  EDIT_BOOKINGS: 'edit_bookings',
  CANCEL_BOOKINGS: 'cancel_bookings',
  
  // Rapports et analyses
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data'
};

// Types d'itinéraires
export const ROUTE_TYPES = [
  { id: 'intercity', name: 'Interurbain', description: 'Trajets entre villes éloignées' },
  { id: 'intracity', name: 'Urbain', description: 'Trajets à l\'intérieur d\'une ville' },
  { id: 'airport', name: 'Aéroport', description: 'Navettes aéroportuaires' },
  { id: 'special', name: 'Spécial', description: 'Circuits touristiques ou spéciaux' },
];

// Types de véhicules
export const VEHICLE_TYPES = [
  { id: 'bus', name: 'Bus', icon: '🚌', capacity: 50 },
  { id: 'minibus', name: 'Minibus', icon: '🚐', capacity: 20 },
  { id: 'van', name: 'Fourgonnette', icon: '🚐', capacity: 12 },
  { id: 'car', name: 'Voiture', icon: '🚗', capacity: 4 },
  { id: 'other', name: 'Autre', icon: '🚙', capacity: 1 },
];

// Équipements des véhicules
export const VEHICLE_AMENITIES = [
  { id: 'ac', name: 'Climatisation', icon: '❄️' },
  { id: 'wifi', name: 'Wi-Fi', icon: '📶' },
  { id: 'toilet', name: 'Toilettes', icon: '🚻' },
  { id: 'usb', name: 'Ports USB', icon: '🔌' },
  { id: 'tv', name: 'Télévision', icon: '📺' },
  { id: 'snacks', name: 'Collations', icon: '🍪' },
  { id: 'blanket', name: 'Couvertures', icon: '🛌' },
  { id: 'pillow', name: 'Oreillers', icon: '🛏️' },
];

// Types de paiement
export const PAYMENT_METHODS = [
  { id: 'cash', name: 'Espèces', icon: '💵' },
  { id: 'credit_card', name: 'Carte bancaire', icon: '💳' },
  { id: 'mobile_money', name: 'Mobile Money', icon: '📱' },
  { id: 'bank_transfer', name: 'Virement bancaire', icon: '🏦' },
  { id: 'other', name: 'Autre', icon: '🔖' },
];

// Statuts des réservations
export const BOOKING_STATUSES = [
  { id: 'pending', name: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'confirmed', name: 'Confirmée', color: 'bg-green-100 text-green-800' },
  { id: 'cancelled', name: 'Annulée', color: 'bg-red-100 text-red-800' },
  { id: 'completed', name: 'Terminée', color: 'bg-blue-100 text-blue-800' },
  { id: 'no_show', name: 'Non présenté', color: 'bg-gray-100 text-gray-800' },
];

// Types de pièces d'identité
export const ID_TYPES = [
  { id: 'id_card', name: 'Carte d\'identité' },
  { id: 'passport', name: 'Passeport' },
  { id: 'driver_license', name: 'Permis de conduire' },
  { id: 'voter_id', name: 'Carte d\'électeur' },
  { id: 'other', name: 'Autre' },
];

// Jours de la semaine
export const WEEK_DAYS = [
  { id: 'monday', name: 'Lundi', shortName: 'Lun' },
  { id: 'tuesday', name: 'Mardi', shortName: 'Mar' },
  { id: 'wednesday', name: 'Mercredi', shortName: 'Mer' },
  { id: 'thursday', name: 'Jeudi', shortName: 'Jeu' },
  { id: 'friday', name: 'Vendredi', shortName: 'Ven' },
  { id: 'saturday', name: 'Samedi', shortName: 'Sam' },
  { id: 'sunday', name: 'Dimanche', shortName: 'Dim' },
];

// Fréquences des trajets
export const TRIP_FREQUENCIES = [
  { id: 'once', name: 'Une seule fois' },
  { id: 'daily', name: 'Tous les jours' },
  { id: 'weekdays', name: 'Jours de semaine' },
  { id: 'weekends', name: 'Week-ends' },
  { id: 'custom', name: 'Personnalisé' },
];

// Durées par défaut (en minutes)
export const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 heures' },
  { value: 180, label: '3 heures' },
  { value: 240, label: '4 heures' },
  { value: 300, label: '5 heures' },
  { value: 360, label: '6 heures' },
  { value: 480, label: '8 heures' },
  { value: 720, label: '12 heures' },
  { value: 1440, label: '24 heures' },
];

// Options de pagination
export const PAGINATION_OPTIONS = [
  { value: 10, label: '10 par page' },
  { value: 25, label: '25 par page' },
  { value: 50, label: '50 par page' },
  { value: 100, label: '100 par page' },
];

// Options de tri
export const SORT_OPTIONS = {
  PRICE_ASC: { value: 'price_asc', label: 'Prix croissant' },
  PRICE_DESC: { value: 'price_desc', label: 'Prix décroissant' },
  DEPARTURE_ASC: { value: 'departure_asc', label: 'Départ tôt' },
  DEPARTURE_DESC: { value: 'departure_desc', label: 'Départ tard' },
  DURATION_ASC: { value: 'duration_asc', label: 'Durée courte' },
  DURATION_DESC: { value: 'duration_desc', label: 'Durée longue' },
};

// Codes de pays et indicatifs téléphoniques
export const COUNTRY_CODES = [
  { code: '+243', name: 'République Démocratique du Congo' },
  { code: '+242', name: 'République du Congo' },
  { code: '+225', name: 'Côte d\'Ivoire' },
  { code: '+237', name: 'Cameroun' },
  { code: '+229', name: 'Bénin' },
  { code: '+226', name: 'Burkina Faso' },
  { code: '+257', name: 'Burundi' },
  // Ajoutez d'autres pays si nécessaire
];

// Configuration des cartes (Google Maps, Mapbox, etc.)
export const MAP_CONFIG = {
  // Clé API Google Maps (à remplacer par votre clé)
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  // Style de carte par défaut
  defaultCenter: { lat: -4.0383, lng: 21.7587 }, // Centre sur la RDC
  defaultZoom: 5,
  // Options de style de la carte
  mapStyles: {
    width: '100%',
    height: '400px',
  },
};

// Configuration des notifications
export const NOTIFICATION_SETTINGS = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Configuration des devises
export const CURRENCY = {
  code: 'CDF',
  symbol: 'FC',
  name: 'Franc Congolais',
  locale: 'fr-CD',
};

// Formatage des dates
export const DATE_FORMATS = {
  short: 'dd/MM/yyyy',
  medium: 'd MMM yyyy',
  long: 'EEEE d MMMM yyyy',
  time: 'HH:mm',
  dateTime: 'dd/MM/yyyy HH:mm',
  api: 'yyyy-MM-dd',
  apiDateTime: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
};

export default {
  USER_ROLES,
  PERMISSIONS,
  ROUTE_TYPES,
  VEHICLE_TYPES,
  VEHICLE_AMENITIES,
  PAYMENT_METHODS,
  BOOKING_STATUSES,
  ID_TYPES,
  WEEK_DAYS,
  TRIP_FREQUENCIES,
  DURATION_OPTIONS,
  PAGINATION_OPTIONS,
  SORT_OPTIONS,
  COUNTRY_CODES,
  MAP_CONFIG,
  NOTIFICATION_SETTINGS,
  CURRENCY,
  DATE_FORMATS,
};
