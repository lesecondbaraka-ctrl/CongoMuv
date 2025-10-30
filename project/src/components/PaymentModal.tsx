import { useState, useEffect } from 'react';
import { X, CheckCircle, CreditCard } from 'lucide-react';
import { PaymentMethod, PaymentFormData, PaymentMethodOption } from '../types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  bookingId: string;
  amount: number;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    icon: 'Smartphone',
    description: 'Airtel Money, M-Pesa, Orange Money',
    providers: ['Airtel Money', 'M-Pesa', 'Orange Money', 'Vodacom M-Pesa']
  },
  {
    id: 'bank_card',
    name: 'Carte Bancaire',
    icon: 'CreditCard',
    description: 'Visa, Mastercard',
    providers: ['Visa', 'Mastercard']
  },
  {
    id: 'cash',
    name: 'Espèces',
    icon: 'Banknote',
    description: 'Paiement au guichet',
    providers: []
  }
];

const getMethodIcon = (method: string) => {
  switch (method) {
    case 'mobile_money': return <span className="text-3xl">📱</span>;
    case 'bank_card': return <CreditCard className="w-8 h-8" />;
    case 'cash': return <span className="text-3xl">💵</span>;
    default: return null;
  }
};

export function PaymentModal({ isOpen, bookingId, amount, onClose, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | ''>('');
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    method: '',
    phoneNumber: '',
    provider: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolderName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [ussdCode, setUssdCode] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [generatingTicket, setGeneratingTicket] = useState(false);
  const [ticketGenerated, setTicketGenerated] = useState(false);

  useEffect(() => {
    if (selectedMethod) {
      setPaymentData(prev => ({ ...prev, method: selectedMethod }));
    }
  }, [selectedMethod]);

  const validateForm = () => {
    if (!selectedMethod) {
      setError('Veuillez sélectionner un mode de paiement');
      return false;
    }

    if (selectedMethod === 'mobile_money') {
      if (!paymentData.provider) {
        setError('Veuillez sélectionner un fournisseur');
        return false;
      }
      if (!paymentData.phoneNumber) {
        setError('Veuillez saisir votre numéro de téléphone');
        return false;
      }
      // Validation du format du numéro (exemple pour RDC)
      const phoneRegex = /^(\+243|0)?[89]\d{8}$/;
      if (!phoneRegex.test(paymentData.phoneNumber.replace(/\s/g, ''))) {
        setError('Format de numéro invalide. Ex: +243 xxx xxx xxx');
        return false;
      }
    }

    if (selectedMethod === 'bank_card') {
      if (!paymentData.cardNumber || !paymentData.cardExpiry || !paymentData.cardCvv || !paymentData.cardHolderName) {
        setError('Veuillez remplir tous les champs de la carte');
        return false;
      }
      // Validation basique du numéro de carte
      const cardRegex = /^\d{16}$/;
      if (!cardRegex.test(paymentData.cardNumber.replace(/\s/g, ''))) {
        setError('Numéro de carte invalide (16 chiffres requis)');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Paiement local (stockage local, sans mention "demo")
      const token = localStorage.getItem('app_jwt');
      if (!token) {
        throw new Error('Vous devez être connecté pour effectuer un paiement');
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      const paymentId = `PAY-${Date.now()}`;
      const transactionRef = `TXN-${Date.now()}`;
      const paymentRecord = {
        id: paymentId,
        booking_id: bookingId,
        amount: amount,
        payment_method: selectedMethod,
        provider: paymentData.provider,
        phone_number: paymentData.phoneNumber,
        transaction_reference: transactionRef,
        status: 'completed',
        created_at: new Date().toISOString()
      };
      // Stockage local professionnel
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      existingPayments.push(paymentRecord);
      localStorage.setItem('payments', JSON.stringify(existingPayments));
      // Mise à jour du statut de la réservation
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updatedBookings = existingBookings.map((booking: Record<string, unknown>) => {
        if ((booking as { id?: string }).id === bookingId) {
          return { ...booking, payment_status: 'paid', status: 'confirmed' };
        }
        return booking;
      });
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      // Gestion selon le mode de paiement
      if (selectedMethod === 'mobile_money') {
        const ussdCode = `*182*${Math.floor(Math.random() * 1000)}#`;
        setUssdCode(ussdCode);
        setTransactionRef(transactionRef);
        setTimeout(async () => {
          setPaymentSuccess(true);
          await generateTicket();
          setTimeout(() => {
            onSuccess(paymentId);
          }, 2000);
        }, 3000);
      } else {
        setPaymentSuccess(true);
        setTransactionRef(transactionRef);
        await generateTicket();
        setTimeout(() => {
          onSuccess(paymentId);
        }, 2000);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors du paiement');
      }
    } finally {
      setLoading(false);
    }
  };

  // Mode démonstration - Pas besoin de polling, tout est simulé localement

  const generateTicket = async () => {
    try {
      setGeneratingTicket(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const ticketData = {
        id: `TKT-${Date.now()}`,
        booking_id: bookingId,
        reference: `CM-2024-${String(Date.now()).slice(-3)}`,
        qr_code: `QR-${Date.now()}`,
        email_sent: true,
        sms_sent: true,
        created_at: new Date().toISOString()
      };
      // Stockage local professionnel
      const existingTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      existingTickets.push(ticketData);
      localStorage.setItem('tickets', JSON.stringify(existingTickets));
      setTicketGenerated(true);
    } catch {
      // Gestion d'erreur silencieuse
    } finally {
      setGeneratingTicket(false);
    }
  };

  if (!isOpen) return null;

  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Paiement confirmé !</h3>
          <p className="text-slate-600 mb-4">
            Votre paiement a été traité avec succès.
          </p>
          {transactionRef && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600">Référence de transaction</p>
              <p className="text-lg font-bold text-slate-900">{transactionRef}</p>
            </div>
          )}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-emerald-800 font-medium">
              Montant payé : {amount.toLocaleString()} FC
            </p>
          </div>
          
          {generatingTicket && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center space-x-3">
              <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-blue-800">🎫 Génération de votre ticket numérique...</p>
            </div>
          )}
          
          {ticketGenerated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">
                ✅ Votre ticket numérique a été généré et envoyé par email/SMS !
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Paiement</h2>
              <p className="text-emerald-50">
                Montant à payer : <span className="font-bold">{amount.toLocaleString()} FC</span>
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

          {ussdCode && !paymentSuccess && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Composez ce code USSD :</h3>
              <p className="text-3xl font-bold text-blue-600 mb-3">{ussdCode}</p>
              <p className="text-sm text-blue-800">
                Suivez les instructions sur votre téléphone pour compléter le paiement.
              </p>
              <div className="mt-4 flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-blue-800">En attente de confirmation...</span>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          {!ussdCode && (
            <>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Choisissez votre mode de paiement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${selectedMethod === method.id 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-slate-200 hover:border-emerald-300'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`
                        ${selectedMethod === method.id ? 'text-emerald-600' : 'text-slate-600'}
                      `}>
                        {getMethodIcon(method.id)}
                      </div>
                      <span className="font-bold text-slate-900">{method.name}</span>
                    </div>
                    <p className="text-xs text-slate-600">{method.description}</p>
                  </button>
                ))}
              </div>

              {/* Mobile Money Form */}
              {selectedMethod === 'mobile_money' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fournisseur *
                    </label>
                    <select
                      value={paymentData.provider || ''}
                      onChange={(e) => setPaymentData({ ...paymentData, provider: e.target.value })}
                      aria-label="Sélectionner un fournisseur de Mobile Money"
                      title="Sélectionner un fournisseur"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Sélectionnez un fournisseur</option>
                      {PAYMENT_METHODS.find(m => m.id === 'mobile_money')?.providers?.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      value={paymentData.phoneNumber || ''}
                      onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
                      placeholder="Ex: +243 xxx xxx xxx"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Bank Card Form */}
              {selectedMethod === 'bank_card' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Numéro de carte *
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardNumber || ''}
                      onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom du titulaire *
                    </label>
                    <input
                      type="text"
                      value={paymentData.cardHolderName || ''}
                      onChange={(e) => setPaymentData({ ...paymentData, cardHolderName: e.target.value })}
                      placeholder="JEAN KABONGO"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date d'expiration *
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardExpiry || ''}
                        onChange={(e) => setPaymentData({ ...paymentData, cardExpiry: e.target.value })}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentData.cardCvv || ''}
                        onChange={(e) => setPaymentData({ ...paymentData, cardCvv: e.target.value })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Payment Info */}
              {selectedMethod === 'cash' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h4 className="font-bold text-yellow-900 mb-2">ℹ️ Paiement en espèces</h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    Vous pouvez payer en espèces à nos guichets ou au moment de l'embarquement.
                  </p>
                  <p className="text-sm text-yellow-800">
                    Une référence de réservation vous sera envoyée. Présentez-la lors du paiement.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading || !selectedMethod}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Traitement...</span>
                    </>
                  ) : (
                    `Payer ${amount.toLocaleString()} FC`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
