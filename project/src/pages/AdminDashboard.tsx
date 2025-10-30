import { useEffect, useState } from 'react';
import {
  FaUsers,
  FaRoute,
  FaBus,
  FaExclamationTriangle,
  FaTicketAlt,
  FaChartBar,
  FaBars,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaKey,
  FaBuilding,
  FaSignOutAlt,
} from 'react-icons/fa';
import { demoOperators, demoRoutes, demoTrips, demoIncidents, demoUsers } from '../data/demoData';

// Lightweight local toast (demo-only)
type ToastType = 'success' | 'error' | 'info';
type Toast = { message: string; type: ToastType } | null;

export default function AdminDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routes' | 'trips' | 'operators' | 'users' | 'incidents' | 'access'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth >= 1024);
  const [searchQuery, setSearchQuery] = useState('');

  // Demo local state (no hooks, no network calls)
  const [operators, setOperators] = useState<any[]>(() => [...(demoOperators as any[])]);
  const [routes, setRoutes] = useState<any[]>(() => [...(demoRoutes as any[])]);
  const [trips, setTrips] = useState<any[]>(() => [...(demoTrips as any[])]);
  const [incidents, setIncidents] = useState<any[]>(() => [...(demoIncidents as any[])]);
  const [users] = useState<any[]>(() => [...(demoUsers as any[])]);

  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    const onResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const showLocalToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Simple derived stats for the dashboard
  const stats = {
    totalBookings: trips.reduce((s, t) => s + (t.bookings || 0), 0) || 0,
    totalRevenue: trips.reduce((s, t) => s + (t.price || 0) * (t.bookings || 0), 0) || 0,
    activeTrips: trips.filter(t => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED').length,
    totalPassengers: users.length,
  };

  // Demo CRUD handlers (local only)
  const addRoute = (data: any) => {
    const id = `r-${Date.now()}`;
    setRoutes(prev => [{ ...data, id }, ...prev]);
    showLocalToast('Trajet créé (démo)', 'success');
    setShowRouteModal(false);
  };

  const deleteRoute = (id: string) => {
    if (!confirm('Supprimer ce trajet (demo) ?')) return;
    setRoutes(prev => prev.filter(r => r.id !== id));
    showLocalToast('Trajet supprimé (démo)', 'info');
  };

  const addTrip = (data: any) => {
    const id = `t-${Date.now()}`;
    setTrips(prev => [{ ...data, id }, ...prev]);
    showLocalToast('Voyage créé (démo)', 'success');
    setShowTripModal(false);
  };

  const addOperator = (data: any) => {
    const id = `o-${Date.now()}`;
    setOperators(prev => [{ ...data, id, created_at: new Date().toISOString() }, ...prev]);
    showLocalToast('Opérateur créé (démo)', 'success');
    setShowOperatorModal(false);
  };

  const deleteOperator = (id: string) => {
    if (!confirm('Supprimer cet opérateur (demo) ?')) return;
    setOperators(prev => prev.filter(o => o.id !== id));
    showLocalToast('Opérateur supprimé (démo)', 'info');
  };

  const filteredUsers = users.filter(u => !searchQuery || String(u.email || u.full_name).toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform lg:translate-x-0 lg:static`}>
        <div className="flex flex-col items-center justify-center h-20 bg-slate-900 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">CongoMuv Admin (Demo)</h1>
          <span className="mt-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">🛡️ DEMO</span>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          {[
            { key: 'dashboard', icon: <FaChartBar />, label: 'Tableau de bord' },
            { key: 'routes', icon: <FaRoute />, label: 'Trajets' },
            { key: 'trips', icon: <FaBus />, label: 'Voyages' },
            { key: 'operators', icon: <FaBuilding />, label: 'Opérateurs' },
            { key: 'users', icon: <FaUsers />, label: 'Utilisateurs' },
            { key: 'incidents', icon: <FaExclamationTriangle />, label: 'Incidents' },
            { key: 'access', icon: <FaKey />, label: 'Gestion des accès' },
          ].map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key as any)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.key ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              <span className="w-5 h-5">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={() => { localStorage.removeItem('app_jwt'); window.location.href = '/login'; }} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg">
            <FaSignOutAlt className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md text-slate-400" aria-label="Toggle sidebar menu">
                <FaBars className="w-6 h-6" />
              </button>
              <span className="hidden lg:inline-flex px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">🛡️ DEMO</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Tableau de bord'}
              {activeTab === 'routes' && 'Gestion des trajets'}
              {activeTab === 'trips' && 'Gestion des voyages'}
              {activeTab === 'operators' && 'Gestion des opérateurs'}
              {activeTab === 'users' && 'Gestion des utilisateurs'}
              {activeTab === 'incidents' && 'Gestion des incidents'}
              {activeTab === 'access' && 'Contrôle des accès'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">✓ Mode démonstration</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Réservations</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalBookings}</p>
                  </div>
                  <FaTicketAlt className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Revenus</p>
                    <p className="text-3xl font-bold text-slate-900">{(stats.totalRevenue / 1000000).toFixed(1)}M FC</p>
                  </div>
                  <FaChartBar className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-cyan-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Voyages actifs</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.activeTrips}</p>
                  </div>
                  <FaCalendarAlt className="w-8 h-8 text-cyan-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Passagers</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalPassengers}</p>
                  </div>
                  <FaUsers className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Trajets disponibles</h3>
                  <p className="text-sm text-gray-600 mt-1">Données de démonstration locales</p>
                </div>
                <button onClick={() => setShowRouteModal(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2">
                  <FaPlus className="w-4 h-4" /> Nouveau trajet
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Code</th>
                    <th className="text-left py-3 px-4">Départ</th>
                    <th className="text-left py-3 px-4">Arrivée</th>
                    <th className="text-left py-3 px-4">Prix</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map(r => (
                    <tr key={r.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{r.name}</td>
                      <td className="py-3 px-4">{r.route_code || r.code || '-'}</td>
                      <td className="py-3 px-4">{r.departure_city || r.origin || '-'}</td>
                      <td className="py-3 px-4">{r.arrival_city || r.destination || '-'}</td>
                      <td className="py-3 px-4 font-semibold text-blue-700">{(r.base_price || r.price || 0).toLocaleString()} FC</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" title="Modifier"><FaEdit className="w-4 h-4" /></button>
                        <button onClick={() => deleteRoute(r.id)} className="text-red-600"><FaTrash className="w-4 h-4 inline" /> Supprimer</button>
                      </td>
                    </tr>
                  ))}
                  {routes.length === 0 && (
                    <tr><td className="py-6 px-4 text-center text-slate-500" colSpan={6}>Aucun trajet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Voyages programmés</h3>
                </div>
                <button onClick={() => setShowTripModal(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2">
                  <FaPlus className="w-4 h-4" /> Nouveau voyage
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Trajet</th>
                    <th className="text-left py-3 px-4">Départ</th>
                    <th className="text-left py-3 px-4">Véhicule</th>
                    <th className="text-left py-3 px-4">Places</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(t => (
                    <tr key={t.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{(t.route?.departure_city || t.route?.origin || '-') + ' → ' + (t.route?.arrival_city || t.route?.destination || '-')}</td>
                      <td className="py-3 px-4">{t.departure_datetime ? new Date(t.departure_datetime).toLocaleString('fr-FR') : '-'}</td>
                      <td className="py-3 px-4">{t.vehicle_number || '-'}</td>
                      <td className="py-3 px-4">{(t.available_seats || 0)}/{(t.total_seats || 0)}</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{t.status || '-'}</span></td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" title="Modifier"><FaEdit className="w-4 h-4" /></button>
                        <button className="text-red-600" title="Supprimer"><FaTrash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'operators' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Opérateurs de transport</h3>
                </div>
                <button onClick={() => setShowOperatorModal(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2">
                  <FaPlus className="w-4 h-4" /> Nouvel opérateur
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4">Créé le</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map(o => (
                    <tr key={o.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{o.name}</td>
                      <td className="py-3 px-4">{o.type || '-'}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${o.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{o.is_active ? 'Actif' : 'Inactif'}</span></td>
                      <td className="py-3 px-4">{o.created_at ? new Date(o.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" title="Modifier"><FaEdit className="w-4 h-4" /></button>
                        <button onClick={() => deleteOperator(o.id)} className="text-red-600" title="Supprimer"><FaTrash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Comptes utilisateurs</h3>
                </div>
                <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="px-4 py-2 border rounded-lg" />
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Nom</th>
                    <th className="text-left py-3 px-4">Rôle</th>
                    <th className="text-left py-3 px-4">Téléphone</th>
                    <th className="text-left py-3 px-4">Inscrit le</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{u.email}</td>
                      <td className="py-3 px-4">{u.full_name || '-'}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>{u.role || 'PASSENGER'}</span></td>
                      <td className="py-3 px-4">{u.phone || '-'}</td>
                      <td className="py-3 px-4">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" title="Modifier"><FaEdit className="w-4 h-4" /></button>
                        <button className="text-red-600" title="Supprimer"><FaTrash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Incidents et problèmes</h3>
                </div>
                <button onClick={() => setShowIncidentModal(true)} className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 flex items-center gap-2">
                  <FaPlus className="w-4 h-4" /> Signaler incident
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Sévérité</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4">Opérateur</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map(i => (
                    <tr key={i.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{i.type || i.title}</td>
                      <td className="py-3 px-4">{i.description}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${i.severity === 'high' ? 'bg-red-100 text-red-800' : i.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{i.severity}</span></td>
                      <td className="py-3 px-4">{i.status || '-'}</td>
                      <td className="py-3 px-4">{i.operator || i.operator_id || '-'}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" title="Modifier"><FaEdit className="w-4 h-4" /></button>
                        <button className="text-red-600" title="Supprimer"><FaTrash className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow text-white ${toast.type === 'success' ? 'bg-blue-700' : toast.type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`}>
          {toast.message}
        </div>
      )}

      {/* Simple Modals (route/operator/trip/incident) - minimal forms that call local handlers */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Créer un trajet (démo)</h3>
              <button onClick={() => setShowRouteModal(false)} className="p-2">✖</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); addRoute({ name: String(f.get('name') || 'Nouveau trajet'), route_code: String(f.get('code') || ''), departure_city: String(f.get('origin') || ''), arrival_city: String(f.get('destination') || ''), base_price: Number(f.get('basePrice') || 0) }); }} className="space-y-3">
              <input name="name" placeholder="Nom" className="w-full px-3 py-2 border rounded" required />
              <div className="grid grid-cols-2 gap-3">
                <input name="code" placeholder="Code" className="px-3 py-2 border rounded" />
                <input name="basePrice" type="number" placeholder="Prix" className="px-3 py-2 border rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="origin" placeholder="Origine" className="px-3 py-2 border rounded" />
                <input name="destination" placeholder="Destination" className="px-3 py-2 border rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowRouteModal(false)} className="px-3 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-3 py-2 bg-blue-700 text-white rounded">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOperatorModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Créer un opérateur (démo)</h3>
              <button onClick={() => setShowOperatorModal(false)} className="p-2">✖</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); addOperator({ name: String(f.get('name') || 'Opérateur'), type: String(f.get('type') || 'PRIVATE'), is_active: true }); }} className="space-y-3">
              <input name="name" placeholder="Nom" className="w-full px-3 py-2 border rounded" required />
              <select name="type" className="w-full px-3 py-2 border rounded"><option value="PRIVATE">Privé</option><option value="PUBLIC">Public</option></select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowOperatorModal(false)} className="px-3 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-3 py-2 bg-blue-700 text-white rounded">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTripModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Créer un voyage (démo)</h3>
              <button onClick={() => setShowTripModal(false)} className="p-2">✖</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); addTrip({ route: { departure_city: String(f.get('origin') || ''), arrival_city: String(f.get('destination') || '') }, departure_datetime: String(f.get('departure_datetime') || new Date().toISOString()), vehicle_number: String(f.get('vehicle_number') || 'BUS001'), available_seats: Number(f.get('available_seats') || 0), total_seats: Number(f.get('available_seats') || 0), status: 'SCHEDULED' }); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="origin" placeholder="Origine" className="px-3 py-2 border rounded" required />
                <input name="destination" placeholder="Destination" className="px-3 py-2 border rounded" required />
                <input name="departure_datetime" type="datetime-local" className="px-3 py-2 border rounded" required />
                <input name="vehicle_number" placeholder="Véhicule" className="px-3 py-2 border rounded" />
                <input name="available_seats" type="number" placeholder="Places dispo" className="px-3 py-2 border rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowTripModal(false)} className="px-3 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-3 py-2 bg-blue-700 text-white rounded">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIncidentModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Signaler un incident (démo)</h3>
              <button onClick={() => setShowIncidentModal(false)} className="p-2">✖</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget as HTMLFormElement); setIncidents(prev => [{ id: `i-${Date.now()}`, type: String(f.get('type') || ''), description: String(f.get('description') || ''), severity: String(f.get('severity') || 'medium') }, ...prev]); setShowIncidentModal(false); }} className="space-y-3">
              <input name="type" placeholder="Type" className="w-full px-3 py-2 border rounded" required />
              <textarea name="description" placeholder="Description" rows={4} className="w-full px-3 py-2 border rounded" required />
              <select name="severity" defaultValue="medium" className="w-full px-3 py-2 border rounded"><option value="low">Faible</option><option value="medium">Moyenne</option><option value="high">Élevée</option></select>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowIncidentModal(false)} className="px-3 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-3 py-2 bg-blue-700 text-white rounded">Signaler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
