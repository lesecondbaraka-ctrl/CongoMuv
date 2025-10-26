const QRCode = require('qrcode');

/**
 * Service de génération de QR Codes
 */
class QRCodeService {
  /**
   * Générer un QR Code en base64
   * @param {string} data - Données à encoder
   * @returns {Promise<string>} - QR Code en base64
   */
  async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Erreur génération QR Code:', error);
      throw new Error('Impossible de générer le QR Code');
    }
  }

  /**
   * Générer un ID de ticket unique
   * @returns {string} - ID format TKT-XXXXXXXXX
   */
  generateTicketReference() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random.toString().padStart(3, '0')}`;
  }

  /**
   * Encoder les données du ticket pour le QR Code
   * @param {Object} ticketData - Données du ticket
   * @returns {string} - JSON stringifié
   */
  encodeTicketData(ticketData) {
    return JSON.stringify({
      ref: ticketData.ticket_reference,
      booking: ticketData.booking_reference,
      passenger: ticketData.passenger_name,
      trip: `${ticketData.departure_city} → ${ticketData.arrival_city}`,
      date: ticketData.departure_time,
      verified: true
    });
  }
}

module.exports = new QRCodeService();
