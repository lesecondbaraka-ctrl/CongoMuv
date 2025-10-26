import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type PaymentLog = {
  id: string;
  ts: number;
  bookingRef: string;
  amount: number;
  method: string;
  status: 'success' | 'pending' | 'failed';
};

export function PaymentsConsole({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [items, setItems] = useState<PaymentLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('id, booking_id, amount, payment_method, status, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      const mapped: PaymentLog[] = (data || []).map((i: any) => ({
        id: String(i.id),
        ts: new Date(i.created_at).getTime(),
        bookingRef: String(i.booking_id || ''),
        amount: Number(i.amount || 0),
        method: String(i.payment_method || ''),
        status: (i.status === 'success' || i.status === 'pending' || i.status === 'failed') ? i.status : (i.status === 'completed' ? 'success' : 'pending'),
      }));
      setItems(mapped);
    } catch { setItems([]); }
  };

  useEffect(() => { if (isOpen) { load(); } }, [isOpen]);

  const markAsSuccess = async (id: string) => {
    await supabase.from('payments').update({ status: 'completed' }).eq('id', id);
    await load();
    (window as any).addNotification?.('success', 'Paiement validé', `Ref ${items.find(i=>i.id===id)?.bookingRef || ''}`);
  };

  const exportCSV = () => {
    const rows = [
      ['id','timestamp','bookingRef','amount','method','status'],
      ...items.map(i => [i.id, new Date(i.ts).toISOString(), i.bookingRef, String(i.amount), i.method, i.status])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='payments.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;
  const list = items.filter(i => filter==='all' ? true : i.status===filter);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Paiements (Sandbox)</h2>
            <p className="text-sm text-slate-600">Changer le statut des paiements en attente</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Fermer">✖</button>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm">Filtre</label>
            <select title="Filtrer les paiements" value={filter} onChange={e=>setFilter(e.target.value as any)} className="border px-2 py-1 rounded text-sm">
              <option value="all">Tous</option>
              <option value="success">Succès</option>
              <option value="pending">En attente</option>
              <option value="failed">Échec</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="px-3 py-1 border rounded text-sm">Exporter CSV</button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {list.length===0 ? (
            <div className="text-slate-600 text-sm">Aucun paiement</div>
          ) : list.map(i => (
            <div key={i.id} className="border rounded-lg p-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-slate-900">{i.bookingRef}</div>
                <div className="text-slate-600">{i.amount.toLocaleString('fr-FR')} FC · {i.method} · {i.status}</div>
                <div className="text-slate-500 text-xs">{new Date(i.ts).toLocaleString('fr-FR')}</div>
              </div>
              {i.status==='pending' && (
                <button onClick={()=>markAsSuccess(i.id)} className="px-3 py-1 border rounded text-sm text-emerald-700">Marquer payé</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
