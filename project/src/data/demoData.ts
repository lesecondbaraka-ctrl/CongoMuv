// Données de démonstration pour les opérateurs
export const demoOperators = [
  {
    id: 'op-1',
    name: 'TransCongo Express',
    contact_email: 'contact@transcongo.cd',
    contact_phone: '+243 81 234 5678',
    address: 'Avenue de la Gare 123, Kinshasa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'transco',
    is_active: true,
    city: 'Kinshasa',
    country: 'RDC'
  },
  {
    id: 'op-2',
    name: 'Kinshasa Transport',
    contact_email: 'contact@kinshasatransport.cd',
    contact_phone: '+243 82 345 6789',
    address: 'Boulevard du 30 Juin, Kinshasa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'transco',
    is_active: true,
    city: 'Kinshasa',
    country: 'RDC'
  },
  {
    id: 'op-3',
    name: 'ONATRA Train',
    contact_email: 'contact@onatra.cd',
    contact_phone: '+243 81 876 5432',
    address: 'Gare Centrale, Kinshasa',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    type: 'train',
    is_active: true,
    city: 'Kinshasa',
    country: 'RDC'
  }
];

// Données de démonstration pour les routes
export const demoRoutes = [
  {
    id: 'route-1',
    operator_id: 'op-1',
    transport_type_id: '1',
    departure_city: 'Kinshasa',
    arrival_city: 'Lubumbashi',
    distance_km: 2000,
    estimated_duration_minutes: 1440,
    base_price: 150000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'route-2',
    operator_id: 'op-2',
    transport_type_id: '1',
    departure_city: 'Kinshasa',
    arrival_city: 'Matadi',
    distance_km: 350,
    estimated_duration_minutes: 300,
    base_price: 35000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'route-3',
    operator_id: 'op-3',
    transport_type_id: '2',
    departure_city: 'Kinshasa',
    arrival_city: 'Goma',
    distance_km: 1800,
    estimated_duration_minutes: 1200,
    base_price: 120000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Données de démonstration pour les voyages
export const demoTrips = [
  {
    id: 'trip-1',
    route_id: 'route-1',
    operator_id: 'op-1',
    departure_time: new Date(Date.now() + 86400000).toISOString(), // Demain
    arrival_time: new Date(Date.now() + 2 * 86400000).toISOString(), // Après-demain
    status: 'SCHEDULED',
    available_seats: 45,
    price: 150000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vehicle_number: 'TC-001'
  },
  {
    id: 'trip-2',
    route_id: 'route-2',
    operator_id: 'op-2',
    departure_time: new Date(Date.now() + 2 * 86400000).toISOString(), // Après-demain
    arrival_time: new Date(Date.now() + 2 * 86400000 + 5 * 60 * 60000).toISOString(), // 5 heures plus tard
    status: 'SCHEDULED',
    available_seats: 20,
    price: 35000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vehicle_number: 'KT-205'
  },
  {
    id: 'trip-3',
    route_id: 'route-3',
    operator_id: 'op-3',
    departure_time: new Date(Date.now() + 3 * 86400000).toISOString(), // Dans 3 jours
    arrival_time: new Date(Date.now() + 4 * 86400000).toISOString(), // Dans 4 jours
    status: 'SCHEDULED',
    available_seats: 30,
    price: 120000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vehicle_number: 'TRAIN-01'
  }
];

// Données de démonstration pour les incidents
export const demoIncidents = [
  {
    id: 'inc-1',
    type: 'Retard',
    description: 'Retard de 30 minutes sur la ligne Kinshasa-Matadi',
    severity: 'medium',
    status: 'open',
    location: 'Gare de Kinshasa',
    created_at: new Date().toISOString(),
    date: new Date().toISOString()
  },
  {
    id: 'inc-2',
    type: 'Panne',
    description: 'Panne moteur sur véhicule BUS001',
    severity: 'high',
    status: 'in_progress',
    location: 'Route N1 Km 45',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'inc-3',
    type: 'Accident mineur',
    description: 'Collision légère sans blessés',
    severity: 'low',
    status: 'resolved',
    location: 'Carrefour Victoire',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    date: new Date(Date.now() - 172800000).toISOString()
  }
];

// Données de démonstration pour les utilisateurs
export const demoUsers = [
  {
    id: 'user-1',
    email: 'admin@congomuv.cd',
    full_name: 'Jean Kabongo',
    role: 'SUPER_ADMIN',
    phone: '+243 81 111 2222',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'user-2',
    email: 'marie.lukeni@congomuv.cd',
    full_name: 'Marie Lukeni',
    role: 'ADMIN',
    phone: '+243 82 222 3333',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'user-3',
    email: 'operator@transcongo.cd',
    full_name: 'Pierre Mbuyi',
    role: 'OPERATOR',
    phone: '+243 83 333 4444',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'user-4',
    email: 'client@example.cd',
    full_name: 'Sarah Nzuzi',
    role: 'USER',
    phone: '+243 84 444 5555',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true
  }
];
