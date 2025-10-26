import { useState } from 'react';
import { verifyPassword } from '../lib/auth2FA';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';

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
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Inscription échouée');
      }
      setMessage('Compte créé. Un code OTP vous sera envoyé après vérification du mot de passe.');
      // Déclencher le même flux que le login pour envoyer un OTP
      const loginRes = await verifyPassword(form.email, form.password);
      if (loginRes.success) {
        setMessage('Code OTP envoyé. Allez à la page de connexion pour valider votre code.');
        // Rediriger vers la page login avec email prérempli
        setTimeout(() => { window.location.hash = '#/login'; }, 600);
      } else {
        setError(loginRes.message || 'Impossible d\'envoyer le code OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl" aria-hidden>📝</div>
          <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
          <p className="text-slate-600 text-sm">Voyageur CongoMuv</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {message && !error && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">Adresse email</label>
          <input id="email" type="email" value={form.email} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4" required />

          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">Mot de passe</label>
          <input id="password" type="password" value={form.password} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4" required />

          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="full_name">Nom complet (optionnel)</label>
          <input id="full_name" type="text" value={form.full_name} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-4" />

          <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="phone">Téléphone (optionnel)</label>
          <input id="phone" type="tel" value={form.phone} onChange={onChange}
                 className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-6" />

          <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <button className="text-emerald-700 hover:underline" onClick={() => (window.location.hash = '#/login')}>
            Déjà un compte ? Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
