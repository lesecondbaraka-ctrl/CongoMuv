import { useState, useEffect } from 'react';
import { Users, MapPin, Calendar } from 'lucide-react';

interface PassengerStats {
  date: string;
  totalPassengers: number;
  totalBookings: number;
  totalPayments: number;
  averageTicketPrice: number;
}

export function SupervisionPassengers() {
  const [stats, setStats] = useState<PassengerStats[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('app_jwt');
      const response = await fetch(`http://localhost:3002/api/admin/supervision/passengers?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erreur API');
      const data = await response.json();
      setStats(data.stats || []);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalPassengers = stats.reduce((sum, s) => sum + s.totalPassengers, 0);
  const totalRevenue = stats.reduce((sum, s) => sum + s.totalPayments, 0);
  const avgTicketPrice = totalRevenue / stats.reduce((sum, s) => sum + s.totalBookings, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Supervision Passagers</h2>
          <p className="text-sm text-slate-600">Vue consolidée des trajets, paiements et volumes</p>
        </div>
        <div className="flex space-x-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Passagers</p>
              <p className="text-2xl font-bold text-slate-900">{totalPassengers.toLocaleString('fr-FR')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <span>📈</span>
            <span>+12% vs période précédente</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-slate-600">Revenu Total</p>
              <p className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString('fr-FR')} FC</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <span>📈</span>
            <span>+8% vs période précédente</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">🎫</span>
            </div>
            <div>
              <p className="text-sm text-slate-600">Prix Moyen</p>
              <p className="text-2xl font-bold text-slate-900">{avgTicketPrice.toFixed(0)} FC</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-green-600">
            <span>📈</span>
            <span>+5% vs période précédente</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Détails par Jour</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Passagers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Réservations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Paiements (FC)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Prix Moyen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats.map((stat, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{formatDate(stat.date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900">{stat.totalPassengers.toLocaleString('fr-FR')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{stat.totalBookings.toLocaleString('fr-FR')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-emerald-600">{stat.totalPayments.toLocaleString('fr-FR')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{stat.averageTicketPrice.toFixed(0)} FC</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Routes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Routes les Plus Populaires</h3>
        <div className="space-y-3">
          {[
            { route: 'Kinshasa → Lubumbashi', passengers: 2345, revenue: 98500000 },
            { route: 'Matadi → Kinshasa', passengers: 1876, revenue: 45200000 },
            { route: 'Kinshasa → Kisangani', passengers: 1234, revenue: 67800000 }
          ].map((route, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-slate-900">{route.route}</p>
                  <p className="text-sm text-slate-600">{route.passengers.toLocaleString('fr-FR')} passagers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600">{route.revenue.toLocaleString('fr-FR')} FC</p>
                <p className="text-xs text-slate-600">Revenu total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
