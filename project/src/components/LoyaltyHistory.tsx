import { useEffect, useState } from 'react';
import { getHistory } from '../lib/loyalty';

const Icon = ({ children, className }: { children: string; className?: string }) => (
  <span className={className} aria-hidden>{children}</span>
);
const X = ({ className }: { className?: string }) => <Icon className={className}>✖</Icon>;

export function LoyaltyHistory({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [items, setItems] = useState<{ ts: number; delta: number; reason?: string; ref?: string }[]>([]);

  useEffect(() => {
    if (isOpen) setItems(getHistory());
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Historique des points</h2>
            <p className="text-sm text-slate-600">Dernières opérations</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {items.length === 0 ? (
            <div className="text-slate-600 text-sm">Aucune opération.</div>
          ) : (
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between border border-slate-200 rounded-lg p-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-900">{it.delta > 0 ? `+${it.delta}` : it.delta} pts</div>
                    <div className="text-slate-600">{it.reason || 'Réservation'}</div>
                    {it.ref && <div className="text-slate-500 text-xs">Ref: {it.ref}</div>}
                  </div>
                  <div className="text-slate-500 text-xs">{new Date(it.ts).toLocaleString('fr-FR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
