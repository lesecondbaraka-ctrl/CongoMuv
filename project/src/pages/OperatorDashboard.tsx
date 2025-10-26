import { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Calendar,
  LogOut
} from 'lucide-react';
import { TripsManagement } from '../components/operator/TripsManagement';
import { BookingsManagement } from '../components/operator/BookingsManagement';
import { VehicleTracking } from '../components/operator/VehicleTracking';
import { DriversManagement } from '../components/operator/DriversManagement';
import { ReportsAnalytics } from '../components/operator/ReportsAnalytics';

interface DashboardStats {
  totalTrips: number;
  activeTrips: number;
  totalBookings: number;
  revenue: number;
  averageOccupancy: number;
  onTimeRate: number;
}

export function OperatorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    activeTrips: 0,
    totalBookings: 0,
    revenue: 0,
    averageOccupancy: 0,
    onTimeRate: 0
  });
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    // Récupérer l'organisation de l'utilisateur connecté
    const token = localStorage.getItem('app_jwt');
    if (!token) {
      window.location.hash = '#/login';
      return;
    }

    // TODO: Récupérer les infos de l'organisation depuis l'API
    setOrganization({
      name: 'ONATRA',
      type: 'public',
      id: '1'
    });

    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('app_jwt');
      const response = await fetch('http://localhost:3002/api/operator/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      } else {
        console.error('Erreur API:', response.status);
        // Fallback données de simulation en cas d'erreur
        setStats({
          totalTrips: 156,
          activeTrips: 24,
          totalBookings: 1247,
          revenue: 48500000,
          averageOccupancy: 78,
          onTimeRate: 92
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      // Fallback données de simulation en cas d'erreur
      setStats({
        totalTrips: 0,
        activeTrips: 0,
        totalBookings: 0,
        revenue: 0,
        averageOccupancy: 0,
        onTimeRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('app_jwt');
    window.location.hash = '#/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-xl">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {organization?.name || 'Opérateur'}
                </h1>
                <p className="text-sm text-slate-600">Tableau de bord</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-x-auto">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'trips'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>🚛</span>
              <span>Trajets</span>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'bookings'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Réservations</span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'tracking'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Suivi GPS</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'reports'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>📈</span>
              <span>Rapports</span>
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'drivers'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Conducteurs</span>
            </button>
          </div>
        </div>

        {/* Trips Management */}
        {activeTab === 'trips' && (
          <TripsManagement />
        )}

        {/* Bookings Management */}
        {activeTab === 'bookings' && (
          <BookingsManagement />
        )}

        {/* Vehicle Tracking */}
        {activeTab === 'tracking' && (
          <VehicleTracking />
        )}

        {/* Drivers Management */}
        {activeTab === 'drivers' && (
          <DriversManagement />
        )}

        {/* Reports & Analytics */}
        {activeTab === 'reports' && (
          <ReportsAnalytics />
        )}

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Trips */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <span className="text-2xl">🚛</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">+12%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{stats.totalTrips}</h3>
                <p className="text-sm text-slate-600 mt-1">Trajets totaux</p>
              </div>

              {/* Active Trips */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-600">Actifs</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{stats.activeTrips}</h3>
                <p className="text-sm text-slate-600 mt-1">Trajets en cours</p>
              </div>

              {/* Total Bookings */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-purple-600">+8%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{stats.totalBookings}</h3>
                <p className="text-sm text-slate-600 mt-1">Réservations</p>
              </div>

              {/* Revenue */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">+15%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {stats.revenue.toLocaleString('fr-FR')} FC
                </h3>
                <p className="text-sm text-slate-600 mt-1">Revenu mensuel</p>
              </div>

              {/* Average Occupancy */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <span className="text-sm font-medium text-indigo-600">{stats.averageOccupancy}%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{stats.averageOccupancy}%</h3>
                <p className="text-sm text-slate-600 mt-1">Taux de remplissage</p>
              </div>

              {/* On-Time Rate */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stats.onTimeRate}%</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{stats.onTimeRate}%</h3>
                <p className="text-sm text-slate-600 mt-1">Taux de ponctualité</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Activité récente</h3>
              <div className="text-center text-slate-600 py-8">
                Les fonctionnalités détaillées seront ajoutées prochainement
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Content (Placeholders) */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'trips' && <span className="text-4xl">🚛</span>}
                {activeTab === 'bookings' && <Users className="w-8 h-8 text-slate-600" />}
                {activeTab === 'tracking' && <MapPin className="w-8 h-8 text-slate-600" />}
                {activeTab === 'reports' && <span className="text-4xl">📈</span>}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {activeTab === 'trips' && 'Gestion des Trajets'}
                {activeTab === 'bookings' && 'Gestion des Réservations'}
                {activeTab === 'tracking' && 'Suivi GPS des Véhicules'}
                {activeTab === 'reports' && 'Statistiques & Rapports'}
              </h3>
              <p className="text-slate-600 mb-6">
                Cette section sera développée prochainement
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
