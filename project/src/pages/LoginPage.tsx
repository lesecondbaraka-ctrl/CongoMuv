import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [code, setCode] = useState('');

  // Connexion : étape 1 - envoyer le code OTP
  const handlePasswordLogin = async () => {
    try {
      setSending(true);
      setStatus(null);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }
      
      setAwaitingCode(true);
      setStatus('✅ Code OTP envoyé à votre email. Vérifiez votre boîte de réception.');
    } catch (e: any) {
      setError(e?.message || 'Échec de la connexion');
    } finally {
      setSending(false);
    }
  };


  // Connexion : étape 2 - vérifier le code OTP
  const verifyOtp = async () => {
    try {
      setSending(true);
      setStatus(null);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Code invalide');
      }
      
      // Stocker le token et les infos utilisateur dans localStorage
      localStorage.setItem('app_jwt', data.token);
      localStorage.setItem('app_role', (data.user.role || 'user').toUpperCase());
      localStorage.setItem('app_email', data.user.email);
      localStorage.setItem('app_user_id', data.user.id);
      if (data.user.organization_id) {
        localStorage.setItem('app_organization_id', data.user.organization_id);
      }
      
      // Redirection automatique selon le rôle
      const roleRedirects: Record<string, string> = {
        superadmin: '#/admin',
        admin: '#/admin',
        operator: '#/operator',
        driver: '#/driver',
        chauffeur: '#/driver',
        passenger: '#/passager',
        user: '#/passager',
      };
      
      const userRole = (data.user.role || 'user').toLowerCase();
      const redirectPath = data.redirect || roleRedirects[userRole] || '#/passager';
      
      setStatus('✅ Connexion réussie ! Redirection...');
      setTimeout(() => {
        window.location.hash = redirectPath;
        window.location.reload();
      }, 500);
    } catch (e: any) {
      setError(e?.message || 'Code invalide');
    } finally {
      setSending(false);
    }
  };

  // Vérifier si déjà connecté
  const token = localStorage.getItem('app_jwt');
  if (token && token !== 'null' && token !== 'undefined') {
    const role = (localStorage.getItem('app_role') || 'user').toLowerCase();
    const roleRedirects: Record<string, string> = {
      super_admin: '#/admin',
      superadmin: '#/admin',
      admin: '#/admin',
      operator: '#/operator',
      driver: '#/driver',
      chauffeur: '#/driver',
      passenger: '#/passager',
      user: '#/passager',
    };
    const redirectPath = roleRedirects[role] || '#/passager';
    if (location.hash !== redirectPath) {
      window.location.hash = redirectPath;
    }
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 text-xl" aria-hidden>
            🔐
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Connexion CongoMuv</h1>
          <p className="text-slate-600 text-sm">Authentification sécurisée en deux étapes</p>
        </div>

        {error && <div className="mb-3 p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>}
        {status && <div className="mb-3 p-3 rounded bg-blue-50 text-blue-700 text-sm">{status}</div>}

        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Adresse email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="nom@exemple.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-4"
        />

        {!awaitingCode && (
          <>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-4"
            />
          </>
        )}

        {!awaitingCode ? (
          <button
            onClick={handlePasswordLogin}
            disabled={sending || !email || !password}
            className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition disabled:opacity-50"
          >
            {sending ? 'Connexion...' : 'Continuer'}
          </button>
        ) : (
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2 mt-4">Code à 6 chiffres</label>
            <input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-4 tracking-widest text-center"
            />
            <button
              onClick={verifyOtp}
              disabled={sending || code.length !== 6}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition disabled:opacity-50"
            >
              {sending ? 'Vérification...' : 'Se connecter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
