import { useState } from 'react';
import { X, User, Phone, Calendar, Plus, Trash2, CreditCard } from 'lucide-react';
import { Trip } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  onSuccess: () => void;
}

interface Passenger {
  fullName: string;
  age: string;
  phone: string;
  idCard: string;
}

export function BookingModal({ isOpen, onClose, trip, onSuccess }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'passengers' | 'payment'>('passengers');

  const [passengers, setPassengers] = useState<Passenger[]>([{
    fullName: '',
    age: '',
    phone: '',
    idCard: ''
  }]);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen || !trip) return null;

  const addPassenger = () => {
    setPassengers([...passengers, { fullName: '', age: '', phone: '', idCard: '' }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_: Passenger, i: number) => i !== index));
    }
  };

  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const calculateTotal = () => {
    const basePrice = trip.route?.base_price || 0;
    return passengers.reduce((total: number, passenger: Passenger) => {
      const age = parseInt(passenger.age) || 0;
      const price = age < 5 ? basePrice * 0.5 : basePrice;
      return total + price;
    }, 0);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('app_jwt');
      if (!token) throw new Error('Non authentifié');

      const passengerCount = Math.max(1, passengers.length);
      const resp = await fetch(((import.meta as any).env?.VITE_API_URL || 'http://localhost:3002') + '/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ trip_id: trip.id, passenger_count: passengerCount })
      });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'Erreur lors de la réservation');

      try {
        const payResp = await fetch(((import.meta as any).env?.VITE_API_URL || 'http://localhost:3002') + '/api/payments/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            amount: calculateTotal(),
            method: paymentMethod || 'Paiement en Agence',
            phone: phoneNumber || undefined,
            trip_id: trip.id,
            booking_id: json?.booking?.id || json?.booking?.id
          })
        });
        await payResp.json().catch(() => ({}));
      } catch {}

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Nouvelle réservation</h2>
            <p className="text-sm text-slate-600">
              {trip.route?.departure_city} → {trip.route?.arrival_city}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
            aria-label="Fermer la fenêtre de réservation"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {step === 'passengers' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Informations des passagers
                </h3>
                <button
                  onClick={addPassenger}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>

              {passengers.map((passenger, index) => (
                <div key={index} className="border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900">Passager {index + 1}</h4>
                    {passengers.length > 1 && (
                      <button
                        onClick={() => removePassenger(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        aria-label={`Supprimer le passager ${index + 1}`}
                        title={`Supprimer le passager ${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Nom complet
                      </label>
                      <input
                        type="text"
                        required
                        value={passenger.fullName}
                        onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        placeholder="Jean Mukendi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Âge
                      </label>
                      <input
                        type="number"
                        required
                        value={passenger.age}
                        onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        placeholder="25"
                        min="0"
                        max="120"
                      />
                      {parseInt(passenger.age) < 5 && passenger.age !== '' && (
                        <p className="text-xs text-blue-700 mt-1">
                          Réduction 50% appliquée
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        placeholder="+243 821 938 773"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Carte d'identité
                      </label>
                      <input
                        type="text"
                        value={passenger.idCard}
                        onChange={(e) => updatePassenger(index, 'idCard', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        placeholder="Numéro d'identité"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {calculateTotal().toLocaleString('fr-FR')} FC
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {passengers.length} passager{passengers.length > 1 ? 's' : ''}
                </p>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg"
              >
                Continuer vers le paiement
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">
                <CreditCard className="w-5 h-5 inline mr-2" />
                Méthode de paiement
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {['Airtel Money', 'Orange Money', 'Vodacom M-Pesa', 'Paiement en Agence'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 border-2 rounded-xl text-left transition ${
                      paymentMethod === method
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">{method}</div>
                  </button>
                ))}
              </div>

              {paymentMethod && paymentMethod !== 'Paiement en Agence' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="+243 821 938 773"
                  />
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center justify-between text-lg mb-4">
                  <span className="font-semibold text-slate-900">Montant à payer</span>
                  <span className="text-2xl font-bold text-blue-700">
                    {calculateTotal().toLocaleString('fr-FR')} FC
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('passengers')}
                  className="flex-1 border-2 border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !paymentMethod}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Confirmer et payer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
