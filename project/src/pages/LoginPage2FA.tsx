import { useState, useEffect } from 'react';
import { useAuth } from '../lib/authContext';
import { verifyPassword, verifyOTP, type AuthStep, type AuthError } from '../lib/auth2FA';

export default function LoginPage() {
  const { session, loading } = useAuth();
  const [authState, setAuthState] = useState({
    step: 'email' as AuthStep,
    email: '',
    password: '',
    otpCode: '',
    loading: false,
    error: null as AuthError | null,
    message: null as string | null,
  });
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (session && !loading) {
      window.location.hash = '#/admin';
    }
  }, [session, loading]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.email) return;
    // Passer à l'étape mot de passe avant d'envoyer l'OTP côté backend
    setAuthState(prev => ({ ...prev, step: 'password', message: null, error: null }));
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !authState.email || !authState.password) return;
    setAuthState(prev => ({ ...prev, loading: true, error: null, message: null }));
    const result = await verifyPassword(authState.email, authState.password);
    if (result.success) {
      setAuthState(prev => ({ ...prev, loading: false, message: result.message || 'Nouveau code envoyé' }));
      // 30s cooldown
      setResendCooldown(30);
    } else {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'server_error', message: result.message || 'Impossible de renvoyer le code' }));
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown(v => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.email || !authState.password) return;

    setAuthState(prev => ({ ...prev, loading: true, error: null, message: null }));

    const result = await verifyPassword(authState.email, authState.password);
    
    if (result.success) {
      setAuthState(prev => ({ 
        ...prev, 
        step: 'otp', 
        loading: false, 
        message: result.message || 'Code envoyé à votre email'
      }));
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error || 'invalid_password',
        message: result.message || 'Mot de passe incorrect'
      }));
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.email || !authState.otpCode) return;

    setAuthState(prev => ({ ...prev, loading: true, error: null, message: null }));

    const result = await verifyOTP(authState.email, authState.otpCode);
    
    if (result.success) {
      // Sauvegarder les informations de session
      if (result.token) {
        try { 
          // 1. Sauvegarder le token JWT
          localStorage.setItem('app_jwt', result.token);
          
          // 2. Normaliser et sauvegarder le rôle
          let userRole = 'user';
          if (result.user?.role) {
            userRole = result.user.role.toLowerCase().trim();
          } else if (result.role) {
            userRole = result.role.toLowerCase().trim();
          }
          
          // Normalisation supplémentaire des rôles
          if (userRole === 'super_admin') userRole = 'superadmin';
          if (userRole === 'user') userRole = 'passenger';
          
          // 3. Sauvegarder les informations utilisateur
          const userData = result.user || {};
          localStorage.setItem('app_user', JSON.stringify({
            ...userData,
            role: userRole // S'assurer que le rôle est normalisé
          }));
          
          // 4. Sauvegarder le rôle normalisé séparément pour un accès facile
          localStorage.setItem('app_role', userRole);
          
          // 5. Sauvegarder l'email si disponible pour une utilisation ultérieure
          if (userData.email) {
            localStorage.setItem('user_email', userData.email);
          }
          
          console.log('Session sauvegardée avec le rôle:', userRole);
          
        } catch (error) {
          console.error('Erreur lors de la sauvegarde de la session:', error);
          // Nettoyer en cas d'erreur pour éviter des états incohérents
          localStorage.removeItem('app_jwt');
          localStorage.removeItem('app_user');
          localStorage.removeItem('app_role');
        }
      }

      setAuthState(prev => ({ 
        ...prev, 
        step: 'success', 
        loading: false, 
        message: 'Connexion réussie! Redirection en cours...'
      }));

      // Redirection après connexion réussie
      setTimeout(() => {
        try {
          // Récupérer et normaliser le rôle
          const role = (result.role || localStorage.getItem('app_role') || 'user').toLowerCase().trim();
          console.log('[Login] Rôle reçu du serveur:', role);
          
          // Normalisation des rôles
          let normalizedRole = role;
          if (role === 'super_admin' || role === 'superadmin') {
            normalizedRole = 'superadmin';
          } else if (role === 'user') {
            normalizedRole = 'passenger';
          }
          
          console.log('[Login] Rôle normalisé:', normalizedRole);
          
          // Utilisation d'un Record pour la correspondance des rôles
          const roleRedirects: Record<string, string> = {
            'superadmin': '/admin/dashboard',
            'super_admin': '/admin/dashboard',
            'admin': '/admin/dashboard',
            'congomuv_hq': '/admin/hq',
            'onatra': '/operator/dashboard',
            'transco': '/operator/dashboard',
            'private': '/operator/dashboard',
            'operator': '/operator/dashboard',
            'driver': '/driver/dashboard',
            'passenger': '/dashboard',
            'user': '/dashboard'
          } as const;
          
          // Vérifier d'abord si le serveur a fourni une redirection
          const serverRedirect = (result as any).redirectTo;
          if (serverRedirect) {
            console.log('[Login] Redirection serveur détectée:', serverRedirect);
            window.location.hash = `#${serverRedirect}`;
            window.location.reload();
            return;
          }
          
          // Déterminer le chemin de redirection en fonction du rôle
          let redirectPath = roleRedirects[normalizedRole] || '/';
          
          // Journalisation pour le débogage
          console.log(`[Login] Redirection de l'utilisateur (${normalizedRole}) vers:`, redirectPath);
          
          // Effectuer la redirection
          window.location.hash = redirectPath;
          
          // Forcer un rechargement complet pour s'assurer que toutes les données sont chargées
          window.setTimeout(() => {
            window.location.reload();
          }, 100);
          
        } catch (error) {
          console.error('[Login] Erreur lors de la redirection:', error);
          // En cas d'erreur, rediriger vers la page d'accueil
          window.location.hash = '/';
          window.location.reload();
        }
      }, 300);
    } else {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error || 'invalid_otp',
        message: result.message || 'Code incorrect ou expiré. Veuillez réessayer.'
      }));
    }
  };

  const resetAuth = () => {
    setAuthState({
      step: 'email',
      email: '',
      password: '',
      otpCode: '',
      loading: false,
      error: null,
      message: null,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (session) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl" aria-hidden>🔐</div>
          <h1 className="text-2xl font-bold text-slate-900">Connexion CongoMuv</h1>
          <p className="text-slate-600 text-sm">Authentification sécurisée en deux étapes</p>
        </div>

        {/* Messages d'erreur/succès */}
        {authState.error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {authState.message}
          </div>
        )}
        {authState.message && !authState.error && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {authState.message}
          </div>
        )}

        {/* Étape 1: Email */}
        {authState.step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={authState.email}
              onChange={(e) => setAuthState(prev => ({ ...prev, email: e.target.value }))}
              placeholder="nom@exemple.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
              required
            />
            <button
              type="submit"
              disabled={authState.loading || !authState.email}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
            >
              {authState.loading ? 'Envoi...' : 'Continuer'}
            </button>
          </form>
        )}

        {/* Étape 2: Mot de passe (optionnel) */}
        {authState.step === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={authState.password}
                onChange={(e) => setAuthState(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Votre mot de passe"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetAuth}
                className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={authState.loading || !authState.password}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
              >
                {authState.loading ? 'Vérification...' : 'Continuer'}
              </button>
            </div>
          </form>
        )}

        {/* Étape 3: Code OTP */}
        {authState.step === 'otp' && (
          <form onSubmit={handleOTPSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="otp">
                Code de vérification à 6 chiffres
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={authState.otpCode}
                onChange={(e) => setAuthState(prev => ({ ...prev, otpCode: e.target.value.replace(/\D/g, '') }))}
                placeholder="123456"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-lg tracking-widest"
                required
              />
              <p className="text-xs text-slate-500 mt-2">
                Code envoyé à {authState.email}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetAuth}
                className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
              >
                Nouveau code
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={authState.loading || resendCooldown > 0}
                className="flex-1 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-200 transition disabled:opacity-50"
                title="Renvoyer le code OTP"
              >
                {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
              </button>
              <button
                type="submit"
                disabled={authState.loading || authState.otpCode.length !== 6}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
              >
                {authState.loading ? 'Vérification...' : 'Se connecter'}
              </button>
            </div>
          </form>
        )}

        {/* Étape 4: Succès */}
        {authState.step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Connexion réussie!</h2>
            <p className="text-slate-600">Redirection en cours...</p>
          </div>
        )}

        {/* Informations de debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
            <p><strong>Mode développement:</strong></p>
            <p>Étape: {authState.step}</p>
            <p>Email: {authState.email}</p>
            <p>Supabase configuré: {import.meta.env.VITE_SUPABASE_URL ? 'Oui' : 'Non'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
