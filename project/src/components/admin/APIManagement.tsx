import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  partner_name: string;
  permissions: string[];
  calls_today: number;
  created_at: string;
  is_active: boolean;
}

export function APIManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production Key - Airtel Money',
      key: 'sk_live_abc123xyz789def456ghi',
      partner_name: 'Airtel Money',
      permissions: ['payments:read', 'payments:write'],
      calls_today: 1547,
      created_at: '2025-01-15T10:00:00',
      is_active: true
    },
    {
      id: '2',
      name: 'Test Key - Orange Money',
      key: 'sk_test_xyz789abc123def456ghi',
      partner_name: 'Orange Money',
      permissions: ['payments:read'],
      calls_today: 342,
      created_at: '2025-01-20T14:30:00',
      is_active: true
    }
  ]);

  const [showModal, setShowModal] = useState(false);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    alert('Clé API copiée !');
  };

  const handleToggleActive = (id: string) => {
    setApiKeys(apiKeys.map(k => 
      k.id === id ? { ...k, is_active: !k.is_active } : k
    ));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette clé API ?')) return;
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">API Management</h2>
          <p className="text-sm text-slate-600">Contrôle des accès partenaires externes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Clé API</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🔑</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{apiKeys.length}</p>
          <p className="text-xs text-slate-600">Clés API Actives</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔌</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {apiKeys.reduce((sum, k) => sum + k.calls_today, 0).toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-slate-600">Appels Aujourd'hui</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🤝</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {new Set(apiKeys.map(k => k.partner_name)).size}
          </p>
          <p className="text-xs text-slate-600">Partenaires</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">99.8%</p>
          <p className="text-xs text-slate-600">Disponibilité</p>
        </div>
      </div>

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <span className="text-2xl">🔑</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{apiKey.name}</h3>
                    <p className="text-sm text-slate-600">{apiKey.partner_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apiKey.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {apiKey.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* API Key Display */}
                <div className="flex items-center space-x-2 mb-4">
                  <code className="flex-1 bg-slate-100 px-4 py-2 rounded font-mono text-sm text-slate-700">
                    {apiKey.key}
                  </code>
                  <button
                    onClick={() => handleCopyKey(apiKey.key)}
                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded transition"
                    title="Copier"
                  >
                    <span>📋</span>
                  </button>
                </div>

                {/* Stats & Permissions */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-600">Appels Aujourd'hui</p>
                    <p className="font-semibold text-slate-900">{apiKey.calls_today.toLocaleString('fr-FR')}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Permissions</p>
                    <p className="font-semibold text-slate-900">{apiKey.permissions.length}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600">Créée le</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(apiKey.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Permissions Tags */}
                <div>
                  <p className="text-xs text-slate-600 mb-2">Permissions accordées :</p>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map((perm, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(apiKey.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    apiKey.is_active
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {apiKey.is_active ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => handleDelete(apiKey.id)}
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

      {/* Usage Documentation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Documentation API</h3>
        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900 mb-2">Base URL</p>
            <code className="text-sm text-slate-700">https://api.congomuv.cd/v1</code>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900 mb-2">Authentication</p>
            <code className="text-sm text-slate-700">Authorization: Bearer YOUR_API_KEY</code>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900 mb-2">Rate Limit</p>
            <code className="text-sm text-slate-700">1000 requêtes/heure par clé</code>
          </div>
        </div>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Nouvelle Clé API</h3>
            <p className="text-slate-600 mb-4">Fonctionnalité à implémenter</p>
            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
