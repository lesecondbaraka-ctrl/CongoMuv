import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight, CheckCircle, Clock, Ticket, LogOut, User as UserIcon } from 'lucide-react';
import { Trip } from './types';
import { BookingModal } from './components/BookingModal';
import { MyTripsModal } from './components/MyTripsModal';

function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [user, setUser] = useState<any>(null);
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTripsModal, setShowTripsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    operator: '',
    sortBy: 'departure_time'
  });

  const [searchParams, setSearchParams] = useState({
    departureCity: '',
    arrivalCity: '',
    date: '',
    passengers: 1
  });

  useEffect(() => {
    // Déterminer l'état de connexion via le JWT
    const token = localStorage.getItem('app_jwt');
    if (token) {
      setUser({ token });
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Charger la liste des villes publiques pour l'auto-complétion
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
    try {
      localStorage.removeItem('app_jwt');
      localStorage.removeItem('app_role');
    } catch {}
    setUser(null);
    window.location.hash = '#/login';
  };

  const handleBookNow = (trip: Trip) => {
    const hasJwt = !!localStorage.getItem('app_jwt');
    if (!hasJwt) {
      window.location.hash = '#/login';
      return;
    }
    setSelectedTrip(trip);
    setShowBookingModal(true);
  };


  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedTrip(null);
    // Utiliser le système de notifications
    if ((window as any).addNotification) {
      (window as any).addNotification(
        'success',
        'Réservation confirmée !',
        'Vous recevrez votre billet par email et SMS.'
      );
    } else {
      alert('Réservation confirmée! Vous recevrez votre billet par email et SMS.');
    }
  };

  const searchTrips = async () => {
    if (!searchParams.date) {
      return;
    }

    setLoading(true);
    const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
    try {
      const params = new URLSearchParams();
      params.set('date', searchParams.date);
      params.set('limit', String(limit));
      params.set('offset', String((page - 1) * limit));
      // order mapping
      let order = 'departure_datetime.asc';
      if (advancedFilters.sortBy === 'route.base_price') order = 'price.asc';
      params.set('order', order);
      // optional filters
      if (advancedFilters.maxPrice) params.set('max_price', String(advancedFilters.maxPrice));
      if (advancedFilters.operator) params.set('operator_id', String(advancedFilters.operator));
      // try strict city IDs when the typed value matches a known city
      const dep = cities.find(c => c.name.toLowerCase() === (searchParams.departureCity || '').toLowerCase());
      const arr = cities.find(c => c.name.toLowerCase() === (searchParams.arrivalCity || '').toLowerCase());
      if (dep) params.set('departure_city_id', dep.id);
      if (arr) params.set('arrival_city_id', arr.id);
      if (!dep && searchParams.departureCity) params.set('departure_city', searchParams.departureCity);
      if (!arr && searchParams.arrivalCity) params.set('arrival_city', searchParams.arrivalCity);
      // optimized total count
      params.set('include_count', 'header');
      const resp = await fetch(`${API_BASE}/api/trips/search?${params.toString()}`);
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Erreur lors de la recherche');

      const items = Array.isArray(json.items) ? json.items : [];
      if (typeof json.total === 'number') setTotalResults(json.total);
      else setTotalResults(null);
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
      alert('Erreur lors de la recherche des trajets. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Rafraîchir la recherche lorsqu'on change de page si une date est définie
    if (searchParams.date) {
      searchTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">CongoMuv</h1>
                <p className="text-xs text-slate-600 hidden sm:block">E-Ticket National</p>
              </div>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="#" className="text-slate-700 hover:text-emerald-600 font-medium transition hidden sm:inline">Accueil</a>
              {user ? (
                <>
                  <button
                    onClick={() => setShowTripsModal(true)}
                    className="text-slate-700 hover:text-emerald-600 font-medium transition text-sm"
                  >
                    <span className="hidden sm:inline">Mes Voyages</span>
                    <span className="sm:hidden">Voyages</span>
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
                    <span className="hidden sm:inline">Connexion</span>
                    <span className="sm:hidden">Login</span>
                  </button>
                  <button
                    onClick={() => { window.location.hash = '#/signup'; }}
                    className="hidden sm:inline-flex items-center space-x-2 bg-slate-100 text-slate-700 px-3 py-2 rounded-lg font-medium hover:bg-slate-200 transition text-sm"
                  >
                    <span>S'inscrire</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Voyagez en toute simplicité
            </h2>
            <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
              Réservez vos billets de train, bus et bateau en quelques clics.
              Transport moderne et sécurisé à travers la RDC.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Départ
                </label>
                <input
                  type="text"
                  placeholder="Kinshasa"
                  value={searchParams.departureCity}
                  onChange={(e) => setSearchParams({...searchParams, departureCity: e.target.value})}
                  list="citiesList"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Arrivée
                </label>
                <input
                  type="text"
                  placeholder="Matadi"
                  value={searchParams.arrivalCity}
                  onChange={(e) => setSearchParams({...searchParams, arrivalCity: e.target.value})}
                  list="citiesList"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  placeholder="Sélectionnez une date"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Passagers
                </label>
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  aria-label="Nombre de passagers"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} passager{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1 flex items-end">
                <button
                  onClick={() => { setPage(1); searchTrips(); }}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={loading ? 'Recherche en cours' : 'Lancer la recherche de voyages'}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </div>

            {/* Advanced Search Toggle */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium underline"
              >
                {showAdvancedSearch ? 'Masquer' : 'Afficher'} les filtres avancés
              </button>
            </div>

            {/* Advanced Search Filters */}
            {showAdvancedSearch && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prix maximum (FC)
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={advancedFilters.maxPrice}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxPrice: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Durée min (heures)
                    </label>
                    <input
                      type="number"
                      placeholder="2"
                      value={advancedFilters.minDuration}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, minDuration: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Durée max (heures)
                    </label>
                    <input
                      type="number"
                      placeholder="24"
                      value={advancedFilters.maxDuration}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, maxDuration: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Trier par
                    </label>
                    <select
                      value={advancedFilters.sortBy}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, sortBy: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      aria-label="Trier les résultats par"
                    >
                      <option value="departure_time">Heure de départ</option>
                      <option value="route.base_price">Prix</option>
                      <option value="route.estimated_duration_minutes">Durée</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Datalist for cities */}
      <datalist id="citiesList">
        {cities.map(c => (
          <option key={c.id} value={c.name} />
        ))}
      </datalist>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {trips.length > 0 ? (
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
              {trips.length} voyage{trips.length > 1 ? 's' : ''} disponible{trips.length > 1 ? 's' : ''}
            </h3>
            {typeof totalResults === 'number' && (
              <p className="text-sm text-slate-600 mb-4">Total estimé: {totalResults}</p>
            )}
            <div className="space-y-3 sm:space-y-4">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-slate-200 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Route Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg text-white">
                            <Ticket className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm sm:text-base">{trip.route?.operator?.name}</h4>
                            <p className="text-xs sm:text-sm text-slate-600">{trip.route?.transport_type?.name}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                          <div>
                            <p className="text-lg sm:text-2xl font-bold text-slate-900">{formatTime(trip.departure_time)}</p>
                            <p className="text-xs sm:text-sm text-slate-600">{trip.route?.departure_city}</p>
                          </div>

                          <div className="flex-1 flex flex-col items-center">
                            <div className="flex items-center space-x-2 text-slate-400">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <div className="flex-1 h-0.5 bg-slate-300"></div>
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                              <div className="flex-1 h-0.5 bg-slate-300"></div>
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {trip.route?.estimated_duration_minutes && formatDuration(trip.route.estimated_duration_minutes)}
                            </p>
                          </div>

                          <div>
                            <p className="text-lg sm:text-2xl font-bold text-slate-900">{formatTime(trip.arrival_time)}</p>
                            <p className="text-xs sm:text-sm text-slate-600">{trip.route?.arrival_city}</p>
                          </div>
                        </div>

                        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600">
                          <span className="flex items-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-emerald-600" />
                            {trip.available_seats} places disponibles
                          </span>
                          <span className="hidden sm:inline">Véhicule: {trip.vehicle_number}</span>
                        </div>
                      </div>

                      {/* Right: Price & Action */}
                      <div className="flex flex-col sm:flex-row items-center justify-between lg:justify-center gap-3 sm:gap-4">
                        <div className="text-center sm:text-right">
                          <p className="text-xl sm:text-3xl font-bold text-slate-900">
                            {trip.route?.base_price?.toLocaleString('fr-FR')} FC
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">par personne</p>
                        </div>
                        <button
                          onClick={() => handleBookNow(trip)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl text-sm w-full sm:w-auto"
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-slate-600">Page {page}</span>
              <button
                disabled={(typeof totalResults === 'number' ? (page * limit) >= totalResults : trips.length < limit) || loading}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg max-w-md mx-auto">
              <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                Recherchez votre prochain voyage
              </h3>
              <p className="text-slate-600 text-sm sm:text-base">
                Sélectionnez votre point de départ, destination et date pour voir les trajets disponibles
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Pourquoi choisir CongoMuv ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Réservation simple</h4>
              <p className="text-slate-600">
                Réservez vos billets en quelques clics, où que vous soyez
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Billets électroniques</h4>
              <p className="text-slate-600">
                Recevez votre billet par email et SMS avec QR code sécurisé
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Suivi en temps réel</h4>
              <p className="text-slate-600">
                Suivez votre voyage en direct avec notre système GPS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">
            © 2025 CongoMuv E-Ticket. Tous droits réservés.
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Contact: {' '}
            <a href="mailto:sumbaestime@gmail.com" className="text-emerald-400 hover:text-emerald-300">
              sumbaestime@gmail.com
            </a>
            {' '} | +243 821 938 773
          </p>
        </div>
      </footer>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedTrip(null);
        }}
        trip={selectedTrip}
        onSuccess={handleBookingSuccess}
      />

      <MyTripsModal
        isOpen={showTripsModal}
        onClose={() => setShowTripsModal(false)}
      />
    </div>
  );
}

export default App;
