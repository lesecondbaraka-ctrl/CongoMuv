export const operators = [
  {
    id: 1,
    name: 'ONATRA',
    type: 'public',
    description: 'Office National des Transports',
    logo: '/logos/onatra.png',
    services: ['train', 'fluvial']
  },
  {
    id: 2,
    name: 'TRANSCO',
    type: 'public',
    description: 'Transport au Congo',
    logo: '/logos/transco.png',
    services: ['bus']
  },
  {
    id: 3,
    name: 'Agence Express',
    type: 'private',
    description: 'Transport interurbain privé',
    logo: '/logos/express.png',
    services: ['bus']
  },
  {
    id: 4,
    name: 'MariTime Express',
    type: 'private',
    description: 'Transport fluvial privé',
    logo: '/logos/maritime.png',
    services: ['fluvial']
  }
];

export const transportTypes = [
  {
    id: 1,
    name: 'Train ONATRA',
    icon: 'train',
    operator_id: 1,
    description: 'Service ferroviaire national'
  },
  {
    id: 2,
    name: 'Fluvial',
    icon: 'ship',
    operator_id: 1,
    description: 'Transport fluvial ONATRA'
  },
  {
    id: 3,
    name: 'TRANSCO',
    icon: 'bus',
    operator_id: 2,
    description: 'Bus urbains et interurbains'
  },
  {
    id: 4,
    name: 'Privé',
    icon: 'bus',
    operator_id: 3,
    description: 'Services de transport privés'
  }
];

export const routes = [
  // Routes Train ONATRA
  {
    id: 1,
    operator_id: 1,
    transport_type_id: 1,
    departure_city: 'Kinshasa',
    arrival_city: 'Matadi',
    base_price: 50000,
    estimated_duration_minutes: 240,
    distance_km: 350,
    is_active: true
  },
  {
    id: 2,
    operator_id: 1,
    transport_type_id: 1,
    departure_city: 'Kinsuka',
    arrival_city: 'Maluku',
    base_price: 5000,
    estimated_duration_minutes: 90,
    distance_km: 30,
    is_active: true
  },
  // Routes Fluviales ONATRA
  {
    id: 3,
    operator_id: 1,
    transport_type_id: 2,
    departure_city: 'Kinshasa',
    arrival_city: 'Brazzaville',
    base_price: 15000,
    estimated_duration_minutes: 45,
    distance_km: 4,
    is_active: true
  },
  // Routes TRANSCO
  {
    id: 4,
    operator_id: 2,
    transport_type_id: 3,
    departure_city: 'Kinshasa',
    arrival_city: 'Kinsuka',
    base_price: 2500,
    estimated_duration_minutes: 60,
    distance_km: 15,
    is_active: true
  },
  {
    id: 5,
    operator_id: 2,
    transport_type_id: 3,
    departure_city: 'Kinshasa',
    arrival_city: 'Maluku',
    base_price: 3500,
    estimated_duration_minutes: 90,
    distance_km: 25,
    is_active: true
  },
  // Routes Privées
  {
    id: 6,
    operator_id: 3,
    transport_type_id: 4,
    departure_city: 'Kinshasa',
    arrival_city: 'Lubumbashi',
    base_price: 150000,
    estimated_duration_minutes: 1440, // 24 heures
    distance_km: 1500,
    is_active: true
  },
  {
    id: 7,
    operator_id: 3,
    transport_type_id: 4,
    departure_city: 'Kinshasa',
    arrival_city: 'Goma',
    base_price: 180000,
    estimated_duration_minutes: 1800, // 30 heures
    distance_km: 1800,
    is_active: true
  }
];

