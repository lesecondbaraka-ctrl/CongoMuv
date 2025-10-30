import React from 'react';
import { useTripsStats } from '../hooks/useTripsStats';
import { useReservations } from '../hooks/useReservations';
import { useFinances } from '../hooks/useFinances';

export const DashboardStats: React.FC = () => {
  const { stats: apiTripsStats, loading: tripsLoading } = useTripsStats();
  const { stats: apiReservationStats, loading: reservationsLoading } = useReservations();
  const { stats: apiFinanceStats, loading: financesLoading } = useFinances();
  
  // Données de démonstration
  const demoTripsStats = { total: 25, en_cours: 3, en_attente: 8, termine: 12, annule: 2 };
  const demoReservationStats = { total: 156, today: 12, confirmed: 128, pending: 18, cancelled: 10, revenue_total: 15600000, revenue_today: 1200000 };
  const demoFinanceStats = { total_entrees: 15600000, total_sorties: 2400000, balance: 13200000, entrees_today: 1200000, sorties_today: 150000, entrees_month: 8500000, sorties_month: 1800000 };
  
  // Utiliser les données de démo si pas de données API
  const tripsStats = apiTripsStats.total > 0 ? apiTripsStats : demoTripsStats;
  const reservationStats = apiReservationStats.total > 0 ? apiReservationStats : demoReservationStats;
  const financeStats = apiFinanceStats.total_entrees > 0 ? apiFinanceStats : demoFinanceStats;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF'
    }).format(amount);
  };

  if (tripsLoading || reservationsLoading || financesLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Statistiques Voyages */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">📊 Voyages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-blue-600">{tripsStats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">En cours</div>
            <div className="text-2xl font-bold text-green-600">{tripsStats.en_cours}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">En attente</div>
            <div className="text-2xl font-bold text-yellow-600">{tripsStats.en_attente}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Terminés</div>
            <div className="text-2xl font-bold text-purple-600">{tripsStats.termine}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Annulés</div>
            <div className="text-2xl font-bold text-red-600">{tripsStats.annule}</div>
          </div>
        </div>
      </div>

      {/* Statistiques Réservations */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">🎫 Réservations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-indigo-600">{reservationStats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-cyan-500">
            <div className="text-sm text-gray-600 mb-1">Aujourd'hui</div>
            <div className="text-2xl font-bold text-cyan-600">{reservationStats.today}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Confirmées</div>
            <div className="text-2xl font-bold text-green-600">{reservationStats.confirmed}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">En attente</div>
            <div className="text-2xl font-bold text-orange-600">{reservationStats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Annulées</div>
            <div className="text-2xl font-bold text-red-600">{reservationStats.cancelled}</div>
          </div>
        </div>
      </div>

      {/* Statistiques Financières */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-700">💰 Finances</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Revenus Totaux</div>
            <div className="text-3xl font-bold">{formatCurrency(financeStats.total_entrees)}</div>
            <div className="text-xs opacity-75 mt-2">Toutes les réservations payées</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Revenus Aujourd'hui</div>
            <div className="text-3xl font-bold">{formatCurrency(financeStats.entrees_today)}</div>
            <div className="text-xs opacity-75 mt-2">Réservations du jour</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Revenus du Mois</div>
            <div className="text-3xl font-bold">{formatCurrency(financeStats.entrees_month)}</div>
            <div className="text-xs opacity-75 mt-2">Mois en cours</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Balance</div>
            <div className="text-3xl font-bold">{formatCurrency(financeStats.balance)}</div>
            <div className="text-xs opacity-75 mt-2">Entrées - Sorties</div>
          </div>
        </div>
      </div>

      {/* Revenus par période */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">📈 Aperçu des Revenus</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {formatCurrency(reservationStats.revenue_today)}
            </div>
            <div className="text-sm text-gray-600">Revenus Aujourd'hui</div>
            <div className="text-xs text-gray-500 mt-1">{reservationStats.today} réservations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {formatCurrency(reservationStats.revenue_total)}
            </div>
            <div className="text-sm text-gray-600">Revenus Totaux</div>
            <div className="text-xs text-gray-500 mt-1">{reservationStats.confirmed} confirmées</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {reservationStats.total > 0 
                ? formatCurrency(reservationStats.revenue_total / reservationStats.total)
                : formatCurrency(0)
              }
            </div>
            <div className="text-sm text-gray-600">Revenu Moyen</div>
            <div className="text-xs text-gray-500 mt-1">Par réservation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
