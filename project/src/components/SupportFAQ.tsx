import { useEffect, useMemo, useState } from 'react';
import faqData from '@lib/faq.json';

const Icon = ({ children, className }: { children: string; className?: string }) => (
  <span className={className} aria-hidden>{children}</span>
);
const X = ({ className }: { className?: string }) => <Icon className={className}>✖</Icon>;

export function SupportFAQ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});

  const faqs = useMemo(() => {
    try { return (faqData as any[]).map((f: any) => ({ q: f.question, a: f.answer, cat: f.category })); } catch { return []; }
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [faqs, query]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setErrors({});
    setSubmitted(false);
  }, [isOpen]);

  const validate = () => {
    const e: { email?: string; message?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email invalide';
    if (!message || message.length < 10) e.message = 'Message trop court (min 10 caractères)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    // Simuler un envoi
    await new Promise((r) => setTimeout(r, 500));
    setSubmitted(true);
    setMessage('');
    if ((window as any).addNotification) {
      (window as any).addNotification('success', 'Support', 'Votre message a été envoyé. Nous vous répondrons sous 24h.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Support & FAQ</h2>
            <p className="text-sm text-slate-600">Trouvez des réponses ou contactez-nous</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rechercher dans la FAQ</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Votre question..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((f, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4">
                <div className="font-semibold text-slate-900">{f.q}</div>
                <div className="text-slate-700 mt-1 text-sm">{f.a}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-slate-500 text-sm">Aucun résultat.</div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Contacter le support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="vous@example.com"
                />
                {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`w-full px-4 py-3 border ${errors.message ? 'border-red-300' : 'border-slate-300'} rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="Décrivez votre problème ou question"
                  rows={4}
                />
                {errors.message && <div className="text-xs text-red-600 mt-1">{errors.message}</div>}
              </div>
            </div>
            <div className="text-right mt-3">
              <button onClick={submit} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">Envoyer</button>
              {submitted && <span className="text-sm text-emerald-700 ml-3">Message envoyé ✅</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
