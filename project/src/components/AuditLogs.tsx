import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AuditLog = {
  id: string;
  ts: number;
  type: 'login';
  ref?: string;
  message: string;
};

export function AuditLogs({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'login'>('all');

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('login_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      const mapped: AuditLog[] = (data || []).map((r: { id: string; created_at: string; email?: string; ip_address?: string; user_agent?: string }) => ({
        id: String(r.id),
        ts: new Date(r.created_at).getTime(),
        type: 'login',
        ref: r.email,
        message: `${r.ip_address || ''} · ${r.user_agent || ''}`,
      }));
      setItems(mapped);
    } catch (error) {
      console.error('Erreur lors du chargement des journaux :', error);
      setItems([]);
    }
  };

  useEffect(() => { if (isOpen) load(); }, [isOpen]);

  const exportCSV = () => {
    const rows = [
      ['id','timestamp','type','ref','message'],
      ...items.map(i => [i.id, new Date(i.ts).toISOString(), i.type, i.ref || '', i.message.replace(/,/g,';')])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='audit.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const clearAll = async () => {
    try {
      await supabase.from('login_logs').delete().neq('id', 0);
      await load();
    } catch (error) {
      console.error('Erreur lors de la suppression des journaux :', error);
    }
  };

  if (!isOpen) return null;
  const list = items.filter(i => filter==='all' ? true : i.type===filter);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Journal des connexions</h2>
            <p className="text-sm text-slate-600">Opérations récentes</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Fermer">✖</button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm">Filtre</label>
            <select title="Filtrer les événements" value={filter} onChange={e => setFilter(e.target.value as 'all' | 'login')} className="border px-2 py-1 rounded text-sm">
              <option value="all">Tous</option>
              <option value="login">Connexions</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="px-3 py-1 border rounded text-sm">Exporter CSV</button>
            <button onClick={clearAll} className="px-3 py-1 border rounded text-sm text-red-600">Vider</button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {list.length === 0 ? (
            <div className="text-slate-600 text-sm">Aucun événement</div>
          ) : list.map(i => (
            <div key={i.id} className="border rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">{i.type.toUpperCase()}</div>
                <div className="text-xs text-slate-500">{new Date(i.ts).toLocaleString('fr-FR')}</div>
              </div>
              {i.ref && <div className="text-slate-600">Ref: {i.ref}</div>}
              <div className="text-slate-700">{i.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
