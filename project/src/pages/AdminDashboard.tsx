import { useState, useEffect } from 'react';
import { Users, Ticket, Calendar, Plus, Trash2 } from 'lucide-react';
import { RoleDebug } from '../components/RoleDebug';

// Icons
const Edit = ({ className }: { className?: string }) => <span className={className}>✏️</span>;
const Shield = ({ className }: { className?: string }) => <span className={className}>🛡️</span>;
const Route = ({ className }: { className?: string }) => <span className={className}>🛣️</span>;
const Bus = ({ className }: { className?: string }) => <span className={className}>🚌</span>;
const Building = ({ className }: { className?: string }) => <span className={className}>🏢</span>;
const AlertTriangleIcon = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;
const Menu = ({ className }: { className?: string }) => <span className={className}>☰</span>;
const LogOut = ({ className }: { className?: string }) => <span className={className}>🚪</span>;

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';

export default function AdminDashboard() {
  const [me, setMe] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routes' | 'trips' | 'operators' | 'users' | 'incidents' | 'access'>('dashboard');
  
  // États séparés par module
  const [stats, setStats] = useState({ totalBookings: 1247, totalRevenue: 45600000, activeTrips: 23, totalPassengers: 8934 });
  const [routesList, setRoutesList] = useState<Array<any>>([]);
  const [tripsList, setTripsList] = useState<Array<any>>([]);
  const [operatorsList, setOperatorsList] = useState<Array<any>>([]);
  const [usersList, setUsersList] = useState<Array<any>>([]);
  const [incidentsList, setIncidentsList] = useState<Array<any>>([]);
  const [invite, setInvite] = useState({ email: '', role: 'ADMIN', organization_name: '', organization_id: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteErr, setInviteErr] = useState<string | null>(null);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Chargement des données par module
  const loadRoutes = () => setRoutesList([{ id: '1', name: 'Kinshasa-Lubumbashi', route_code: 'KIN-LUB', departure_city: 'Kinshasa', arrival_city: 'Lubumbashi', base_price: 150000, is_active: true }]);
  const loadTrips = () => setTripsList([{ id: '1', route: { departure_city: 'Kinshasa', arrival_city: 'Lubumbashi' }, departure_datetime: new Date().toISOString(), vehicle_number: 'BUS001', available_seats: 45, total_seats: 50, status: 'scheduled' }]);
  const loadOperators = () => setOperatorsList([{ id: '1', name: 'ONATRA', type: 'PUBLIC', is_active: true, created_at: new Date().toISOString() }]);
  const loadUsers = () => setUsersList([{ id: '1', email: 'admin@congomuv.cd', full_name: 'Admin CongoMuv', role: 'ADMIN', phone: '+243123456789', created_at: new Date().toISOString() }]);
  const loadIncidents = () => setIncidentsList([{ id: '1', type: 'Retard', description: 'Bus en retard de 30min', severity: 'medium', status: 'investigating', operator: 'ONATRA', date: new Date().toISOString() }]);

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const token = localStorage.getItem('app_jwt');
      const res = await fetch(`${API_BASE}/api/users/admin/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(invite)
      });
      if (!res.ok) throw new Error('Invitation échouée');
      setInviteMsg('Invitation envoyée avec succès');
      setInvite({ email: '', role: 'ADMIN', organization_name: '', organization_id: '' });
    } catch (err: any) {
      setInviteErr(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  useEffect(() => {
    // Charger le profil utilisateur depuis le localStorage
    const token = localStorage.getItem('app_jwt');
    const storedRole = localStorage.getItem('app_role') || 'ADMIN';
    const storedEmail = localStorage.getItem('app_email') || 'admin@congomuv.cd';
    setMe({ role: storedRole.toUpperCase(), email: storedEmail });
    
    // Charger les données selon l'onglet actif
    if (activeTab === 'routes') loadRoutes();
    if (activeTab === 'trips') loadTrips();
    if (activeTab === 'operators') loadOperators();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'incidents') loadIncidents();
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform lg:translate-x-0 lg:static`}>
        <div className="flex flex-col items-center justify-center h-20 bg-slate-900 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">CongoMuv Admin</h1>
          {me?.role === 'SUPER_ADMIN' && (
            <span className="mt-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
              🛡️ SUPER ADMIN
            </span>
          )}
        </div>
        <nav className="mt-8 px-4 space-y-2">
          {[
            { key: 'dashboard', icon: Ticket, label: 'Dashboard' },
            { key: 'routes', icon: Route, label: 'Trajets' },
            { key: 'trips', icon: Bus, label: 'Voyages' },
            { key: 'operators', icon: Building, label: 'Opérateurs', superAdminOnly: true },
            { key: 'users', icon: Users, label: 'Utilisateurs' },
            { key: 'incidents', icon: AlertTriangleIcon, label: 'Incidents' },
            { key: 'access', icon: Shield, label: 'Gestion des accès', superAdminOnly: true }
          ].map(item => (
            (!item.superAdminOnly || me?.role === 'SUPER_ADMIN') && (
              <button key={item.key} onClick={() => setActiveTab(item.key as any)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.key ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            )
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button onClick={() => { localStorage.removeItem('app_jwt'); window.location.href = '/login'; }} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md text-slate-400" aria-label="Toggle sidebar menu">
                <Menu className="w-6 h-6" />
              </button>
              {me?.role === 'SUPER_ADMIN' && (
                <span className="hidden lg:inline-flex px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                  🛡️ SUPER ADMIN - Contrôle Total
                </span>
              )}
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
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {/* DASHBOARD - Statistiques uniquement */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Réservations', value: stats.totalBookings, icon: Ticket, color: 'emerald' },
                { label: 'Revenus', value: `${(stats.totalRevenue / 1000000).toFixed(1)}M FC`, icon: Ticket, color: 'teal' },
                { label: 'Voyages actifs', value: stats.activeTrips, icon: Calendar, color: 'cyan' },
                { label: 'Passagers', value: stats.totalPassengers, icon: Users, color: 'blue' }
              ].map((stat, i) => (
                <div key={i} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 border-${stat.color}-500`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TRAJETS - Routes uniquement */}
          {activeTab === 'routes' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Trajets disponibles</h3>
                  {me?.role === 'SUPER_ADMIN' && (
                    <p className="text-sm text-purple-600 mt-1">✓ Accès complet : Créer, Modifier, Supprimer</p>
                  )}
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />Nouveau trajet
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
                  {routesList.map(route => (
                    <tr key={route.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{route.name}</td>
                      <td className="py-3 px-4">{route.route_code}</td>
                      <td className="py-3 px-4">{route.departure_city}</td>
                      <td className="py-3 px-4">{route.arrival_city}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">{route.base_price?.toLocaleString()} FC</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" aria-label="Edit" title="Modifier"><Edit className="w-4 h-4" /></button>
                        <button className="text-red-600" aria-label="Delete" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VOYAGES - Trips uniquement */}
          {activeTab === 'trips' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Voyages programmés</h3>
                  {me?.role === 'SUPER_ADMIN' && (
                    <p className="text-sm text-purple-600 mt-1">✓ Accès complet : Gérer tous les voyages</p>
                  )}
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />Nouveau voyage
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
                  {tripsList.map(trip => (
                    <tr key={trip.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{trip.route?.departure_city} → {trip.route?.arrival_city}</td>
                      <td className="py-3 px-4">{new Date(trip.departure_datetime).toLocaleString('fr-FR')}</td>
                      <td className="py-3 px-4">{trip.vehicle_number}</td>
                      <td className="py-3 px-4">{trip.available_seats}/{trip.total_seats}</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{trip.status}</span></td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" aria-label="Edit" title="Modifier"><Edit className="w-4 h-4" /></button>
                        <button className="text-red-600" aria-label="Delete" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OPÉRATEURS - Super Admin uniquement */}
          {activeTab === 'operators' && me?.role === 'SUPER_ADMIN' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Opérateurs de transport</h3>
                  <p className="text-sm text-purple-600 mt-1">🛡️ Section réservée SUPER_ADMIN - Contrôle total des opérateurs</p>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />Nouvel opérateur
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
                  {operatorsList.map(op => (
                    <tr key={op.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{op.name}</td>
                      <td className="py-3 px-4">{op.type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${op.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {op.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(op.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" aria-label="Edit" title="Modifier"><Edit className="w-4 h-4" /></button>
                        <button className="text-red-600" aria-label="Delete" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* UTILISATEURS - Comptes uniquement */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Comptes utilisateurs</h3>
                  {me?.role === 'SUPER_ADMIN' && (
                    <p className="text-sm text-purple-600 mt-1">✓ Tous les utilisateurs - Modifier rôles et permissions</p>
                  )}
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
                  {usersList.filter(u => !searchQuery || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{user.email}</td>
                      <td className="py-3 px-4">{user.full_name || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                          {user.role || 'PASSENGER'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.phone || '-'}</td>
                      <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" aria-label="Edit" title="Modifier"><Edit className="w-4 h-4" /></button>
                        <button className="text-red-600" aria-label="Delete" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* INCIDENTS - Problèmes uniquement */}
          {activeTab === 'incidents' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Incidents et problèmes</h3>
                  {me?.role === 'SUPER_ADMIN' && (
                    <p className="text-sm text-purple-600 mt-1">✓ Gestion complète des incidents système</p>
                  )}
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />Signaler incident
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
                  {incidentsList.map(incident => (
                    <tr key={incident.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{incident.type}</td>
                      <td className="py-3 px-4">{incident.description}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${incident.severity === 'high' ? 'bg-red-100 text-red-800' : incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">{incident.status}</td>
                      <td className="py-3 px-4">{incident.operator}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-blue-600 mr-2" aria-label="Edit" title="Modifier"><Edit className="w-4 h-4" /></button>
                        <button className="text-red-600" aria-label="Delete" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* GESTION DES ACCÈS - Invitations uniquement */}
          {activeTab === 'access' && me?.role === 'SUPER_ADMIN' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Contrôle des accès</h3>
                <p className="text-sm text-purple-600 mt-1">🛡️ Section critique - Inviter et gérer les administrateurs</p>
              </div>
              <div className="max-w-md">
                <form onSubmit={submitInvite} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" required value={invite.email} onChange={e=>setInvite(v=>({...v,email:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" aria-label="Email de l'administrateur" title="Email de l'administrateur" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rôle</label>
                    <select value={invite.role} onChange={e=>setInvite(v=>({...v,role:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" aria-label="Rôle de l'administrateur" title="Rôle de l'administrateur">
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Contrôle total)</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="CONGOMUV_HQ">CONGOMUV_HQ</option>
                      <option value="ONATRA">ONATRA</option>
                      <option value="TRANSCO">TRANSCO</option>
                      <option value="PRIVATE">PRIVATE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Organisation</label>
                    <input type="text" value={invite.organization_name} onChange={e=>setInvite(v=>({...v,organization_name:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" aria-label="Organisation" title="Organisation" />
                  </div>
                  {inviteErr && <p className="text-sm text-red-600">{inviteErr}</p>}
                  {inviteMsg && <p className="text-sm text-emerald-600">{inviteMsg}</p>}
                  <button type="submit" disabled={inviteLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50">
                    {inviteLoading ? 'Envoi...' : 'Inviter'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Outil de débogage - Affiche uniquement en développement */}
      {import.meta.env.DEV && <RoleDebug />}
    </div>
  );
}
