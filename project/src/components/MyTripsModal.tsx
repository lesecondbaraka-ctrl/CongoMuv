import { useState, useEffect } from 'react';
// Lightweight local icons (emoji)
const Icon = ({ children, className }: { children: string; className?: string }) => (
  <span className={className} aria-hidden>{children}</span>
);
const X = ({ className }: { className?: string }) => <Icon className={className}>✕</Icon>;
const Ticket = ({ className }: { className?: string }) => <Icon className={className}>🎟</Icon>;
const Calendar = ({ className }: { className?: string }) => <Icon className={className}>📅</Icon>;
const Users = ({ className }: { className?: string }) => <Icon className={className}>👥</Icon>;
const Clock = ({ className }: { className?: string }) => <Icon className={className}>⏱</Icon>;
import { Booking } from '../types';
import { DigitalTicketModal } from './DigitalTicketModal';
import { TripTrackingModal } from './TripTrackingModal';

interface MyTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyTripsModal({ isOpen, onClose }: MyTripsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  useEffect(() => {
    if (isOpen) {
      loadBookings();
    }
  }, [isOpen]);

  const loadBookings = async () => {
    try {
      // Charger les réservations depuis localStorage
      const localBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
      
      // Si pas de réservations locales, utiliser des données de démonstration par défaut
      if (localBookings.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const demoBookings: Booking[] = [
          {
            id: 'booking-demo-1',
            booking_reference: 'CM-2024-001',
            number_of_passengers: 2,
            total_amount: 300000,
            status: 'confirmed',
            trip: {
              id: 1,
              route_id: 1,
              departure_time: tomorrow.setHours(8, 0, 0, 0).toString(),
              arrival_time: new Date(tomorrow.getTime() + 6*60*60*1000).toString(),
              vehicle_number: 'TC-001',
              total_seats: 50,
              available_seats: 43,
              status: 'scheduled',
              route: {
                id: 1,
                operator_id: 1,
                transport_type_id: 1,
                departure_city: 'Kinshasa',
                arrival_city: 'Lubumbashi',
                distance_km: 1800,
                estimated_duration_minutes: 360,
                base_price: 150000,
                is_active: true,
                operator: { id: 1, name: 'TransCongo Express', type: 'transco', is_active: true }
              }
            }
          },
          {
            id: 'booking-demo-2',
            booking_reference: 'CM-2024-002',
            number_of_passengers: 1,
            total_amount: 35000,
            status: 'confirmed',
            trip: {
              id: 2,
              route_id: 2,
              departure_time: nextWeek.setHours(10, 30, 0, 0).toString(),
              arrival_time: new Date(nextWeek.getTime() + 5*60*60*1000).toString(),
              vehicle_number: 'KT-205',
              total_seats: 40,
              available_seats: 28,
              status: 'scheduled',
              route: {
                id: 2,
                operator_id: 2,
                transport_type_id: 2,
                departure_city: 'Kinshasa',
                arrival_city: 'Matadi',
                distance_km: 350,
                estimated_duration_minutes: 300,
                base_price: 35000,
                is_active: true,
                operator: { id: 2, name: 'Kinshasa Transport', type: 'transco', is_active: true }
              }
            }
          }
        ];

        // Simuler un délai de chargement
        setTimeout(() => {
          setBookings(demoBookings);
          setLoading(false);
        }, 800);
      } else {
        // Convertir les réservations locales au format attendu
        const convertedBookings: Booking[] = localBookings.map((booking: any) => ({
          id: booking.id,
          booking_reference: booking.reference,
          number_of_passengers: booking.number_of_passengers,
          total_amount: booking.total_amount,
          status: booking.status,
          trip: {
            id: booking.trip_id,
            route_id: booking.trip_id,
            departure_time: booking.trip.departure_time,
            arrival_time: booking.trip.arrival_time,
            vehicle_number: booking.trip.vehicle_number,
            total_seats: 50,
            available_seats: 45,
            status: 'scheduled',
            route: {
              id: booking.trip_id,
              operator_id: 'op-1',
              transport_type_id: 1,
              departure_city: booking.trip.departure_city,
              arrival_city: booking.trip.arrival_city,
              distance_km: 1000,
              estimated_duration_minutes: 360,
              base_price: booking.total_amount / booking.number_of_passengers,
              is_active: true,
              operator: { id: 1, name: booking.trip.operator_name || 'CongoMuv', type: 'transco', is_active: true }
            }
          }
        }));

        // Simuler un délai de chargement
        setTimeout(() => {
          setBookings(convertedBookings);
          setLoading(false);
        }, 500);
      }
      
    } catch (err) {
      console.error('Error loading bookings:', err);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Mes voyages</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Fermer mes voyages"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-slate-600 mt-4">Chargement...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Aucun voyage
              </h3>
              <p className="text-slate-600">
                Vous n'avez pas encore effectué de réservation
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-slate-200 rounded-xl p-4 hover:border-emerald-500 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">
                        {booking.trip?.route?.departure_city} → {booking.trip?.route?.arrival_city}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Réf: {booking.booking_reference}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedBookingId(String(booking.id));
                          setShowTicketModal(true);
                        }}
                        className="px-3 py-1 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        title="Voir le ticket numérique"
                      >
                        🎫 Ticket
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setSelectedBookingId(String(booking.id));
                          setShowTrackingModal(true);
                        }}
                        className="px-3 py-1 text-xs rounded-lg border border-slate-300 hover:bg-slate-50"
                        title="Suivre en temps réel"
                      >
                        📍 Suivre
                      </button>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Départ
                      </p>
                      <p className="font-semibold text-slate-900">
                        {booking.trip && new Date(booking.trip.departure_time).toLocaleDateString('fr-FR')}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Heure
                      </p>
                      <p className="font-semibold text-slate-900">
                        {booking.trip && new Date(booking.trip.departure_time).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600 mb-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        Passagers
                      </p>
                      <p className="font-semibold text-slate-900">
                        {booking.number_of_passengers}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-600 mb-1">Total</p>
                      <p className="font-bold text-emerald-600">
                        {booking.total_amount.toLocaleString('fr-FR')} FC
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showTicketModal && selectedBookingId && (
        <DigitalTicketModal
          bookingId={selectedBookingId}
          onClose={() => {
            setShowTicketModal(false);
            setSelectedBookingId('');
          }}
        />
      )}

      {showTrackingModal && selectedBookingId && (
        <TripTrackingModal
          bookingId={selectedBookingId}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedBookingId('');
          }}
        />
      )}
    </div>
  );
}
