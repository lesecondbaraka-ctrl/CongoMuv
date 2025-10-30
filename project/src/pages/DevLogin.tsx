import { useState } from 'react';

/**
 * Page de connexion RAPIDE pour le développement
 * Pas besoin d'OTP, connexion immédiate
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function DevLogin() {
  const [email, setEmail] = useState('admin@congomuv.cd');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = async () => {
    try {
      setSending(true);
      setStatus(null);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/dev-auth/quick-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'unused' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem('app_jwt', data.token);
      localStorage.setItem('app_role', (data.user.role || 'user').toUpperCase());
      localStorage.setItem('app_email', data.user.email);
      localStorage.setItem('app_user_id', data.user.id);
      if (data.user.organization_id) {
        localStorage.setItem('app_organization_id', data.user.organization_id);
      }
      
      setStatus('✅ Connexion réussie ! Redirection...');
      
      setTimeout(() => {
        window.location.hash = '#/admin';
        window.location.reload();
      }, 500);
    } catch (e: any) {
      setError(e?.message || 'Échec de la connexion');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-200 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 text-3xl">
            🚀
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Connexion Rapide DEV</h1>
          <p className="text-slate-600 text-sm mt-2">Mode développement - Connexion instantanée</p>
          <div className="mt-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">⚠️ Uniquement pour le développement</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        {status && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm">
            {status}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email (automatiquement créé si n'existe pas)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nom@exemple.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <button
            onClick={handleQuickLogin}
            disabled={sending || !email}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '⏳ Connexion...' : '🚀 Connexion Instantanée'}
          </button>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Comment ça marche:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Entrez n'importe quel email</li>
              <li>Si le profil existe, connexion directe</li>
              <li>Sinon, création automatique avec rôle "admin"</li>
              <li>Redirection immédiate vers le dashboard</li>
            </ul>
          </div>

          <div className="text-center">
            <a 
              href="#/login" 
              className="text-sm text-blue-600 hover:underline"
            >
              Utiliser la connexion normale (avec OTP)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
