const QRCode = require('qrcode');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function generateTicketPDF({ booking, trip, route, user }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header
  page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: rgb(0.09, 0.57, 0.45) });
  page.drawText('CongoMuv E-Ticket', { x: 40, y: height - 60, size: 24, font, color: rgb(1, 1, 1) });

  // Body
  const textColor = rgb(0.12, 0.14, 0.18);
  let y = height - 160;
  const line = (label, value) => {
    page.drawText(label + ':', { x: 40, y, size: 12, font, color: textColor });
    page.drawText(String(value || '-'), { x: 180, y, size: 12, font, color: textColor });
    y -= 22;
  };

  line('Réservation', booking.id);
  line('Passager', user?.full_name || user?.email);
  line('Email', user?.email);
  line('Opérateur', route?.operator_name || route?.name || '');
  line('Trajet', `${route?.departure_city || ''} → ${route?.arrival_city || ''}`);
  line('Départ', new Date(trip?.departure_datetime || booking?.created_at).toLocaleString('fr-FR'));
  if (trip?.arrival_datetime) line('Arrivée', new Date(trip.arrival_datetime).toLocaleString('fr-FR'));
  line('Places', booking.passenger_count || 1);
  line('Montant (FC)', booking.total_price || '');
  line('Statut', booking.status || 'pending');

  // QR code with booking reference
  const qrPayload = JSON.stringify({ booking_id: booking.id, trip_id: booking.trip_id, email: user?.email });
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { errorCorrectionLevel: 'M', margin: 1, width: 256 });
  const qrBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrBytes);
  const qrDim = 160;
  page.drawImage(qrImage, { x: width - qrDim - 40, y: height - qrDim - 180, width: qrDim, height: qrDim });

  // Footer
  page.drawText('Merci de voyager avec CongoMuv. Présentez ce billet (QR) à l’embarquement.', { x: 40, y: 40, size: 10, font, color: textColor });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generateTicketPDF };