export const trips = [
  // Voyages Train ONATRA
  {
    id: 1,
    route_id: 1,
    departure_time: '2025-10-15T08:00:00',
    arrival_time: '2025-10-15T12:00:00',
    available_seats: 120,
    vehicle_number: 'ONATRA-T001',
    status: 'scheduled',
    driver_name: 'Jean Lokombe',
    total_seats: 150
  },
  {
    id: 2,
    route_id: 2,
    departure_time: '2025-10-15T09:00:00',
    arrival_time: '2025-10-15T10:30:00',
    available_seats: 80,
    vehicle_number: 'ONATRA-T002',
    status: 'scheduled',
    driver_name: 'Pierre Mukendi',
    total_seats: 100
  },
  // Voyages Fluviaux ONATRA
  {
    id: 3,
    route_id: 3,
    departure_time: '2025-10-15T07:00:00',
    arrival_time: '2025-10-15T07:45:00',
    available_seats: 150,
    vehicle_number: 'ONATRA-B001',
    status: 'scheduled',
    driver_name: 'Paul Kayembe',
    total_seats: 200
  },
  // Voyages TRANSCO
  {
    id: 4,
    route_id: 4,
    departure_time: '2025-10-15T08:00:00',
    arrival_time: '2025-10-15T09:00:00',
    available_seats: 45,
    vehicle_number: 'TRANSCO-B001',
    status: 'scheduled',
    driver_name: 'Marc Lusamba',
    total_seats: 60
  },
  {
    id: 5,
    route_id: 5,
    departure_time: '2025-10-15T10:00:00',
    arrival_time: '2025-10-15T11:30:00',
    available_seats: 35,
    vehicle_number: 'TRANSCO-B002',
    status: 'scheduled',
    driver_name: 'Jacques Mbala',
    total_seats: 60
  },
  // Voyages Privés
  {
    id: 6,
    route_id: 6,
    departure_time: '2025-10-15T06:00:00',
    arrival_time: '2025-10-16T06:00:00',
    available_seats: 25,
    vehicle_number: 'EXPRESS-B001',
    status: 'scheduled',
    driver_name: 'Robert Kalonji',
    total_seats: 45
  },
  {
    id: 7,
    route_id: 7,
    departure_time: '2025-10-15T07:00:00',
    arrival_time: '2025-10-16T13:00:00',
    available_seats: 30,
    vehicle_number: 'EXPRESS-B002',
    status: 'scheduled',
    driver_name: 'Simon Kabongo',
    total_seats: 45
  }
];

export const bookings = [
  {
    id: 1,
    trip_id: 1,
    user_id: 'user-1',
    booking_date: '2025-10-14T15:30:00',
    passenger_count: 2,
    total_price: 100000,
    status: 'confirmed',
    payment_status: 'paid',
    payment_method: 'mobile_money',
    qr_code: 'data:image/png;base64,iVBORw0K...',
    ticket_number: 'TKT-2025101400001',
    passengers: [
      {
        full_name: 'Jean Mukendi',
        age: 35,
        type: 'adult'
      },
      {
        full_name: 'Marie Mukendi',
        age: 4,
        type: 'child' // -50% pour les moins de 5 ans
      }
    ]
  }
];

export const users = [
  {
    id: 'user-1',
    email: 'sumbaestime@gmail.com',
    phone: '+243 821 938 773',
    full_name: 'Estimé SUMBA MUKALAMUSI',
    created_at: '2025-10-14T00:00:00'
  }
];

export function searchTrips(params: {
  departureCity: string;
  arrivalCity: string;
  date: string;
  passengers: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  operator?: string;
  sortBy?: string;
}) {
  let filteredTrips = trips.map(trip => {
    const route = routes.find(r => r.id === trip.route_id);
    const operator = route ? operators.find(o => o.id === route.operator_id) : null;
    const transport_type = route ? transportTypes.find(t => t.id === route.transport_type_id) : null;
    
    return {
      ...trip,
      route: route ? {
        ...route,
        operator,
        transport_type
      } : null
    };
  });

  // Filter by cities
  if (params.departureCity) {
    filteredTrips = filteredTrips.filter(trip => 
      trip.route?.departure_city.toLowerCase().includes(params.departureCity.toLowerCase())
    );
  }

  if (params.arrivalCity) {
    filteredTrips = filteredTrips.filter(trip => 
      trip.route?.arrival_city.toLowerCase().includes(params.arrivalCity.toLowerCase())
    );
  }

  // Filter by date (only compare the date part)
  if (params.date) {
    const searchDate = new Date(params.date).toDateString();
    filteredTrips = filteredTrips.filter(trip => 
      new Date(trip.departure_time).toDateString() === searchDate
    );
  }

  // Filter by price
  if (params.maxPrice) {
    filteredTrips = filteredTrips.filter(trip => 
      (trip.route?.base_price || 0) <= params.maxPrice!
    );
  }

  // Filter by duration
  if (params.minDuration) {
    filteredTrips = filteredTrips.filter(trip => 
      (trip.route?.estimated_duration_minutes || 0) >= params.minDuration! * 60
    );
  }

  if (params.maxDuration) {
    filteredTrips = filteredTrips.filter(trip => 
      (trip.route?.estimated_duration_minutes || 0) <= params.maxDuration! * 60
    );
  }

  // Filter by operator
  if (params.operator) {
    filteredTrips = filteredTrips.filter(trip => 
      trip.route?.operator?.name === params.operator
    );
  }

  // Sort results
  if (params.sortBy) {
    filteredTrips.sort((a, b) => {
      switch (params.sortBy) {
        case 'departure_time':
          return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
        case 'route.base_price':
          return (a.route?.base_price || 0) - (b.route?.base_price || 0);
        case 'route.estimated_duration_minutes':
          return (a.route?.estimated_duration_minutes || 0) - (b.route?.estimated_duration_minutes || 0);
        default:
          return 0;
      }
    });
  }

  return filteredTrips;
}