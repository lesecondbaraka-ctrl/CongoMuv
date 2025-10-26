import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function LoginPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [code, setCode] = useState('');

  const sendOtp = async () => {
    try {
      setSending(true);
      setStatus(null);
      setError(null);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setAwaitingCode(true);
      setStatus('Code envoyé. Vérifiez votre email et saisissez le code à 6 chiffres.');
    } catch (e: any) {
      setError(e?.message || 'Échec de l\'envoi du code');
    } finally {
      setSending(false);
    }
  };

  const handlePasswordLogin = async () => {
    try {
      setSending(true);
      setStatus(null);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password } as any);
      if (error) throw error;
      // Étape 2FA: envoyer OTP même après succès du mot de passe
      await sendOtp();
      setStatus('Mot de passe validé. Un code à 6 chiffres vient d\'être envoyé à votre email.');
    } catch (e: any) {
      setError(e?.message || 'Échec de la connexion');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setSending(true);
      setStatus(null);
      setError(null);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      } as any);
      if (error) throw error;
      if (data?.session) {
        // Connexion réussie avec 2FA
        window.location.reload();
      } else {
        setError('Vérification échouée.');
      }
    } catch (e: any) {
      setError(e?.message || 'Code invalide');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (session) {
    // Récupérer le rôle de l'utilisateur depuis les métadonnées
    const userRole = session.user?.user_metadata?.role || 'user';
    
    // Rediriger en fonction du rôle
    if (userRole === 'super_admin' || userRole === 'admin') {
      if (location.hash !== '#/admin') {
        location.hash = '#/admin';
      }
    } else if (userRole === 'operator') {
      if (location.hash !== '#/operator') {
        location.hash = '#/operator';
      }
    } else {
      if (location.hash !== '#/passager') {
        location.hash = '#/passager';
      }
    }
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl" aria-hidden>🔐</div>
          <h1 className="text-2xl font-bold text-slate-900">Connexion administrateur</h1>
          <p className="text-slate-600 text-sm">Accédez au panneau d'administration CongoMuv</p>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
        )}
        {status && (
          <div className="mb-3 p-3 rounded bg-emerald-50 text-emerald-700 text-sm">{status}</div>
        )}

        <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">Adresse email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@exemple.com"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
        />

        {!awaitingCode && (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4"
            />
          </>
        )}

        {!awaitingCode ? (
          <button
            onClick={handlePasswordLogin}
            disabled={sending || !email || !password}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
          >
            {sending ? 'Connexion...' : 'Continuer'}
          </button>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 mt-4" htmlFor="otp">Code à 6 chiffres</label>
            <input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4 tracking-widest text-center"
            />
            <button
              onClick={verifyOtp}
              disabled={sending || code.length !== 6}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50"
            >
              {sending ? 'Vérification...' : 'Se connecter'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
