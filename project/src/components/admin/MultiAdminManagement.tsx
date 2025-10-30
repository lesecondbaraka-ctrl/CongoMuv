import { useState, useEffect } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_name: string;
  organization_id: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

export function MultiAdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('OPERATOR');
  const [inviteOrg, setInviteOrg] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
      const resp = await fetch('http://localhost:3002/api/admin-hq/admins', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json?.error || 'Erreur chargement admins');
      const items = Array.isArray(json?.data) ? json.data : [];
      setAdmins(items as any);
    } catch (error) {
      console.error('Erreur chargement admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('app_jwt');
      await fetch('http://localhost:3002/api/admin-hq/admins/invite', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, organization_name: inviteOrg })
      });
      setShowModal(false);
      setInviteEmail('');
      setInviteOrg('');
      loadAdmins();
    } catch (error) {
      console.error('Erreur invitation:', error);
    }
  };

  const handleToggleActive = async (adminId: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
      const resp = await fetch(`http://localhost:3002/api/admin-hq/admins/${adminId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) throw new Error('toggle_failed');
      setAdmins(admins.map(a => a.id === adminId ? { ...a, is_active: !a.is_active } : a));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (adminId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet administrateur ?')) return;
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
      const resp = await fetch(`http://localhost:3002/api/admin-hq/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) throw new Error('delete_failed');
      setAdmins(admins.filter(a => a.id !== adminId));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion Multi-Admins</h2>
          <p className="text-sm text-slate-600">Attribution des droits d'accès par organisation</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Inviter Admin</span>
        </button>
      </div>

      {/* Admins List */}
      <div className="grid gap-4">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{admin.full_name}</h3>
                    <p className="text-sm text-slate-600">{admin.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    admin.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-600">Organisation</p>
                    <p className="font-semibold text-slate-900">{admin.organization_name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Rôle</p>
                    <p className="font-semibold text-slate-900">{admin.role}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Permissions</p>
                    <p className="font-semibold text-slate-900">{admin.permissions.length}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Créé le</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-4">
                  <p className="text-xs text-slate-600 mb-2">Permissions actives :</p>
                  <div className="flex flex-wrap gap-2">
                    {admin.permissions.map((perm, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(admin.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title={admin.is_active ? 'Désactiver' : 'Activer'}
                >
                  <span>🛡️</span>
                </button>
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Inviter un Administrateur</h3>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="exemple@email.com"
                  aria-label="Adresse email de l'administrateur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Organisation
                </label>
                <input
                  type="text"
                  value={inviteOrg}
                  onChange={(e) => setInviteOrg(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nom de l'organisation"
                  aria-label="Nom de l'organisation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rôle
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  aria-label="Rôle de l'administrateur"
                  title="Sélectionner le rôle"
                >
                  <option value="OPERATOR">Opérateur</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Envoyer Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
