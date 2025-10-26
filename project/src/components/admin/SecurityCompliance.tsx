import { useState } from 'react';
// Pas d'imports lucide-react, utilisation d'emojis

export function SecurityCompliance() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Sécurité & Conformité</h2>
        <p className="text-sm text-slate-600">Authentification 2FA, chiffrement et audit logs</p>
      </div>

      {/* Security Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2FA Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <span className="text-2xl">🔑</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Authentification 2FA</h3>
              <p className="text-sm text-slate-600">Double authentification obligatoire</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-4 border-t border-slate-200">
            <span className="text-sm font-medium text-slate-700">Statut 2FA</span>
            <button
              onClick={() => setTwoFAEnabled(!twoFAEnabled)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                twoFAEnabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {twoFAEnabled ? '✓ Activé' : '✗ Désactivé'}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600 mb-2">Applications autorisées :</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Google Authenticator</span>
                <span className="text-green-600">● Actif</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Microsoft Authenticator</span>
                <span className="text-green-600">● Actif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Encryption */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">🔒</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Chiffrement</h3>
              <p className="text-sm text-slate-600">AES-256 pour toutes les données</p>
            </div>
          </div>
          
          <div className="space-y-3 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Base de données</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                AES-256 ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Communications API</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                TLS 1.3 ✓
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Fichiers stockés</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Chiffré ✓
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backups */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <span className="text-2xl">⬇️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sauvegardes Automatiques</h3>
              <p className="text-sm text-slate-600">Protection des données critiques</p>
            </div>
          </div>
          <button
            onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              autoBackupEnabled
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {autoBackupEnabled ? '✓ Activé' : '✗ Désactivé'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Dernière sauvegarde</p>
            <p className="text-sm font-bold text-slate-900">Il y a 2 heures</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Fréquence</p>
            <p className="text-sm font-bold text-slate-900">Toutes les 6h</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600 mb-1">Rétention</p>
            <p className="text-sm font-bold text-slate-900">30 jours</p>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Audit Logs - Dernières Activités</h3>
        <div className="space-y-3">
          {[
            { time: '2025-01-26 10:45', user: 'admin@congomuv.cd', action: 'Connexion système', status: 'success' },
            { time: '2025-01-26 10:30', user: 'operator@onatra.cd', action: 'Modification trajet TRAIN-001', status: 'success' },
            { time: '2025-01-26 09:15', user: 'admin@congomuv.cd', action: 'Export données passagers', status: 'success' },
            { time: '2025-01-26 08:20', user: 'unknown', action: 'Tentative connexion échouée', status: 'failed' }
          ].map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full ${
                  log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <div>
                  <p className="text-sm font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-600">{log.user} • {log.time}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                log.status === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {log.status === 'success' ? 'Succès' : 'Échec'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
