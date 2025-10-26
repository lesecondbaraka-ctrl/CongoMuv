import { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import './reports-analytics.css';

interface RevenueData {
  period: string;
  revenue: number;
  trips: number;
  passengers: number;
}

interface LinePerformance {
  line_name: string;
  revenue: number;
  occupancy_rate: number;
  trips_count: number;
}

export function ReportsAnalytics() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [linePerformance, setLinePerformance] = useState<LinePerformance[]>([]);
  const [, setLoading] = useState(false);

  const [summary] = useState({
    totalRevenue: 48500000,
    averageOccupancy: 78,
    totalTrips: 156,
    totalPassengers: 1247,
    satisfactionRate: 4.5
  });

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // TODO: Appel API
      // Données simulées
      setRevenueData([
        { period: 'Semaine 1', revenue: 12000000, trips: 38, passengers: 310 },
        { period: 'Semaine 2', revenue: 11500000, trips: 42, passengers: 295 },
        { period: 'Semaine 3', revenue: 13200000, trips: 40, passengers: 335 },
        { period: 'Semaine 4', revenue: 11800000, trips: 36, passengers: 307 }
      ]);

      setLinePerformance([
        { line_name: 'Kinshasa - Lubumbashi', revenue: 25000000, occupancy_rate: 85, trips_count: 45 },
        { line_name: 'Matadi - Kinshasa', revenue: 15000000, occupancy_rate: 72, trips_count: 65 },
        { line_name: 'Kinshasa - Kisangani', revenue: 8500000, occupancy_rate: 68, trips_count: 46 }
      ]);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Statistiques & Rapports</h2>
          <p className="text-sm text-slate-600">Revenu par ligne, satisfaction client, ponctualité</p>
        </div>
        <button
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <span>📄</span>
          <span>Exporter PDF</span>
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2">
        {[
          { value: 'day', label: 'Jour' },
          { value: 'week', label: 'Semaine' },
          { value: 'month', label: 'Mois' },
          { value: 'year', label: 'Année' }
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              period === p.value
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <span className="text-xl">💰</span>
            </div>
            <p className="text-sm text-slate-600">Revenu Total</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {summary.totalRevenue.toLocaleString('fr-FR')} FC
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <span className="text-xl">📈</span>
            </div>
            <p className="text-sm text-slate-600">Taux Remplissage</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.averageOccupancy}%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Trajets</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.totalTrips}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600">Passagers</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.totalPassengers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <span className="text-yellow-600 text-xl">⭐</span>
            </div>
            <p className="text-sm text-slate-600">Satisfaction</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.satisfactionRate}/5</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Évolution du Revenu</h3>
        <div className="space-y-3">
          {revenueData.map((data, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-slate-600">{data.period}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{data.trips} trajets • {data.passengers} passagers</span>
                  <span className="font-semibold text-slate-900">
                    {data.revenue.toLocaleString('fr-FR')} FC
                  </span>
                </div>
                <div className="revenue-container">
                  <div 
                    className="revenue-bar"
                    data-revenue-scale={data.revenue / 15000000}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Performance par Ligne</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Ligne</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Revenu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Trajets</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Taux Remplissage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {linePerformance.map((line, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">{line.line_name}</td>
                  <td className="px-4 py-4 text-slate-900 font-semibold">
                    {line.revenue.toLocaleString('fr-FR')} FC
                  </td>
                  <td className="px-4 py-4 text-slate-600">{line.trips_count}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="occupancy-container">
<div
                          className={`occupancy-bar ${
                            line.occupancy_rate >= 80 ? 'high' :
                            line.occupancy_rate >= 60 ? 'medium' : 'low'
                          }`}
                          data-occupancy-width={line.occupancy_rate}
                        />
                      </div>
                      <span className="font-semibold text-slate-900">{line.occupancy_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <h4 className="font-bold text-emerald-900 mb-2">💡 Meilleure Performance</h4>
          <p className="text-emerald-800 text-sm">
            La ligne <strong>Kinshasa - Lubumbashi</strong> génère le plus de revenus avec un taux de remplissage de 85%.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-bold text-yellow-900 mb-2">⚠️ À Améliorer</h4>
          <p className="text-yellow-800 text-sm">
            La ligne <strong>Kinshasa - Kisangani</strong> a un taux de remplissage de 68%. Considérez des promotions.
          </p>
        </div>
      </div>
    </div>
  );
}
