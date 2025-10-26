import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface Booking {
  id: string;
  booking_reference: string;
  passenger_name: string;
  trip: {
    departure_city: string;
    arrival_city: string;
    departure_time: string;
  };
  number_of_passengers: number;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
}

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // TODO: Appel API
      // Données simulées
      setBookings([
        {
          id: '1',
          booking_reference: 'BKG-123456',
          passenger_name: 'Jean Mukendi',
          trip: {
            departure_city: 'Kinshasa',
            arrival_city: 'Lubumbashi',
            departure_time: '2025-01-28T08:00:00'
          },
          number_of_passengers: 2,
          total_amount: 100000,
          payment_status: 'paid',
          status: 'confirmed',
          created_at: '2025-01-20T10:30:00'
        },
        {
          id: '2',
          booking_reference: 'BKG-123457',
          passenger_name: 'Marie Kabila',
          trip: {
            departure_city: 'Matadi',
            arrival_city: 'Kinshasa',
            departure_time: '2025-01-28T10:00:00'
          },
          number_of_passengers: 1,
          total_amount: 35000,
          payment_status: 'pending',
          status: 'pending',
          created_at: '2025-01-25T14:15:00'
        }
      ]);
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (bookingId: string) => {
    if (!confirm('Valider ce paiement ?')) return;
    try {
      // TODO: Appel API
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, payment_status: 'paid', status: 'confirmed' } : b
      ));
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Annuler cette réservation ?')) return;
    try {
      // TODO: Appel API
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gestion des Réservations</h2>
        <p className="text-sm text-slate-600">Liste des passagers et validation des paiements</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'confirmed', 'pending', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Toutes' : f === 'confirmed' ? 'Confirmées' : f === 'pending' ? 'En attente' : 'Annulées'}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Passager</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Trajet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Passagers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {booking.booking_reference}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{booking.passenger_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {booking.trip.departure_city} → {booking.trip.arrival_city}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {booking.number_of_passengers}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {booking.total_amount.toLocaleString('fr-FR')} FC
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status === 'confirmed' ? 'Confirmée' : booking.status === 'pending' ? 'En attente' : 'Annulée'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {booking.payment_status === 'pending' && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleValidate(booking.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Valider le paiement"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Annuler"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
