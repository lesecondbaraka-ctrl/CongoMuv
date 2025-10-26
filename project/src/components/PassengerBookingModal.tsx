import { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, Calendar } from 'lucide-react';
import { Trip } from '../types';
import { PassengerInfo, PricingCalculation } from '../types/passenger';

interface PassengerBookingModalProps {
  trip: Trip;
  onClose: () => void;
  onSuccess: (bookingId: string, amount: number) => void;
}

export function PassengerBookingModal({ trip, onClose, onSuccess }: PassengerBookingModalProps) {
  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    {
      id: crypto.randomUUID(),
      fullName: '',
      age: 0,
      isChild: false,
      discountApplied: false
    }
  ]);
  
  const [pricing, setPricing] = useState<PricingCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const basePrice = trip.route?.base_price || 0;

  useEffect(() => {
    calculatePricing();
  }, [passengers, basePrice]);

  const calculatePricing = () => {
    const passengerPrices = passengers.map(passenger => {
      const isChild = passenger.age < 3;
      const discount = isChild ? 0.3 : 0; // 30% de réduction pour enfants < 3 ans
      const originalPrice = basePrice;
      const finalPrice = originalPrice * (1 - discount);

      return {
        passengerId: passenger.id,
        passengerName: passenger.fullName || 'Non renseigné',
        age: passenger.age,
        originalPrice,
        discount: discount * 100,
        finalPrice
      };
    });

    const totalDiscount = passengerPrices.reduce((sum, p) => sum + (p.originalPrice - p.finalPrice), 0);
    const totalAmount = passengerPrices.reduce((sum, p) => sum + p.finalPrice, 0);

    setPricing({
      basePrice,
      passengerPrices,
      totalDiscount,
      totalAmount
    });
  };

  const addPassenger = () => {
    setPassengers([
      ...passengers,
      {
        id: crypto.randomUUID(),
        fullName: '',
        age: 0,
        isChild: false,
        discountApplied: false
      }
    ]);
  };

  const removePassenger = (id: string) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id: string, field: keyof PassengerInfo, value: any) => {
    setPassengers(passengers.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        if (field === 'age') {
          updated.isChild = parseInt(value) < 3;
          updated.discountApplied = updated.isChild;
        }
        return updated;
      }
      return p;
    }));
  };

  const validateForm = () => {
    for (const passenger of passengers) {
      if (!passenger.fullName.trim()) {
        setError('Veuillez renseigner le nom de tous les passagers');
        return false;
      }
      if (passenger.age <= 0 || passenger.age > 120) {
        setError('Veuillez renseigner un âge valide pour tous les passagers');
        return false;
      }
    }

    if (passengers.length > trip.available_seats) {
      setError(`Ce trajet n'a que ${trip.available_seats} places disponibles`);
      return false;
    }

    setError('');
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
      const token = localStorage.getItem('app_jwt');

      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer une réservation');
      }

      // Créer la réservation
      const bookingResponse = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trip_id: trip.id,
          number_of_passengers: passengers.length,
          total_amount: pricing?.totalAmount || 0,
          passenger_details: passengers.map(p => ({
            full_name: p.fullName,
            age: p.age,
            is_child: p.isChild,
            discount_applied: p.discountApplied
          }))
        })
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la réservation');
      }

      const bookingData = await bookingResponse.json();
      const bookingId = bookingData.booking?.id || bookingData.id;

      // Passer au paiement
      onSuccess(bookingId, pricing?.totalAmount || 0);

    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Une erreur est survenue lors de la réservation');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Réservation de voyage</h2>
              <p className="text-emerald-50">
                {trip.route?.departure_city} → {trip.route?.arrival_city}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              title="Fermer"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <span className="text-red-600 flex-shrink-0 mt-0.5 text-lg">⚠️</span>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Trip Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Départ</p>
                <p className="font-semibold text-slate-900">
                  {new Date(trip.departure_time).toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Arrivée</p>
                <p className="font-semibold text-slate-900">
                  {new Date(trip.arrival_time).toLocaleString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Prix de base</p>
                <p className="font-semibold text-emerald-600">
                  {basePrice.toLocaleString()} FC
                </p>
              </div>
              <div>
                <p className="text-slate-600">Places disponibles</p>
                <p className="font-semibold text-slate-900">
                  {trip.available_seats} / {trip.total_seats}
                </p>
              </div>
            </div>
          </div>

          {/* Passengers Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Informations des passagers ({passengers.length})
              </h3>
              <button
                onClick={addPassenger}
                className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium transition"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter un passager</span>
              </button>
            </div>

            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div
                  key={passenger.id}
                  className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-emerald-100 text-emerald-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-semibold text-slate-900">
                        Passager {index + 1}
                      </span>
                      {passenger.isChild && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-semibold">
                          -30%
                        </span>
                      )}
                    </div>
                    {passengers.length > 1 && (
                      <button
                        onClick={() => removePassenger(passenger.id)}
                        aria-label="Supprimer ce passager"
                        title="Supprimer ce passager"
                        className="text-red-500 hover:text-red-700 transition p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={passenger.fullName}
                        onChange={(e) => updatePassenger(passenger.id, 'fullName', e.target.value)}
                        placeholder="Ex: Jean Kabongo"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Âge *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={passenger.age || ''}
                        onChange={(e) => updatePassenger(passenger.id, 'age', parseInt(e.target.value) || 0)}
                        placeholder="Ex: 25"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {passenger.isChild && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 font-medium">
                        🎉 Réduction enfant appliquée : -30% sur le prix de base
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary */}
          {pricing && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                <span className="mr-2 text-xl">💰</span>
                Récapitulatif des tarifs
              </h3>

              <div className="space-y-3 mb-4">
                {pricing.passengerPrices.map((pp, index) => (
                  <div key={pp.passengerId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600">
                        {pp.passengerName || `Passager ${index + 1}`}
                        {pp.age < 3 && ' (Enfant)'}
                      </span>
                      {pp.discount > 0 && (
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                          -{pp.discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {pp.discount > 0 && (
                        <span className="text-slate-400 line-through text-xs">
                          {pp.originalPrice.toLocaleString()} FC
                        </span>
                      )}
                      <span className="font-semibold text-slate-900">
                        {pp.finalPrice.toLocaleString()} FC
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {pricing.totalDiscount > 0 && (
                <div className="border-t border-slate-300 pt-3 mb-3">
                  <div className="flex items-center justify-between text-sm text-emerald-600 font-semibold">
                    <span>Économie totale</span>
                    <span>-{pricing.totalDiscount.toLocaleString()} FC</span>
                  </div>
                </div>
              )}

              <div className="border-t-2 border-slate-300 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">Total à payer</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {pricing.totalAmount.toLocaleString()} FC
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Réduction enfant :</strong> Les enfants de moins de 3 ans bénéficient d'une réduction de 30% sur le tarif de base.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleBooking}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span>
                  Réservation en cours...
                </span>
              ) : (
                `Confirmer la réservation (${pricing?.totalAmount.toLocaleString()} FC)`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
