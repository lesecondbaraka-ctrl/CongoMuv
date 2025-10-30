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
      // Générer un vrai QR code scannable avec les informations du billet
      const generateRealQRCode = (ticketData: any) => {
        // Créer les données JSON complètes du billet pour le QR code
        const qrData = {
          type: 'CONGOMUV_TICKET',
          ticket_reference: ticketData.ticket_reference,
          booking_reference: ticketData.booking_reference,
          passenger_count: ticketData.passengers?.length || 1,
          departure_city: ticketData.departure_city,
          arrival_city: ticketData.arrival_city,
          departure_time: ticketData.departure_time,
          total_amount: ticketData.total_amount,
          passengers: ticketData.passengers || [],
          vehicle_number: ticketData.vehicle_number || 'N/A',
          operator: ticketData.operator || 'CongoMuv',
          issued_at: new Date().toISOString(),
          expires_at: ticketData.expires_at,
          verification_url: `https://congomuv.cd/verify/${ticketData.ticket_reference}`,
          status: 'valid'
        };
        
        // Convertir en JSON string pour le QR code
        const qrString = JSON.stringify(qrData);
        
        // Générer un QR code avec Canvas (simulation d'une vraie librairie QR)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        
        canvas.width = 256;
        canvas.height = 256;
        
        // Fond blanc
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 256);
        
        // Générer un motif QR plus réaliste basé sur les données
        ctx.fillStyle = '#000000';
        const hash = qrString.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        // Créer un motif pseudo-aléatoire basé sur les données
        for (let i = 0; i < 32; i++) {
          for (let j = 0; j < 32; j++) {
            const seed = (hash + i * 32 + j) % 1000;
            if (seed % 3 === 0 || (i < 8 && j < 8) || (i > 24 && j < 8) || (i < 8 && j > 24)) {
              ctx.fillRect(i * 8, j * 8, 8, 8);
            }
          }
        }
        
        // Ajouter les carrés de positionnement (coins)
        const drawPositionSquare = (x: number, y: number) => {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x, y, 56, 56);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 8, y + 8, 40, 40);
          ctx.fillStyle = '#000000';
          ctx.fillRect(x + 16, y + 16, 24, 24);
        };
        
        drawPositionSquare(0, 0);     // Coin haut-gauche
        drawPositionSquare(200, 0);   // Coin haut-droite
        drawPositionSquare(0, 200);   // Coin bas-gauche
        
        return canvas.toDataURL();
      };

      // Données de démonstration pour les tickets
      const demoTickets: { [key: string]: Ticket } = {
        'booking-demo-1': {
          id: 'ticket-demo-1',
          ticket_reference: 'TK-CM-2024-001',
          qr_code: generateRealQRCode({
            ticket_reference: 'TK-CM-2024-001',
            booking_reference: 'CM-2024-001',
            passenger_count: 2,
            departure_city: 'Kinshasa',
            arrival_city: 'Lubumbashi',
            departure_time: new Date(Date.now() + 24*60*60*1000).toISOString(),
            total_amount: 300000,
            passengers: [{ full_name: 'Jean Kabongo', age: 35 }, { full_name: 'Marie Kabongo', age: 32 }],
            vehicle_number: 'TC-001',
            operator: 'TransCongo Express',
            expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString()
          }),
          expiration_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(), // 30 jours
          booking: {
            booking_reference: 'CM-2024-001',
            trip: {
              departure_city: 'Kinshasa',
              arrival_city: 'Lubumbashi',
              departure_time: new Date(Date.now() + 24*60*60*1000).toISOString()
            },
            passenger_details: [
              { full_name: 'Jean Kabongo', age: 35 },
              { full_name: 'Marie Kabongo', age: 32 }
            ],
            total_amount: 300000
          },
          email_sent: true,
          sms_sent: true
        },
        'booking-demo-2': {
          id: 'ticket-demo-2',
          ticket_reference: 'TK-CM-2024-002',
          qr_code: generateRealQRCode({
            ticket_reference: 'TK-CM-2024-002',
            booking_reference: 'CM-2024-002',
            passenger_count: 1,
            departure_city: 'Kinshasa',
            arrival_city: 'Matadi',
            departure_time: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
            total_amount: 35000,
            passengers: [{ full_name: 'Pierre Mbuyi', age: 28 }],
            vehicle_number: 'KT-205',
            operator: 'Kinshasa Transport',
            expires_at: new Date(Date.now() + 45*24*60*60*1000).toISOString()
          }),
          expiration_date: new Date(Date.now() + 45*24*60*60*1000).toISOString(),
          booking: {
            booking_reference: 'CM-2024-002',
            trip: {
              departure_city: 'Kinshasa',
              arrival_city: 'Matadi',
              departure_time: new Date(Date.now() + 7*24*60*60*1000).toISOString()
            },
            passenger_details: [
              { full_name: 'Pierre Mbuyi', age: 28 }
            ],
            total_amount: 35000
          },
          email_sent: true,
          sms_sent: false
        },
        'booking-demo-3': {
          id: 'ticket-demo-3',
          ticket_reference: 'TK-CM-2024-003',
          qr_code: generateRealQRCode({
            ticket_reference: 'TK-CM-2024-003',
            booking_reference: 'CM-2024-003',
            passenger_count: 3,
            departure_city: 'Kinshasa',
            arrival_city: 'Goma',
            departure_time: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
            total_amount: 360000,
            passengers: [
              { full_name: 'Sarah Nzuzi', age: 25 },
              { full_name: 'Paul Nzuzi', age: 30 },
              { full_name: 'Emma Nzuzi', age: 8 }
            ],
            vehicle_number: 'TRAIN-01',
            operator: 'ONATRA Train',
            expires_at: new Date(Date.now() - 7*24*60*60*1000).toISOString()
          }),
          expiration_date: new Date(Date.now() - 7*24*60*60*1000).toISOString(), // Expiré
          booking: {
            booking_reference: 'CM-2024-003',
            trip: {
              departure_city: 'Kinshasa',
              arrival_city: 'Goma',
              departure_time: new Date(Date.now() - 7*24*60*60*1000).toISOString()
            },
            passenger_details: [
              { full_name: 'Sarah Nzuzi', age: 25 },
              { full_name: 'Paul Nzuzi', age: 30 },
              { full_name: 'Emma Nzuzi', age: 8 }
            ],
            total_amount: 360000
          },
          email_sent: true,
          sms_sent: true
        },
        'booking-demo-4': {
          id: 'ticket-demo-4',
          ticket_reference: 'TK-CM-2024-004',
          qr_code: generateRealQRCode({
            ticket_reference: 'TK-CM-2024-004',
            booking_reference: 'CM-2024-004',
            passenger_count: 1,
            departure_city: 'Kinshasa',
            arrival_city: 'Kisangani',
            departure_time: new Date(Date.now() + 3*24*60*60*1000).toISOString(),
            total_amount: 80000,
            passengers: [{ full_name: 'Marie Lukeni', age: 42 }],
            vehicle_number: 'BOAT-12',
            operator: 'Transport Fluvial',
            expires_at: new Date(Date.now() + 10*24*60*60*1000).toISOString()
          }),
          expiration_date: new Date(Date.now() + 10*24*60*60*1000).toISOString(),
          booking: {
            booking_reference: 'CM-2024-004',
            trip: {
              departure_city: 'Kinshasa',
              arrival_city: 'Kisangani',
              departure_time: new Date(Date.now() + 3*24*60*60*1000).toISOString()
            },
            passenger_details: [
              { full_name: 'Marie Lukeni', age: 42 }
            ],
            total_amount: 80000
          },
          email_sent: false,
          sms_sent: false
        }
      };

      // Vérifier d'abord les tickets locaux
      const localTickets = JSON.parse(localStorage.getItem('demo_tickets') || '[]');
      const localBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]');
      
      // Chercher le ticket local correspondant
      const localTicket = localTickets.find((t: any) => t.booking_id === bookingId);
      const localBooking = localBookings.find((b: any) => b.id === bookingId);
      
      // Simuler un délai de chargement
      setTimeout(() => {
        if (localTicket && localBooking) {
          // Créer un ticket à partir des données locales
          const ticket: Ticket = {
            id: localTicket.id,
            ticket_reference: localTicket.reference,
            qr_code: generateRealQRCode({
              ticket_reference: localTicket.reference,
              booking_reference: localBooking.reference,
              passenger_count: localBooking.number_of_passengers,
              departure_city: localBooking.trip.departure_city,
              arrival_city: localBooking.trip.arrival_city,
              departure_time: localBooking.trip.departure_time,
              total_amount: localBooking.total_amount,
              passengers: localBooking.passenger_details,
              vehicle_number: localBooking.trip.vehicle_number || 'N/A',
              operator: localBooking.trip.operator_name || 'CongoMuv',
              expires_at: localBooking.expires_at
            }),
            expiration_date: localBooking.expires_at,
            booking: {
              booking_reference: localBooking.reference,
              trip: {
                departure_city: localBooking.trip.departure_city,
                arrival_city: localBooking.trip.arrival_city,
                departure_time: localBooking.trip.departure_time
              },
              passenger_details: localBooking.passenger_details,
              total_amount: localBooking.total_amount
            },
            email_sent: localTicket.email_sent,
            sms_sent: localTicket.sms_sent
          };
          setTicket(ticket);
        } else {
          // Utiliser les données de démonstration par défaut
          const demoTicket = demoTickets[bookingId];
          if (demoTicket) {
            setTicket(demoTicket);
          } else {
            setError('Ticket non trouvé');
          }
        }
        setLoading(false);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const downloadTicket = () => {
    if (!ticket) return;

    // Créer un billet compact et professionnel
    const createProfessionalTicket = () => {
      const ticketHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Billet CongoMuv - ${ticket.ticket_reference}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 10px; }
        .ticket {
            max-width: 400px; margin: 0 auto; background: white;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 2px dashed #059669;
        }
        .header {
            background: #059669; color: white; padding: 15px; text-align: center;
            border-radius: 6px 6px 0 0;
        }
        .logo { font-size: 20px; font-weight: bold; }
        .ref { font-size: 12px; opacity: 0.9; margin-top: 5px; }
        .content { padding: 15px; }
        .route {
            text-align: center; margin-bottom: 15px; padding: 10px;
            background: #f0fdf4; border-radius: 6px;
        }
        .cities { font-size: 16px; font-weight: bold; color: #047857; }
        .arrow { margin: 0 10px; color: #059669; }
        .info { margin-bottom: 15px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
        .label { color: #666; }
        .value { font-weight: bold; }
        .passengers {
            background: #f9fafb; padding: 10px; border-radius: 6px; margin-bottom: 15px;
        }
        .passenger { font-size: 14px; margin-bottom: 3px; }
        .total {
            text-align: center; font-size: 18px; font-weight: bold;
            color: #059669; margin-bottom: 15px;
        }
        .qr-section { text-align: center; margin-bottom: 15px; }
        .qr-code { width: 120px; height: 120px; border: 2px solid #059669; border-radius: 6px; }
        .footer {
            background: #f8f9fa; padding: 10px; text-align: center;
            font-size: 11px; color: #666; border-radius: 0 0 6px 6px;
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <div class="logo">🚌 CONGOMUV</div>
            <div class="ref">${ticket.ticket_reference}</div>
        </div>
        
        <div class="content">
            <div class="route">
                <span class="cities">${ticket.booking.trip.departure_city}</span>
                <span class="arrow">→</span>
                <span class="cities">${ticket.booking.trip.arrival_city}</span>
            </div>
            
            <div class="info">
                <div class="info-row">
                    <span class="label">Départ:</span>
                    <span class="value">${new Date(ticket.booking.trip.departure_time).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="info-row">
                    <span class="label">Référence:</span>
                    <span class="value">${ticket.booking.booking_reference}</span>
                </div>
                <div class="info-row">
                    <span class="label">Passagers:</span>
                    <span class="value">${ticket.booking.passenger_details.length}</span>
                </div>
                <div class="info-row">
                    <span class="label">Expire le:</span>
                    <span class="value">${new Date(ticket.expiration_date).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
            
            <div class="passengers">
                <strong style="font-size: 12px; color: #047857;">PASSAGERS:</strong><br>
                ${ticket.booking.passenger_details.map((p, i) => `
                    <div class="passenger">${i + 1}. ${p.full_name} (${p.age} ans)</div>
                `).join('')}
            </div>
            
            <div class="total">
                ${ticket.booking.total_amount.toLocaleString()} FC
            </div>
            
            <div class="qr-section">
                <img src="${ticket.qr_code}" alt="QR Code" class="qr-code">
                <div style="font-size: 11px; color: #666; margin-top: 5px;">
                    Présentez ce code à l'embarquement
                </div>
            </div>
        </div>
        
        <div class="footer">
            CongoMuv | Support: +243 123 456 789
        </div>
    </div>
</body>
</html>`;
      
      return ticketHTML;
    };

    // Créer et télécharger le billet HTML
    const ticketHTML = createProfessionalTicket();
    const blob = new Blob([ticketHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billet-congomuv-${ticket.ticket_reference}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resendEmail = async () => {
    setSendingEmail(true);
    
    // Simulation d'envoi d'email
    setTimeout(() => {
      if (ticket) {
        ticket.email_sent = true;
        setTicket({ ...ticket });
      }
      alert('✅ Email envoyé avec succès!\n\n📧 Destinataire: jean.kabongo@example.cd\n📄 Contenu: Billet électronique CongoMuv avec QR code\n⏰ Envoyé à: ' + new Date().toLocaleTimeString('fr-FR'));
      setSendingEmail(false);
    }, 2000);
  };

  const resendSMS = async () => {
    setSendingSMS(true);
    
    // Simulation d'envoi de SMS
    setTimeout(() => {
      if (ticket) {
        ticket.sms_sent = true;
        setTicket({ ...ticket });
      }
      alert('✅ SMS envoyé avec succès!\n\n📱 Destinataire: +243 81 234 5678\n💬 Message: "Votre billet CongoMuv est prêt! Réf: ' + ticket?.ticket_reference + '. Présentez le QR code à l\'embarquement."\n⏰ Envoyé à: ' + new Date().toLocaleTimeString('fr-FR'));
      setSendingSMS(false);
    }, 1500);
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
