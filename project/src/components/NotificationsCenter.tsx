import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Notification = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string | Date;
  read: boolean;
};

export function NotificationsCenter({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'info'>('all');

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        setItems((data || []).map((n: any) => ({
          id: String(n.id),
          type: (n.type === 'success' || n.type === 'error' || n.type === 'info') ? n.type : 'info',
          title: n.title || 'Notification',
          message: n.message || '',
          timestamp: new Date(n.created_at),
          read: !!n.read,
        })));
      } catch {
        setItems([]);
      }
    })();
  }, [isOpen]);

  const persist = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      setItems((data || []).map((n: any) => ({
        id: String(n.id), type: (n.type === 'success' || n.type === 'error' || n.type === 'info') ? n.type : 'info',
        title: n.title || 'Notification', message: n.message || '', timestamp: new Date(n.created_at), read: !!n.read,
      })));
    } catch {}
  };

  const markAllAsRead = () => {
    (async () => {
      try { await supabase.from('notifications').update({ read: true }).neq('id', 0); } catch {}
      await persist();
    })();
  };
  const clearAll = () => {
    (async () => {
      try { await supabase.from('notifications').delete().neq('id', 0); } catch {}
      await persist();
    })();
  };

  if (!isOpen) return null;

  const filtered = items.filter(n => (filter === 'all' ? true : n.type === filter));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Centre de notifications</h2>
            <p className="text-sm text-slate-600">Historique complet</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Fermer">✖</button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-700">Filtre</label>
            <select title="Filtrer les notifications" value={filter} onChange={e=>setFilter(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
              <option value="all">Tous</option>
              <option value="success">Succès</option>
              <option value="info">Info</option>
              <option value="error">Erreur</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllAsRead} className="px-3 py-1 border rounded text-sm">Tout lire</button>
            <button onClick={clearAll} className="px-3 py-1 border rounded text-sm text-red-600">Tout effacer</button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-slate-600 text-sm">Aucune notification.</div>
          ) : (
            filtered.map(n => (
              <div key={n.id} className={`border rounded-lg p-3 ${n.read ? 'bg-white' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-xs text-slate-500">{new Date(n.timestamp).toLocaleString('fr-FR')}</div>
                </div>
                <div className="text-sm text-slate-700">{n.message}</div>
                <div className="text-xs text-slate-500 mt-1">{n.type}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
