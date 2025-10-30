import { useState, useEffect } from 'react';
import { MapPin, Calendar, ArrowRight, Ticket, LogOut, Clock } from 'lucide-react';
import { TransportOption, TransportTypeEnum, BookingFormData } from '../types/passenger';
import { Trip } from '../types';
import { PassengerBookingModal } from '../components/PassengerBookingModal';
import { MyTripsModal } from '../components/MyTripsModal';
import { PaymentModal } from '../components/PaymentModal';
import { SupportFAQ } from '../components/SupportFAQ';

const TRANSPORT_OPTIONS: TransportOption[] = [
  {
    id: 'train',
    name: 'Train ONATRA',
    icon: 'Train',
    emoji: '🚆',
    description: 'Confortable et rapide'
  },
  {
    id: 'fluvial',
    name: 'Transport Fluvial',
    icon: 'Ship',
    emoji: '🚢',
    description: 'Navigation sur le fleuve'
  },
  {
    id: 'transco',
    name: 'Bus Transco',
    icon: 'Bus',
    emoji: '🚌',
    description: 'Bus inter-urbain'
  },
  {
    id: 'private',
    name: 'Transport Privé',
    icon: 'Car',
    emoji: '🚗',
    description: 'Véhicule privé'
  }
];

const getTransportIcon = (emoji: string) => {
  return <span className="text-4xl">{emoji}</span>;
};

