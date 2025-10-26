import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { 
  SupervisionPassengers,
  MultiAdminManagement,
  MonitoringAlerts,
  SecurityCompliance,
  APIManagement
} from '../components/admin';

interface AdminStats {
  totalPassengers: number;
  totalBookings: number;
  totalRevenue: number;
  activeOperators: number;
  pendingIncidents: number;
  apiCalls24h: number;
}

export function AdminHQ() {
  const [activeTab, setActiveTab] = useState<'supervision' | 'admins' | 'monitoring' | 'security' | 'api'>('supervision');
  const [stats, setStats] = useState<AdminStats>({
    totalPassengers: 8934,
    totalBookings: 1247,
    totalRevenue: 45600000,
    activeOperators: 12,
    pendingIncidents: 3,
    apiCalls24h: 15420
  });
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
    loadStats();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('app_jwt');
      if (!token) {
        window.location.hash = '#/login';
        return;
      }

      const response = await fetch('http://localhost:3002/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMe(data);
        
        // Vérifier le rôle ADMIN
        if (data.role !== 'ADMIN') {
          window.location.hash = '#/';
        }
      } else {
        window.location.hash = '#/login';
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      window.location.hash = '#/login';
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('app_jwt');
      const response = await fetch('http://localhost:3002/api/admin-hq/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      } else {
        console.error('Erreur API:', response.status);
        // Fallback données simulées
        setStats({
          totalPassengers: 8934,
          totalBookings: 1247,
          totalRevenue: 45600000,
          activeOperators: 12,
          pendingIncidents: 3,
          apiCalls24h: 15420
        });
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      // Fallback en cas d'erreur réseau
      setStats({
        totalPassengers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeOperators: 0,
        pendingIncidents: 0,
        apiCalls24h: 0
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('app_jwt');
    window.location.hash = '#/login';
  };

  const tabs = [
    { id: 'supervision', label: 'Supervision Passagers' },
    { id: 'admins', label: 'Gestion Multi-Admins' },
    { id: 'monitoring', label: 'Monitoring & Alertes' },
    { id: 'security', label: 'Sécurité & Conformité' },
    { id: 'api', label: 'API Management' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl">
                <span className="text-2xl text-white">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CongoMuv HQ</h1>
                <p className="text-sm text-slate-600">Module Administratif Global</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{me?.full_name || 'Admin'}</p>
                <p className="text-xs text-slate-600">{me?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">👥</span>
              <span className="text-slate-400">🔔</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalPassengers.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-slate-600">Passagers</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎫</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalBookings.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-slate-600">Réservations</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-slate-600">Revenu (FC)</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏢</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.activeOperators}</p>
            <p className="text-xs text-slate-600">Opérateurs</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">⚠️</span>
              {stats.pendingIncidents > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.pendingIncidents}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingIncidents}</p>
            <p className="text-xs text-slate-600">Incidents</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔌</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.apiCalls24h.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-slate-600">Appels API</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-x-auto">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{['👥', '🛡️', '📊', '🔒', '🔌'][index]}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'supervision' && <SupervisionPassengers />}
          {activeTab === 'admins' && <MultiAdminManagement />}
          {activeTab === 'monitoring' && <MonitoringAlerts />}
          {activeTab === 'security' && <SecurityCompliance />}
          {activeTab === 'api' && <APIManagement />}
        </div>
      </div>
    </div>
  );
}
