import { useState } from 'react';
import { verifyPassword } from '../lib/auth2FA';
import { authApi } from '../lib/api';


export default function Signup() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await authApi.register(form);
      // Gestion des erreurs API précises
      if (!res || res.error || res.message) {
        const apiMsg = res?.error || res?.message || 'Inscription échouée';
        let errorMsg = '';
        if (apiMsg.toLowerCase().includes('existe déjà')) {
          errorMsg = 'Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez un autre email.';
        } else if (apiMsg.toLowerCase().includes('mot de passe')) {
          errorMsg = 'Mot de passe trop faible ou invalide. Utilisez au moins 8 caractères, une majuscule, une minuscule, un chiffre et un symbole.';
        } else if (apiMsg.toLowerCase().includes('email')) {
          errorMsg = 'Adresse email invalide ou déjà utilisée.';
        } else {
          errorMsg = apiMsg;
        }
        setError(errorMsg);
        setLoading(false);
        return;
      }
      setMessage('Compte créé. Un code OTP vous sera envoyé après vérification du mot de passe.');
      // Déclencher le même flux que le login pour envoyer un OTP
      const loginRes = await verifyPassword(form.email, form.password);
      if (loginRes.success) {
        setMessage('Code OTP envoyé. Allez à la page de connexion pour valider votre code.');
        setTimeout(() => { window.location.hash = '#/login'; }, 600);
      } else {
        setError(loginRes.message || "Impossible d'envoyer le code OTP");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Erreur lors de l'inscription");
      } else {
        setError("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 text-xl" aria-hidden>📝</div>
          <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p className="text-slate-600 text-sm">Voyageur CongoMuv</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {message && !error && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">Adresse email</label>
          <input id="email" type="email" value={form.email} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-4" required />

          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Mot de passe</label>
          <input id="password" type="password" value={form.password} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-4" required />

          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="full_name">Nom complet (optionnel)</label>
          <input id="full_name" type="text" value={form.full_name} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-4" />

          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="phone">Téléphone (optionnel)</label>
          <input id="phone" type="tel" value={form.phone} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 mb-6" />

          <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition disabled:opacity-50">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <button className="text-blue-700 hover:underline" onClick={() => (window.location.hash = '#/login')}>
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