export function PassengerApp() {
  const [selectedTransport, setSelectedTransport] = useState<TransportTypeEnum | ''>('');
  const [bookingData, setBookingData] = useState<BookingFormData>({
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    departureTime: '',
    passengers: [],
    transportType: ''
  });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; token?: string } | null>(null);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTripsModal, setShowTripsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showMyTrips, setShowMyTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('app_jwt');
    if (token) {
      setUser({ 
        id: 'default-id', // Remplacez par l'ID réel de l'utilisateur
        name: 'default-name', // Remplacez par le nom réel de l'utilisateur
        email: 'default-email', // Remplacez par l'email réel de l'utilisateur
        token 
      });
    }
    
    // Données de démonstration pour les villes
    const demoCities = [
      { id: '1', name: 'Kinshasa' },
      { id: '2', name: 'Lubumbashi' },
      { id: '3', name: 'Matadi' },
      { id: '4', name: 'Goma' },
      { id: '5', name: 'Kisangani' },
      { id: '6', name: 'Bukavu' },
      { id: '7', name: 'Kolwezi' },
      { id: '8', name: 'Kamina' },
      { id: '9', name: 'Mbandaka' },
      { id: '10', name: 'Bandundu' },
      { id: '11', name: 'Mbuji-Mayi' },
      { id: '12', name: 'Kananga' }
    ];
    setCities(demoCities);
    
    // Charger tous les trajets par défaut pour la démonstration
    setTimeout(() => {
      const defaultTrips = getDemoTrips();
      setTrips(defaultTrips);
    }, 500);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('app_jwt');
    localStorage.removeItem('app_role');
    setUser(null);
    window.location.hash = '#/login';
  };

  const handleTransportSelect = (transportType: TransportTypeEnum) => {
    setSelectedTransport(transportType);
    setBookingData({ ...bookingData, transportType });
    // Auto-rechercher les trajets disponibles pour ce type de transport
    searchTripsByTransportType(transportType);
  };

  // Données de démonstration pour les trajets
  const getDemoTrips = (transportType?: TransportTypeEnum) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const allDemoTrips: Trip[] = [
      // 1. TRANSCO - Kinshasa → Lubumbashi (Bus longue distance)
      {
        id: 1,
        route_id: 1,
        departure_time: new Date(tomorrow.setHours(8, 0)).toISOString(),
        arrival_time: new Date(tomorrow.setHours(20, 0)).toISOString(),
        available_seats: 45,
        vehicle_number: 'TC-001',
        total_seats: 50,
        status: 'scheduled',
        route: {
          id: 1,
          operator_id: 1,
          transport_type_id: 1,
          departure_city: 'Kinshasa',
          arrival_city: 'Lubumbashi',
          distance_km: 1800,
          estimated_duration_minutes: 720,
          base_price: 150000,
          is_active: true,
          operator: { id: 1, name: 'TransCongo Express', type: 'transco', is_active: true }
        }
      },
      // 2. TRANSCO - Kinshasa → Matadi (Bus régional)
      {
        id: 2,
        route_id: 2,
        departure_time: new Date(tomorrow.setHours(10, 30)).toISOString(),
        arrival_time: new Date(tomorrow.setHours(15, 30)).toISOString(),
        available_seats: 12,
        vehicle_number: 'KT-205',
        total_seats: 40,
        status: 'scheduled',
        route: {
          id: 2,
          operator_id: 2,
          transport_type_id: 2,
          departure_city: 'Kinshasa',
          arrival_city: 'Matadi',
          distance_km: 350,
          estimated_duration_minutes: 300,
          base_price: 35000,
          is_active: true,
          operator: { id: 2, name: 'Kinshasa Transport', type: 'transco', is_active: true }
        }
      },
      // 3. TRAIN - Kinshasa → Goma (Train longue distance)
      {
        id: 3,
        route_id: 3,
        departure_time: new Date(dayAfter.setHours(7, 0)).toISOString(),
        arrival_time: new Date(dayAfter.setHours(19, 0)).toISOString(),
        available_seats: 30,
        vehicle_number: 'TRAIN-01',
        total_seats: 45,
        status: 'scheduled',
        route: {
          id: 3,
          operator_id: 3,
          transport_type_id: 3,
          departure_city: 'Kinshasa',
          arrival_city: 'Goma',
          distance_km: 1500,
          estimated_duration_minutes: 720,
          base_price: 120000,
          is_active: true,
          operator: { id: 3, name: 'ONATRA Train', type: 'train', is_active: true }
        }
      },
      // 4. FLUVIAL - Kinshasa → Kisangani (Bateau)
      {
        id: 4,
        route_id: 4,
        departure_time: new Date(tomorrow.setHours(16, 0)).toISOString(),
        arrival_time: new Date(tomorrow.setHours(20, 0)).toISOString(),
        available_seats: 28,
        vehicle_number: 'BOAT-12',
        total_seats: 30,
        status: 'scheduled',
        route: {
          id: 4,
          operator_id: 4,
          transport_type_id: 4,
          departure_city: 'Kinshasa',
          arrival_city: 'Kisangani',
          distance_km: 800,
          estimated_duration_minutes: 240,
          base_price: 80000,
          is_active: true,
          operator: { id: 4, name: 'Transport Fluvial', type: 'fluvial', is_active: true }
        }
      },
      // 5. PRIVATE - Goma → Bukavu (Transport privé)
      {
        id: 5,
        route_id: 5,
        departure_time: new Date(dayAfter.setHours(9, 15)).toISOString(),
        arrival_time: new Date(dayAfter.setHours(12, 15)).toISOString(),
        available_seats: 8,
        vehicle_number: 'PV-007',
        total_seats: 8,
        status: 'scheduled',
        route: {
          id: 5,
          operator_id: 5,
          transport_type_id: 5,
          departure_city: 'Goma',
          arrival_city: 'Bukavu',
          distance_km: 150,
          estimated_duration_minutes: 180,
          base_price: 45000,
          is_active: true,
          operator: { id: 5, name: 'Transport Privé', type: 'private', is_active: true }
        }
      },
      // 6. TRANSCO - Lubumbashi → Kolwezi (Bus minier)
      {
        id: 6,
        route_id: 6,
        departure_time: new Date(tomorrow.setHours(6, 0)).toISOString(),
        arrival_time: new Date(tomorrow.setHours(10, 0)).toISOString(),
        available_seats: 35,
        vehicle_number: 'TC-102',
        total_seats: 45,
        status: 'scheduled',
        route: {
          id: 6,
          operator_id: 6,
          transport_type_id: 1,
          departure_city: 'Lubumbashi',
          arrival_city: 'Kolwezi',
          distance_km: 300,
          estimated_duration_minutes: 240,
          base_price: 25000,
          is_active: true,
          operator: { id: 6, name: 'Katanga Express', type: 'transco', is_active: true }
        }
      },
      // 7. TRAIN - Lubumbashi → Kamina (Train régional)
      {
        id: 7,
        route_id: 7,
        departure_time: new Date(dayAfter.setHours(14, 0)).toISOString(),
        arrival_time: new Date(dayAfter.setHours(20, 0)).toISOString(),
        available_seats: 22,
        vehicle_number: 'TRAIN-02',
        total_seats: 60,
        status: 'scheduled',
        route: {
          id: 7,
          operator_id: 3,
          transport_type_id: 3,
          departure_city: 'Lubumbashi',
          arrival_city: 'Kamina',
          distance_km: 450,
          estimated_duration_minutes: 360,
          base_price: 65000,
          is_active: true,
          operator: { id: 3, name: 'ONATRA Train', type: 'train', is_active: true }
        }
      },
      // 8. FLUVIAL - Kisangani → Mbandaka (Bateau fluvial)
      {
        id: 8,
        route_id: 8,
        departure_time: new Date(tomorrow.setHours(8, 30)).toISOString(),
        arrival_time: new Date(tomorrow.setHours(18, 30)).toISOString(),
        available_seats: 15,
        vehicle_number: 'BOAT-25',
        total_seats: 25,
        status: 'scheduled',
        route: {
          id: 8,
          operator_id: 4,
          transport_type_id: 4,
          departure_city: 'Kisangani',
          arrival_city: 'Mbandaka',
          distance_km: 600,
          estimated_duration_minutes: 600,
          base_price: 95000,
          is_active: true,
          operator: { id: 4, name: 'Transport Fluvial', type: 'fluvial', is_active: true }
        }
      },
      // 9. PRIVATE - Kinshasa → Bandundu (Minibus privé)
      {
        id: 9,
        route_id: 9,
        departure_time: new Date(tomorrow.setHours(12, 0)).toISOString(),
        arrival_time: new Date(tomorrow.setHours(16, 30)).toISOString(),
        available_seats: 6,
        vehicle_number: 'PV-015',
        total_seats: 12,
        status: 'scheduled',
        route: {
          id: 9,
          operator_id: 7,
          transport_type_id: 5,
          departure_city: 'Kinshasa',
          arrival_city: 'Bandundu',
          distance_km: 280,
          estimated_duration_minutes: 270,
          base_price: 28000,
          is_active: true,
          operator: { id: 7, name: 'Bandundu Express', type: 'private', is_active: true }
        }
      },
      // 10. TRANSCO - Mbuji-Mayi → Kananga (Bus inter-urbain)
      {
        id: 10,
        route_id: 10,
        departure_time: new Date(dayAfter.setHours(11, 0)).toISOString(),
        arrival_time: new Date(dayAfter.setHours(15, 0)).toISOString(),
        available_seats: 18,
        vehicle_number: 'TC-203',
        total_seats: 35,
        status: 'scheduled',
        route: {
          id: 10,
          operator_id: 8,
          transport_type_id: 1,
          departure_city: 'Mbuji-Mayi',
          arrival_city: 'Kananga',
          distance_km: 200,
          estimated_duration_minutes: 240,
          base_price: 22000,
          is_active: true,
          operator: { id: 8, name: 'Kasai Transport', type: 'transco', is_active: true }
        }
      },
      // 11. TRAIN - Matadi → Kinshasa (Train express)
      {
        id: 11,
        route_id: 11,
        departure_time: new Date(tomorrow.setHours(5, 30)).toISOString(),
        arrival_time: new Date(tomorrow.setHours(11, 30)).toISOString(),
        available_seats: 40,
        vehicle_number: 'TRAIN-03',
        total_seats: 80,
        status: 'scheduled',
        route: {
          id: 11,
          operator_id: 3,
          transport_type_id: 3,
          departure_city: 'Matadi',
          arrival_city: 'Kinshasa',
          distance_km: 350,
          estimated_duration_minutes: 360,
          base_price: 42000,
          is_active: true,
          operator: { id: 3, name: 'ONATRA Train', type: 'train', is_active: true }
        }
      },
      // 12. FLUVIAL - Mbandaka → Kinshasa (Bateau rapide)
      {
        id: 12,
        route_id: 12,
        departure_time: new Date(dayAfter.setHours(6, 0)).toISOString(),
        arrival_time: new Date(dayAfter.setHours(14, 0)).toISOString(),
        available_seats: 20,
        vehicle_number: 'BOAT-08',
        total_seats: 35,
        status: 'scheduled',
        route: {
          id: 12,
          operator_id: 4,
          transport_type_id: 4,
          departure_city: 'Mbandaka',
          arrival_city: 'Kinshasa',
          distance_km: 500,
          estimated_duration_minutes: 480,
          base_price: 75000,
          is_active: true,
          operator: { id: 4, name: 'Transport Fluvial', type: 'fluvial', is_active: true }
        }
      }
    ];

    if (transportType) {
      return allDemoTrips.filter(trip => {
        const typeMap: Record<TransportTypeEnum, string> = {
          'train': 'train',
          'fluvial': 'fluvial',
          'transco': 'transco',
          'private': 'private'
        };
        return trip.route?.operator?.type === typeMap[transportType];
      });
    }

    return allDemoTrips;
  };

  const searchTripsByTransportType = async (transportType: TransportTypeEnum) => {
    setLoading(true);
    
    // Simuler un délai de recherche pour l'effet
    setTimeout(() => {
      const demoTrips = getDemoTrips(transportType);
      setTrips(demoTrips);
      setLoading(false);
    }, 800);
  };

  const handleSearchTrips = async () => {
    console.log('Recherche avec les filtres :', {
      transport: selectedTransport,
      departureCity: bookingData.departureCity,
      arrivalCity: bookingData.arrivalCity,
      departureDate: bookingData.departureDate
    });
    
    setLoading(true);
    
    setTimeout(() => {
      let filteredTrips = getDemoTrips(selectedTransport || undefined);
      console.log('Trajets après filtrage par type de transport:', filteredTrips);
      
      // Filtrer par ville de départ si spécifiée
      if (bookingData.departureCity) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.route?.departure_city.toLowerCase().includes(bookingData.departureCity.toLowerCase())
        );
        console.log('Trajets après filtrage par ville de départ:', filteredTrips);
      }
      
      // Filtrer par ville d'arrivée si spécifiée
      if (bookingData.arrivalCity) {
        filteredTrips = filteredTrips.filter(trip => 
          trip.route?.arrival_city.toLowerCase().includes(bookingData.arrivalCity.toLowerCase())
        );
        console.log('Trajets après filtrage par ville d\'arrivée:', filteredTrips);
      }
      
      // Filtrer par date de départ si spécifiée
      if (bookingData.departureDate) {
        const selectedDate = new Date(bookingData.departureDate);
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        
        filteredTrips = filteredTrips.filter(trip => {
          const tripDate = new Date(trip.departure_time);
          const tripDateStr = tripDate.toISOString().split('T')[0];
          return tripDateStr === selectedDateStr;
        });
        console.log('Trajets après filtrage par date précise:', filteredTrips);
      }
      
      setTrips(filteredTrips);
      setLoading(false);
    }, 300);
  };

  const handleBookTrip = (trip: Trip) => {
    const hasJwt = !!localStorage.getItem('app_jwt');
    if (!hasJwt) {
      window.location.hash = '#/login';
      return;
    }
    setSelectedTrip(trip);
    setShowBookingModal(true);
  };


  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? mins : ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="text-2xl font-bold text-white">🚌 CongoMuv</div>
              <span className="text-emerald-200">|</span>
              <span className="text-emerald-100">Réservation de voyages</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-emerald-100">Bonjour, {user.name || user.email}</span>
                  <button
                    onClick={() => setShowMyTrips(true)}
                    className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg font-medium transition"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Mes Voyages</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <button className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg font-medium transition">
                  <span>Connexion</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white py-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-pink-300 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-cyan-300 rounded-full blur-xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Choisissez votre mode de transport
            </h2>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Réservez vos billets en quelques clics. Transport sécurisé à travers la RDC.
            </p>
          </div>

          {/* Transport Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {TRANSPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleTransportSelect(option.id)}
                className={`
                  bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-slate-200
                  ${selectedTransport === option.id ? 'ring-4 ring-purple-400 scale-105 bg-gradient-to-br from-purple-50 to-indigo-50' : 'hover:border-purple-300'}
                `}
              >
                <div className="text-center">
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 transition-all
                    ${selectedTransport === option.id ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg' : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 hover:from-purple-100 hover:to-indigo-100'}
                  `}>
                    {getTransportIcon(option.emoji)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{option.name}</h3>
                  <p className="text-xs text-slate-600">{option.description}</p>
                  <div className="text-3xl mt-2">{option.emoji}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Search Form */}
          {selectedTransport && (
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Rechercher un trajet</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Départ
                  </label>
                  <input
                    type="text"
                    placeholder="Ville de départ"
                    value={bookingData.departureCity}
                    onChange={(e) => setBookingData({ ...bookingData, departureCity: e.target.value })}
                    list="citiesList"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Arrivée
                  </label>
                  <input
                    type="text"
                    placeholder="Ville d'arrivée"
                    value={bookingData.arrivalCity}
                    onChange={(e) => setBookingData({ ...bookingData, arrivalCity: e.target.value })}
                    list="citiesList"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.departureDate}
                    onChange={(e) => setBookingData({ ...bookingData, departureDate: e.target.value })}
                    aria-label="Date de départ"
                    title="Sélectionner la date de départ"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 opacity-0">Action</label>
                  <button
                    onClick={handleSearchTrips}
                    className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Rechercher</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <datalist id="citiesList">
                {cities.map((city) => (
                  <option key={city.id} value={city.name} label={city.name} />
                ))}
              </datalist>
            </div>
          )}
        </div>
      </section>

      {/* Available Trips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {selectedTransport ? `Trajets disponibles - ${TRANSPORT_OPTIONS.find(o => o.id === selectedTransport)?.name}` : 'Trajets disponibles'}
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-700 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Recherche en cours...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-100">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-slate-700 font-medium">
              {selectedTransport ? 'Aucun trajet trouvé pour cette sélection' : 'Sélectionnez un type de transport pour voir les trajets disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 p-6 border border-slate-200 hover:border-purple-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">
                      {trip.route?.departure_city} → {trip.route?.arrival_city}
                    </h3>
                    <p className="text-sm text-slate-600">{trip.route?.operator?.name}</p>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${trip.available_seats > 10 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'}
                  `}>
                    {trip.available_seats} places
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Départ: {formatTime(trip.departure_time)}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Arrivée: {formatTime(trip.arrival_time)}</span>
                  </div>
                  {trip.route && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>Durée: {formatDuration(trip.route.estimated_duration_minutes)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-600">Prix à partir de</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {trip.route?.base_price.toLocaleString()} FC
                    </span>
                  </div>
                  <button
                    onClick={() => handleBookTrip(trip)}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    ✈️ Réserver maintenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section Fonctionnalités de Démonstration */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités CongoMuv
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités de notre plateforme de transport
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Réservation Simple */}
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Réservation simple</h3>
              <p className="text-gray-600 mb-6">
                Réservez vos billets en quelques clics, où que vous soyez
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Interface intuitive
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Recherche avancée
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Confirmation instantanée
                </div>
              </div>
            </div>

            {/* Billets Électroniques */}
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Billets électroniques</h3>
              <p className="text-gray-600 mb-6">
                Recevez votre billet par email et SMS avec QR code sécurisé
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  QR Code sécurisé
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Email + SMS
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Validation automatique
                </div>
              </div>
            </div>

            {/* Suivi en Temps Réel */}
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-6">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suivi en temps réel</h3>
              <p className="text-gray-600 mb-6">
                Suivez votre voyage en direct avec notre système GPS
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Localisation GPS
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Notifications temps réel
                </div>
                <div className="flex items-center justify-center">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                  Estimation d'arrivée
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques de Démonstration */}
          <div className="mt-16 bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">CongoMuv en Chiffres</h3>
              <p className="text-blue-100">Données de démonstration</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">25+</div>
                <div className="text-blue-100 text-sm">Trajets disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">156</div>
                <div className="text-blue-100 text-sm">Réservations actives</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">5</div>
                <div className="text-blue-100 text-sm">Opérateurs partenaires</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-blue-100 text-sm">Satisfaction client</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showBookingModal && selectedTrip && (
        <PassengerBookingModal
          trip={selectedTrip}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTrip(null);
          }}
          onSuccess={(bookingId: string, amount: number) => {
            setShowBookingModal(false);
            setCurrentBookingId(bookingId);
            setPaymentAmount(amount);
            setShowPaymentModal(true);
          }}
        />
      )}

      {showPaymentModal && currentBookingId && (
        <PaymentModal
          isOpen={showPaymentModal}
          bookingId={currentBookingId}
          amount={paymentAmount}
          onClose={() => {
            setShowPaymentModal(false);
            setCurrentBookingId('');
            setSelectedTrip(null);
          }}
          onSuccess={() => {
            setShowPaymentModal(false);
            setCurrentBookingId('');
            setSelectedTrip(null);
            if ((window as unknown as { addNotification?: (type: string, title: string, message: string) => void }).addNotification) {
              (window as unknown as { addNotification: (type: string, title: string, message: string) => void }).addNotification(
                'success',
                'Paiement confirmé !',
                'Votre réservation est confirmée. Vous recevrez votre billet par email et SMS.'
              );
            }
          }}
        />
      )}

      {showTripsModal && (
        <MyTripsModal isOpen={showTripsModal} onClose={() => setShowTripsModal(false)} />
      )}

      {showMyTrips && (
        <MyTripsModal isOpen={showMyTrips} onClose={() => setShowMyTrips(false)} />
      )}

      <SupportFAQ 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
    </div>
  );
}
