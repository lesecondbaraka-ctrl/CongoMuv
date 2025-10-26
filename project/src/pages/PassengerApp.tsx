import { useState, useEffect } from 'react';
import { MapPin, Calendar, ArrowRight, Ticket, LogOut, User as UserIcon, Clock } from 'lucide-react';
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
  const [user, setUser] = useState<any>(null);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTripsModal, setShowTripsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('app_jwt');
    if (token) {
      setUser({ token });
    }
  }, []);

  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
    fetch(`${API_BASE}/api/public/cities?limit=500`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const items = Array.isArray(json?.items) ? json.items : [];
        setCities(items.map((c: any) => ({ id: String(c.id), name: String(c.name) })));
      })
      .catch(() => {});
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

  const searchTripsByTransportType = async (transportType: TransportTypeEnum) => {
    setLoading(true);
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
    try {
      const params = new URLSearchParams();
      params.set('limit', '20');
      params.set('order', 'departure_datetime.asc');
      
      // Mapping des types de transport aux operator types
      const operatorTypeMap: Record<TransportTypeEnum, string> = {
        'train': 'ONATRA',
        'fluvial': 'Fluvial',
        'transco': 'Transco',
        'private': 'Private'
      };
      
      if (transportType) {
        params.set('operator_type', operatorTypeMap[transportType]);
      }

      const resp = await fetch(`${API_BASE}/api/trips/search?${params.toString()}`);
      const json = await resp.json();
      
      if (!resp.ok) throw new Error(json?.error || 'Erreur lors de la recherche');

      const items = Array.isArray(json.items) ? json.items : [];
      const mapped: Trip[] = items.map((t: any) => ({
        id: t.id,
        route_id: t.route_id,
        departure_time: t.departure_time,
        arrival_time: t.arrival_time,
        available_seats: t.available_seats ?? 0,
        vehicle_number: t.vehicle_number ?? '',
        total_seats: t.total_seats ?? 0,
        status: t.status || 'scheduled',
        route: t.route ? {
          id: t.route.id,
          operator_id: t.route.operator_id,
          transport_type_id: 0,
          departure_city: t.route.departure_city ?? '',
          arrival_city: t.route.arrival_city ?? '',
          distance_km: t.route.distance_km ?? 0,
          estimated_duration_minutes: t.route.duration_minutes ?? t.route.estimated_duration_minutes ?? 0,
          base_price: t.route.base_price ?? t.price ?? 0,
          is_active: t.route.is_active ?? true,
          operator: { id: 0, name: t.route.name ?? 'Opérateur', type: '', is_active: true } as any,
          transport_type: undefined,
        } : null,
      }));
      setTrips(mapped);
    } catch (error) {
      console.error('Error searching trips:', error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTrips = async () => {
    if (!bookingData.departureDate) {
      alert('Veuillez sélectionner une date de départ');
      return;
    }

    setLoading(true);
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
    try {
      const params = new URLSearchParams();
      params.set('date', bookingData.departureDate);
      params.set('limit', '25');
      params.set('order', 'departure_datetime.asc');

      const dep = cities.find(c => c.name.toLowerCase() === bookingData.departureCity.toLowerCase());
      const arr = cities.find(c => c.name.toLowerCase() === bookingData.arrivalCity.toLowerCase());
      
      if (dep) params.set('departure_city_id', dep.id);
      if (arr) params.set('arrival_city_id', arr.id);
      if (!dep && bookingData.departureCity) params.set('departure_city', bookingData.departureCity);
      if (!arr && bookingData.arrivalCity) params.set('arrival_city', bookingData.arrivalCity);

      if (selectedTransport) {
        const operatorTypeMap: Record<TransportTypeEnum, string> = {
          'train': 'ONATRA',
          'fluvial': 'Fluvial',
          'transco': 'Transco',
          'private': 'Private'
        };
        params.set('operator_type', operatorTypeMap[selectedTransport]);
      }

      const resp = await fetch(`${API_BASE}/api/trips/search?${params.toString()}`);
      const json = await resp.json();
      
      if (!resp.ok) throw new Error(json?.error || 'Erreur lors de la recherche');

      const items = Array.isArray(json.items) ? json.items : [];
      const mapped: Trip[] = items.map((t: any) => ({
        id: t.id,
        route_id: t.route_id,
        departure_time: t.departure_time,
        arrival_time: t.arrival_time,
        available_seats: t.available_seats ?? 0,
        vehicle_number: t.vehicle_number ?? '',
        total_seats: t.total_seats ?? 0,
        status: t.status || 'scheduled',
        route: t.route ? {
          id: t.route.id,
          operator_id: t.route.operator_id,
          transport_type_id: 0,
          departure_city: t.route.departure_city ?? '',
          arrival_city: t.route.arrival_city ?? '',
          distance_km: t.route.distance_km ?? 0,
          estimated_duration_minutes: t.route.duration_minutes ?? t.route.estimated_duration_minutes ?? 0,
          base_price: t.route.base_price ?? t.price ?? 0,
          is_active: t.route.is_active ?? true,
          operator: { id: 0, name: t.route.name ?? 'Opérateur', type: '', is_active: true } as any,
          transport_type: undefined,
        } : null,
      }));
      setTrips(mapped);
    } catch (error) {
      console.error('Error searching trips:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                <Ticket className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">CongoMuv Passager</h1>
                <p className="text-xs text-slate-600 hidden sm:block">Réservation simplifiée</p>
              </div>
            </div>
            <nav className="flex items-center space-x-3">
              <button
                onClick={() => setShowSupportModal(true)}
                className="flex items-center space-x-1 text-slate-700 hover:text-emerald-600 font-medium transition text-sm"
                title="Support & FAQ"
              >
                <span className="text-lg">❓</span>
                <span className="hidden sm:inline">Support</span>
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => setShowTripsModal(true)}
                    className="text-slate-700 hover:text-emerald-600 font-medium transition text-sm"
                  >
                    Mes Voyages
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600 font-medium transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => { window.location.hash = '#/login'; }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition text-sm"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Connexion</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Choisissez votre mode de transport
            </h2>
            <p className="text-lg text-emerald-50 max-w-2xl mx-auto">
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
                  bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1
                  ${selectedTransport === option.id ? 'ring-4 ring-yellow-400 scale-105' : ''}
                `}
              >
                <div className="text-center">
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 rounded-full mb-3
                    ${selectedTransport === option.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700'}
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
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
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 opacity-0">Action</label>
                  <button
                    onClick={handleSearchTrips}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center space-x-2"
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Recherche en cours...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Ticket className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600">
              {selectedTransport ? 'Aucun trajet trouvé pour cette sélection' : 'Sélectionnez un type de transport pour voir les trajets disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900">
                      {trip.route?.departure_city} → {trip.route?.arrival_city}
                    </h3>
                    <p className="text-sm text-slate-600">{trip.route?.operator?.name}</p>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${trip.available_seats > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}
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
                    <span className="text-2xl font-bold text-emerald-600">
                      {trip.route?.base_price.toLocaleString()} FC
                    </span>
                  </div>
                  <button
                    onClick={() => handleBookTrip(trip)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all text-sm"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
          onSuccess={(_paymentId: string) => {
            setShowPaymentModal(false);
            setCurrentBookingId('');
            setSelectedTrip(null);
            if ((window as any).addNotification) {
              (window as any).addNotification(
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

      <SupportFAQ 
        isOpen={showSupportModal} 
        onClose={() => setShowSupportModal(false)} 
      />
    </div>
  );
}
