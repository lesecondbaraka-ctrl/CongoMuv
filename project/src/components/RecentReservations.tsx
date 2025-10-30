import React from 'react';
import { useReservations } from '../hooks/useReservations';

export const RecentReservations: React.FC = () => {
  const { reservations: apiReservations, loading, error } = useReservations();
  
  // Données de démonstration
  const demoReservations = [
    { id: 'res-1', user_id: 'user-1', trip_id: 'trip-1', seat_number: 'A12', status: 'confirmed', payment_status: 'paid', amount: 150000, created_at: new Date().toISOString(), user_name: 'Jean Kabongo', user_email: 'jean@example.cd' },
    { id: 'res-2', user_id: 'user-2', trip_id: 'trip-2', seat_number: 'B05', status: 'confirmed', payment_status: 'paid', amount: 35000, created_at: new Date(Date.now() - 3600000).toISOString(), user_name: 'Marie Lukeni', user_email: 'marie@example.cd' },
    { id: 'res-3', user_id: 'user-3', trip_id: 'trip-3', seat_number: 'C08', status: 'pending', payment_status: 'pending', amount: 120000, created_at: new Date(Date.now() - 7200000).toISOString(), user_name: 'Pierre Mbuyi', user_email: 'pierre@example.cd' },
    { id: 'res-4', user_id: 'user-4', trip_id: 'trip-1', seat_number: 'A15', status: 'confirmed', payment_status: 'paid', amount: 150000, created_at: new Date(Date.now() - 10800000).toISOString(), user_name: 'Sarah Nzuzi', user_email: 'sarah@example.cd' },
    { id: 'res-5', user_id: 'user-1', trip_id: 'trip-5', seat_number: 'D02', status: 'confirmed', payment_status: 'paid', amount: 25000, created_at: new Date(Date.now() - 14400000).toISOString(), user_name: 'Jean Kabongo', user_email: 'jean@example.cd' },
    { id: 'res-6', user_id: 'user-2', trip_id: 'trip-2', seat_number: 'B10', status: 'cancelled', payment_status: 'refunded', amount: 35000, created_at: new Date(Date.now() - 18000000).toISOString(), user_name: 'Marie Lukeni', user_email: 'marie@example.cd' },
    { id: 'res-7', user_id: 'user-3', trip_id: 'trip-3', seat_number: 'C12', status: 'confirmed', payment_status: 'paid', amount: 120000, created_at: new Date(Date.now() - 21600000).toISOString(), user_name: 'Pierre Mbuyi', user_email: 'pierre@example.cd' },
    { id: 'res-8', user_id: 'user-4', trip_id: 'trip-4', seat_number: 'A20', status: 'confirmed', payment_status: 'paid', amount: 40000, created_at: new Date(Date.now() - 86400000).toISOString(), user_name: 'Sarah Nzuzi', user_email: 'sarah@example.cd' },
    { id: 'res-9', user_id: 'user-1', trip_id: 'trip-5', seat_number: 'D05', status: 'pending', payment_status: 'pending', amount: 25000, created_at: new Date(Date.now() - 90000000).toISOString(), user_name: 'Jean Kabongo', user_email: 'jean@example.cd' },
    { id: 'res-10', user_id: 'user-2', trip_id: 'trip-1', seat_number: 'A18', status: 'confirmed', payment_status: 'paid', amount: 150000, created_at: new Date(Date.now() - 93600000).toISOString(), user_name: 'Marie Lukeni', user_email: 'marie@example.cd' }
  ];
  
  // Utiliser les données de démo si pas de données API
  const reservations = apiReservations.length > 0 ? apiReservations : demoReservations;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🎫 Réservations Récentes</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🎫 Réservations Récentes</h3>
        <div className="text-center py-8 text-red-600">
          <p>❌ {error}</p>
        </div>
      </div>
    );
  }

  const recentReservations = reservations.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">🎫 Réservations Récentes</h3>
        <p className="text-sm text-gray-600 mt-1">Les 10 dernières réservations</p>
      </div>
      
      {recentReservations.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>Aucune réservation pour le moment</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Siège</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Paiement</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Montant</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((reservation, index) => (
                <tr 
                  key={reservation.id} 
                  className={`border-b hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  <td className="py-3 px-4 text-sm font-mono text-gray-600">
                    {reservation.id.slice(0, 8)}...
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">
                    {reservation.seat_number || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status === 'confirmed' ? '✓ Confirmée' :
                       reservation.status === 'pending' ? '⏳ En attente' :
                       reservation.status === 'cancelled' ? '✕ Annulée' :
                       reservation.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      reservation.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      reservation.payment_status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.payment_status === 'paid' ? '💳 Payé' :
                       reservation.payment_status === 'pending' ? '⏳ En attente' :
                       reservation.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-sm">
                    {new Intl.NumberFormat('fr-CD', {
                      style: 'currency',
                      currency: 'CDF'
                    }).format(reservation.amount || 0)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {reservations.length > 10 && (
        <div className="p-4 border-t bg-gray-50 text-center">
          <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
            Voir toutes les réservations ({reservations.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentReservations;
