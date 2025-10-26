import { useMemo, useState } from 'react';
import { Trip } from '../types';
import { getPayments } from '../lib/logs';

export default function AdminReports({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data?: { bookings?: any[]; payments?: any[]; trips?: Trip[] } }) {
  if (!isOpen) return null;

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const totals = useMemo(() => {
    // Prefer local logs if data not provided
    const paymentsSrc = (data?.payments && data.payments.length > 0) ? data.payments : getPayments();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : undefined;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : undefined;
    const payments = paymentsSrc.filter((p: any) => {
      const ts = new Date(p.ts || p.created_at || p.date || Date.now()).getTime();
      if (from && ts < from) return false;
      if (to && ts > to) return false;
      return true;
    });
    const totalRevenue = payments.filter((p: any) => p.status === 'success').reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
    // In absence of real bookings list, approximate by count of payments
    const totalBookings = payments.length;
    const avgPerBooking = totalBookings ? Math.round(totalRevenue / totalBookings) : 0;
    return { totalRevenue, totalBookings, avgPerBooking, payments };
  }, [data, dateFrom, dateTo]);

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Date From', dateFrom || ''],
      ['Date To', dateTo || ''],
      ['Total Revenue (FC)', String(totals.totalRevenue)],
      ['Total Bookings', String(totals.totalBookings)],
      ['Avg/Booking (FC)', String(totals.avgPerBooking)],
      [],
      ['Payments (filtered)'],
      ['id','timestamp','bookingRef','amount','method','status'],
      ...totals.payments.map((p: any) => [p.id || '', new Date(p.ts || Date.now()).toISOString(), p.bookingRef || '', String(p.amount || 0), p.method || '', p.status || ''])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'admin-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Rapports Admin (mock)</h2>
            <p className="text-sm text-slate-600">KPIs simples et export CSV</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" aria-label="Fermer">✖</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-700" htmlFor="rep-from">Du</label>
              <input id="rep-from" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border px-2 py-1 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-700" htmlFor="rep-to">Au</label>
              <input id="rep-to" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="border px-2 py-1 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-600">Revenus</div>
              <div className="text-2xl font-bold text-emerald-600">{(totals.totalRevenue || 0).toLocaleString('fr-FR')} FC</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-600">Réservations</div>
              <div className="text-2xl font-bold text-blue-600">{(totals.totalBookings || 0).toLocaleString('fr-FR')}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-600">Moyenne/booking</div>
              <div className="text-2xl font-bold text-purple-600">{(totals.avgPerBooking || 0).toLocaleString('fr-FR')} FC</div>
            </div>
          </div>
          <div className="text-right">
            <button onClick={exportCSV} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Exporter CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
