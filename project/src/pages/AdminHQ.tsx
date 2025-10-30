import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { 
  SupervisionPassengers,
  MultiAdminManagement,
  MonitoringAlerts,
  SecurityCompliance,
  APIManagement
} from '../components/admin';
// Fallback forms inlined below; external components temporarily not used

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    // @ts-ignore
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }
  // @ts-ignore
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  // @ts-ignore
  componentDidCatch(error: any, info: any) {
    console.error('Form render error:', error, info);
  }
  // @ts-ignore
  render() {
    // @ts-ignore
    if (this.state?.hasError) {
      // @ts-ignore
      return this.props.fallback || null;
    }
    // @ts-ignore
    return this.props.children;
  }
}

interface AdminStats {
  totalPassengers: number;
  totalBookings: number;
  totalRevenue: number;
  activeOperators: number;
  pendingIncidents: number;
  apiCalls24h: number;
}

export function AdminHQ() {
  const [activeTab, setActiveTab] = useState<'supervision' | 'admins' | 'monitoring' | 'security' | 'api' | 'routes' | 'operators'>('routes');
  const [stats, setStats] = useState<AdminStats>({
    totalPassengers: 8934,
    totalBookings: 1247,
    totalRevenue: 45600000,
    activeOperators: 12,
    pendingIncidents: 3,
    apiCalls24h: 15420
  });
  const [me, setMe] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [operators, setOperators] = useState<any[]>([]);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [loadingOperators, setLoadingOperators] = useState(false);

  // Auto-open a modal on first load of a tab to validate UI rendering (debug temporary)
  useEffect(() => {
    if (activeTab === 'routes' && !showRouteModal) {
      setTimeout(() => setShowRouteModal(true), 100);
    }
    if (activeTab === 'operators' && !showOperatorModal) {
      setTimeout(() => setShowOperatorModal(true), 100);
    }
  }, [activeTab]);

  // Keyboard shortcut: press 'm' to toggle current tab modal (debug)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm') {
        if (activeTab === 'routes') setShowRouteModal((v) => !v);
        if (activeTab === 'operators') setShowOperatorModal((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab]);

  useEffect(() => {
    loadUserProfile();
    loadStats();
    // Charger données si onglet actif
    if (activeTab === 'routes') loadRoutes();
    if (activeTab === 'operators') loadOperators();
  }, []);

  useEffect(() => {
    if (activeTab === 'routes') loadRoutes();
    if (activeTab === 'operators') loadOperators();
  }, [activeTab]);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('app_jwt');
      if (!token) {
        // Ne pas rediriger pour permettre le test UI des formulaires
        setMe({ role: 'ADMIN', full_name: 'Admin (local)', email: 'admin@example.com' });
        return;
      }

      const response = await fetch('http://localhost:3002/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMe(data);
        // Ne pas rediriger même si le rôle n'est pas ADMIN afin de tester l'UI
      } else {
        // Fallback permissif pour tester l'UI
        setMe({ role: 'ADMIN', full_name: 'Admin (fallback)', email: 'admin@example.com' });
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      // Fallback permissif pour tester l'UI
      setMe({ role: 'ADMIN', full_name: 'Admin (offline)', email: 'admin@example.com' });
    }
  };

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true);
      const token = localStorage.getItem('app_jwt') || localStorage.getItem('token');
      const resp = await fetch('http://localhost:3002/api/admin-crud/routes', {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const json = await resp.json();
      const items = Array.isArray(json?.items) ? json.items : Array.isArray(json) ? json : [];
      setRoutes(items as any);
    } catch (e) {
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const loadOperators = async () => {
    try {
      setLoadingOperators(true);
      const token = localStorage.getItem('app_jwt') || localStorage.getItem('token');
      const resp = await fetch('http://localhost:3002/api/admin-hq/operators', {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      const json = await resp.json();
      const items = Array.isArray(json?.data) ? json.data : [];
      setOperators(items as any);
    } catch (e) {
      setOperators([]);
    } finally {
      setLoadingOperators(false);
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
    { id: 'routes', label: 'Routes' },
    { id: 'operators', label: 'Opérateurs' },
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
                <span>{['👥', '🛡️', '📊', '🗺️', '🏢', '🔒', '🔌'][index]}</span>
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
          {activeTab === 'routes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Routes</h2>
                <div className="flex items-center">
                  <button type="button" onClick={() => { console.log('open route modal'); setShowRouteModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Nouvelle Route</button>
                  {showRouteModal && <span className="ml-2 text-xs text-emerald-700">Modal ouvert</span>}
                </div>
              </div>
              {loadingRoutes ? (
                <div className="text-center py-10">Chargement...</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="px-4 py-2 text-left">Code</th>
                        <th className="px-4 py-2 text-left">Nom</th>
                        <th className="px-4 py-2 text-left">Origine</th>
                        <th className="px-4 py-2 text-left">Destination</th>
                        <th className="px-4 py-2 text-left">Actif</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((r: any) => (
                        <tr key={r.id} className="border-t">
                          <td className="px-4 py-2">{r.route_code || r.code || '-'}</td>
                          <td className="px-4 py-2">{r.name}</td>
                          <td className="px-4 py-2">{r.departure_city || '-'}</td>
                          <td className="px-4 py-2">{r.arrival_city || '-'}</td>
                          <td className="px-4 py-2">{String(r.is_active ?? true)}</td>
                        </tr>
                      ))}
                      {routes.length === 0 && (
                        <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={5}>Aucune route</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h4 className="text-lg font-semibold mb-3">Formulaire Route (visible)</h4>
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const data = Object.fromEntries(new FormData(form) as any) as any;
                    const token = localStorage.getItem('app_jwt') || localStorage.getItem('token');
                    const payload = {
                      operator_id: String(data.operatorId || ''),
                      name: data.name,
                      base_price: Number(data.basePrice || 0),
                      route_code: data.code,
                      distance_km: Number(data.distance || 0),
                      duration_minutes: Number(data.estimatedDuration || 0),
                      stops: (data.waypoints ? String(data.waypoints).split(',').map(s => s.trim()).filter(Boolean) : []),
                      is_active: data.isActive === 'on',
                      departure_city: data.origin,
                      arrival_city: data.destination,
                    };
                    try {
                      const resp = await fetch('http://localhost:3002/api/admin-crud/routes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: JSON.stringify(payload)
                      });
                      if (!resp.ok) throw new Error('create_failed');
                      (e.target as HTMLFormElement).reset();
                      await loadRoutes();
                      alert('Route enregistrée');
                    } catch (err) {
                      console.error('Erreur création route:', err);
                      alert('Erreur création route');
                    }
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="inline-route-operatorId" className="text-sm">Opérateur ID *</label>
                      <input id="inline-route-operatorId" name="operatorId" className="w-full px-3 py-2 border rounded" placeholder="ID opérateur" title="ID opérateur" required />
                    </div>
                    <div>
                      <label htmlFor="inline-route-basePrice" className="text-sm">Prix de base *</label>
                      <input id="inline-route-basePrice" name="basePrice" type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded" placeholder="0.00" title="Prix de base" required />
                    </div>
                    <div>
                      <label htmlFor="inline-route-code" className="text-sm">Code *</label>
                      <input id="inline-route-code" name="code" className="w-full px-3 py-2 border rounded" placeholder="Code de la route" title="Code de la route" required />
                    </div>
                    <div>
                      <label htmlFor="inline-route-name" className="text-sm">Nom *</label>
                      <input id="inline-route-name" name="name" className="w-full px-3 py-2 border rounded" placeholder="Nom de la route" title="Nom de la route" required />
                    </div>
                    <div>
                      <label htmlFor="inline-route-origin" className="text-sm">Origine *</label>
                      <input id="inline-route-origin" name="origin" className="w-full px-3 py-2 border rounded" placeholder="Ville de départ" title="Ville de départ" required />
                    </div>
                    <div>
                      <label htmlFor="inline-route-destination" className="text-sm">Destination *</label>
                      <input id="inline-route-destination" name="destination" className="w-full px-3 py-2 border rounded" placeholder="Ville d'arrivée" title="Ville d'arrivée" required />
                    </div>
                    <div>
                      <label htmlFor="inline-route-distance" className="text-sm">Distance (km) *</label>
                      <input id="inline-route-distance" name="distance" type="number" min="0" step="0.1" className="w-full px-3 py-2 border rounded" placeholder="0" title="Distance en kilomètres" required />
                    </div>
                    <div>
                      <label htmlFor="inline-route-duration" className="text-sm">Durée estimée (min) *</label>
                      <input id="inline-route-duration" name="estimatedDuration" type="number" min="0" step="1" className="w-full px-3 py-2 border rounded" placeholder="0" title="Durée en minutes" required />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="inline-route-waypoints" className="text-sm">Points d'arrêt (séparés par des virgules)</label>
                      <input id="inline-route-waypoints" name="waypoints" className="w-full px-3 py-2 border rounded" placeholder="Point A, Point B" title="Points d'arrêt" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" name="isActive" className="h-4 w-4" defaultChecked />
                      <span>Actif</span>
                    </label>
                    <div className="space-x-2">
                      <button type="submit" className="px-3 py-2 bg-emerald-600 text-white rounded">Enregistrer</button>
                    </div>
                  </div>
                </form>
              </div>

              {showRouteModal && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Nouvelle Route</h3>
                      <button onClick={() => setShowRouteModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✖</button>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary fallback={<div className="text-red-600">Erreur lors du chargement du formulaire Route.</div>}>
                        <form
                          className="space-y-3"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const data = Object.fromEntries(new FormData(form) as any) as any;
                            const token = localStorage.getItem('app_jwt') || localStorage.getItem('token');
                            const payload = {
                              operator_id: String(data.operatorId || ''),
                              name: data.name,
                              base_price: Number(data.basePrice || 0),
                              route_code: data.code,
                              distance_km: Number(data.distance || 0),
                              duration_minutes: Number(data.estimatedDuration || 0),
                              stops: (data.waypoints ? String(data.waypoints).split(',').map(s => s.trim()).filter(Boolean) : []),
                              is_active: data.isActive === 'on',
                              departure_city: data.origin,
                              arrival_city: data.destination,
                            };
                            try {
                              const resp = await fetch('http://localhost:3002/api/admin-crud/routes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                body: JSON.stringify(payload)
                              });
                              if (!resp.ok) throw new Error('create_failed');
                              setShowRouteModal(false);
                              await loadRoutes();
                            } catch (err) {
                              console.error('Erreur création route:', err);
                              alert('Erreur création route');
                            }
                          }}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="route-operatorId" className="text-sm">Opérateur ID *</label>
                              <input id="route-operatorId" name="operatorId" className="w-full px-3 py-2 border rounded" placeholder="ID opérateur" title="ID opérateur" required />
                            </div>
                            <div>
                              <label htmlFor="route-basePrice" className="text-sm">Prix de base *</label>
                              <input id="route-basePrice" name="basePrice" type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded" placeholder="0.00" title="Prix de base" required />
                            </div>
                            <div>
                              <label htmlFor="route-code" className="text-sm">Code *</label>
                              <input id="route-code" name="code" className="w-full px-3 py-2 border rounded" placeholder="Code de la route" title="Code de la route" required />
                            </div>
                            <div>
                              <label htmlFor="route-name" className="text-sm">Nom *</label>
                              <input id="route-name" name="name" className="w-full px-3 py-2 border rounded" placeholder="Nom de la route" title="Nom de la route" required />
                            </div>
                            <div>
                              <label htmlFor="route-origin" className="text-sm">Origine *</label>
                              <input id="route-origin" name="origin" className="w-full px-3 py-2 border rounded" placeholder="Ville de départ" title="Ville de départ" required />
                            </div>
                            <div>
                              <label htmlFor="route-destination" className="text-sm">Destination *</label>
                              <input id="route-destination" name="destination" className="w-full px-3 py-2 border rounded" placeholder="Ville d'arrivée" title="Ville d'arrivée" required />
                            </div>
                            <div>
                              <label htmlFor="route-distance" className="text-sm">Distance (km) *</label>
                              <input id="route-distance" name="distance" type="number" min="0" step="0.1" className="w-full px-3 py-2 border rounded" placeholder="0" title="Distance en kilomètres" required />
                            </div>
                            <div>
                              <label htmlFor="route-duration" className="text-sm">Durée estimée (min) *</label>
                              <input id="route-duration" name="estimatedDuration" type="number" min="0" step="1" className="w-full px-3 py-2 border rounded" placeholder="0" title="Durée en minutes" required />
                            </div>
                            <div className="col-span-2">
                              <label htmlFor="route-waypoints" className="text-sm">Points d'arrêt (séparés par des virgules)</label>
                              <input id="route-waypoints" name="waypoints" className="w-full px-3 py-2 border rounded" placeholder="Point A, Point B" title="Points d'arrêt" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center space-x-2 text-sm">
                              <input type="checkbox" name="isActive" className="h-4 w-4" defaultChecked />
                              <span>Actif</span>
                            </label>
                            <div className="space-x-2">
                              <button type="button" onClick={() => setShowRouteModal(false)} className="px-3 py-2 border rounded">Annuler</button>
                              <button type="submit" className="px-3 py-2 bg-emerald-600 text-white rounded">Enregistrer</button>
                            </div>
                          </div>
                        </form>
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'operators' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Opérateurs</h2>
                <div className="flex items-center">
                  <button type="button" onClick={() => { console.log('open operator modal'); setShowOperatorModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Nouvel Opérateur</button>
                  {showOperatorModal && <span className="ml-2 text-xs text-emerald-700">Modal ouvert</span>}
                </div>
              </div>
              {loadingOperators ? (
                <div className="text-center py-10">Chargement...</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="px-4 py-2 text-left">Nom</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Actif</th>
                        <th className="px-4 py-2 text-left">Créé le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operators.map((o: any) => (
                        <tr key={o.id} className="border-t">
                          <td className="px-4 py-2">{o.name}</td>
                          <td className="px-4 py-2">{o.type}</td>
                          <td className="px-4 py-2">{String(o.is_active)}</td>
                          <td className="px-4 py-2">{o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                        </tr>
                      ))}
                      {operators.length === 0 && (
                        <tr><td className="px-4 py-6 text-center text-slate-500" colSpan={4}>Aucun opérateur</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {showOperatorModal && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Nouvel Opérateur</h3>
                      <button onClick={() => setShowOperatorModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">✖</button>
                    </div>
                    <div className="p-4">
                      <ErrorBoundary fallback={<div className="text-red-600">Erreur lors du chargement du formulaire Opérateur.</div>}>
                        <form
                          className="space-y-3"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const data = Object.fromEntries(new FormData(form) as any) as any;
                            const token = localStorage.getItem('app_jwt') || localStorage.getItem('token');
                            const payload = {
                              name: data.name,
                              type: String(data.type || 'PRIVATE').toUpperCase(),
                              is_active: data.is_active === 'on',
                              contact_email: data.contact_email || null,
                              contact_phone: data.contact_phone || null,
                              address: data.address || null,
                              city: data.city || null,
                              country: data.country || null,
                            };
                            try {
                              const resp = await fetch('http://localhost:3002/api/admin-hq/operators', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                                body: JSON.stringify(payload)
                              });
                              if (!resp.ok) throw new Error('create_failed');
                              setShowOperatorModal(false);
                              await loadOperators();
                            } catch (err) {
                              console.error('Erreur création opérateur:', err);
                              alert('Erreur création opérateur');
                            }
                          }}
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <label htmlFor="op-name" className="text-sm">Nom *</label>
                              <input id="op-name" name="name" className="w-full px-3 py-2 border rounded" placeholder="Nom de l'opérateur" title="Nom de l'opérateur" required />
                            </div>
                            <div>
                              <label htmlFor="op-type" className="text-sm">Type *</label>
                              <select id="op-type" name="type" className="w-full px-3 py-2 border rounded" title="Type d'opérateur">
                                <option value="PRIVATE">Privé</option>
                                <option value="PUBLIC">Public</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="op-email" className="text-sm">Email</label>
                              <input id="op-email" name="contact_email" type="email" className="w-full px-3 py-2 border rounded" placeholder="contact@example.com" title="Email" />
                            </div>
                            <div>
                              <label htmlFor="op-phone" className="text-sm">Téléphone</label>
                              <input id="op-phone" name="contact_phone" className="w-full px-3 py-2 border rounded" placeholder="+243 ..." title="Téléphone" />
                            </div>
                            <div>
                              <label htmlFor="op-city" className="text-sm">Ville</label>
                              <input id="op-city" name="city" className="w-full px-3 py-2 border rounded" placeholder="Ville" title="Ville" />
                            </div>
                            <div>
                              <label htmlFor="op-country" className="text-sm">Pays</label>
                              <input id="op-country" name="country" className="w-full px-3 py-2 border rounded" placeholder="Pays" title="Pays" />
                            </div>
                            <div className="col-span-2">
                              <label htmlFor="op-address" className="text-sm">Adresse</label>
                              <input id="op-address" name="address" className="w-full px-3 py-2 border rounded" placeholder="Adresse" title="Adresse" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center space-x-2 text-sm">
                              <input type="checkbox" name="is_active" className="h-4 w-4" defaultChecked />
                              <span>Actif</span>
                            </label>
                            <div className="space-x-2">
                              <button type="button" onClick={() => setShowOperatorModal(false)} className="px-3 py-2 border rounded">Annuler</button>
                              <button type="submit" className="px-3 py-2 bg-emerald-600 text-white rounded">Enregistrer</button>
                            </div>
                          </div>
                        </form>
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'security' && <SecurityCompliance />}
          {activeTab === 'api' && <APIManagement />}
        </div>
      </div>
      {/* Debug status bar (temp) */}
      <div className="fixed bottom-2 right-2 bg-white/90 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-600 shadow-sm">
        <span>tab: {activeTab}</span>
        <span className="mx-2">|</span>
        <span>routeModal: {String(showRouteModal)}</span>
        <span className="mx-2">|</span>
        <span>operatorModal: {String(showOperatorModal)}</span>
      </div>
    </div>
  );
}
