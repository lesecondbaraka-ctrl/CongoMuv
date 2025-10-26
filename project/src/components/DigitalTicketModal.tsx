import { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle } from 'lucide-react';

interface DigitalTicketModalProps {
  bookingId: string;
  onClose: () => void;
}

interface Ticket {
  id: string;
  ticket_reference: string;
  qr_code: string;
  expiration_date: string;
  booking: {
    booking_reference: string;
    trip: {
      departure_city: string;
      arrival_city: string;
      departure_time: string;
    };
    passenger_details: Array<{
      full_name: string;
      age: number;
    }>;
    total_amount: number;
  };
  email_sent: boolean;
  sms_sent: boolean;
}

export function DigitalTicketModal({ bookingId, onClose }: DigitalTicketModalProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [bookingId]);

  const loadTicket = async () => {
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
      const token = localStorage.getItem('app_jwt');

      const response = await fetch(`${API_BASE}/api/tickets/booking/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Impossible de charger le ticket');

      const data = await response.json();
      setTicket(data.ticket);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = () => {
    if (!ticket) return;

    const element = document.getElementById('ticket-content');
    if (!element) return;

    // Create a simple download (in production, use jspdf + html2canvas)
    const ticketText = `
TICKET CONGOMUV
${ticket.ticket_reference}

${ticket.booking.trip.departure_city} → ${ticket.booking.trip.arrival_city}
Départ: ${new Date(ticket.booking.trip.departure_time).toLocaleString('fr-FR')}

Passagers:
${ticket.booking.passenger_details.map((p, i) => `${i + 1}. ${p.full_name} (${p.age} ans)`).join('\n')}

Total: ${ticket.booking.total_amount.toLocaleString()} FC
Référence: ${ticket.booking.booking_reference}
Expire le: ${new Date(ticket.expiration_date).toLocaleDateString('fr-FR')}
    `;

    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${ticket.ticket_reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resendEmail = async () => {
    setSendingEmail(true);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
      const token = localStorage.getItem('app_jwt');

      await fetch(`${API_BASE}/api/tickets/${ticket?.id}/resend-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert('✅ Email envoyé avec succès!');
    } catch (err) {
      alert('❌ Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  const resendSMS = async () => {
    setSendingSMS(true);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
      const token = localStorage.getItem('app_jwt');

      await fetch(`${API_BASE}/api/tickets/${ticket?.id}/resend-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert('✅ SMS envoyé avec succès!');
    } catch (err) {
      alert('❌ Erreur lors de l\'envoi du SMS');
    } finally {
      setSendingSMS(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement du ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <p className="text-red-600 mb-4">❌ {error || 'Ticket introuvable'}</p>
          <button onClick={onClose} className="w-full px-4 py-2 bg-slate-200 rounded-lg">
            Fermer
          </button>
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
            <div className="flex items-center space-x-3">
              <QrCode className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Ticket Numérique</h2>
                <p className="text-emerald-50 text-sm">{ticket.ticket_reference}</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Fermer" title="Fermer" className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div id="ticket-content" className="p-6">
          {/* QR Code */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 border-4 border-emerald-500 rounded-2xl shadow-lg">
              {ticket.qr_code ? (
                <img src={ticket.qr_code} alt="QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-slate-400" />
                </div>
              )}
            </div>
          </div>

          {/* Ticket Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-slate-600">Référence réservation</p>
                <p className="font-bold text-slate-900">{ticket.booking.booking_reference}</p>
              </div>
              <div>
                <p className="text-slate-600">Expire le</p>
                <p className="font-semibold text-red-600">
                  {new Date(ticket.expiration_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mb-4">
              <p className="text-slate-600 text-sm mb-2">Trajet</p>
              <p className="text-lg font-bold text-slate-900">
                {ticket.booking.trip.departure_city} → {ticket.booking.trip.arrival_city}
              </p>
              <p className="text-slate-600 text-sm mt-1">
                Départ : {new Date(ticket.booking.trip.departure_time).toLocaleString('fr-FR')}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-slate-600 text-sm mb-2">Passagers</p>
              {ticket.booking.passenger_details.map((passenger, index) => (
                <div key={index} className="flex items-center space-x-2 mb-1">
                  <span className="bg-emerald-100 text-emerald-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-slate-900 font-medium">
                    {passenger.full_name} ({passenger.age} ans)
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total payé</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {ticket.booking.total_amount.toLocaleString()} FC
                </span>
              </div>
            </div>
          </div>

          {/* Send Status */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`border rounded-lg p-3 ${ticket.email_sent ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-2">
                {ticket.email_sent ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <span className="text-lg text-slate-400">📧</span>
                )}
                <span className="text-sm font-medium text-slate-900">Email</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {ticket.email_sent ? 'Envoyé ✓' : 'Non envoyé'}
              </p>
            </div>

            <div className={`border rounded-lg p-3 ${ticket.sms_sent ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center space-x-2">
                {ticket.sms_sent ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <span className="text-lg text-slate-400">💬</span>
                )}
                <span className="text-sm font-medium text-slate-900">SMS</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {ticket.sms_sent ? 'Envoyé ✓' : 'Non envoyé'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={downloadTicket}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <span className="text-lg">📥</span>
              <span className="text-sm font-medium">Télécharger</span>
            </button>

            <button
              onClick={resendEmail}
              disabled={sendingEmail}
              className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
            >
              <span className="text-lg">📧</span>
              <span className="text-sm font-medium">
                {sendingEmail ? '...' : 'Email'}
              </span>
            </button>

            <button
              onClick={resendSMS}
              disabled={sendingSMS}
              className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium">
                {sendingSMS ? '...' : 'SMS'}
              </span>
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Présentez ce QR Code</strong> au moment de l'embarquement. Le ticket est valable jusqu'à la date d'expiration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
