// const sgMail = require('@sendgrid/mail');

/**
 * Service d'envoi d'emails avec SendGrid
 * Note: Décommenter et configurer SendGrid en production
 */
class EmailService {
  constructor() {
    // En production, activer SendGrid
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.isConfigured = false; // Mettre à true quand SendGrid est configuré
  }

  /**
   * Envoyer un ticket par email
   * @param {string} to - Email destinataire
   * @param {Object} ticketData - Données du ticket
   * @returns {Promise<boolean>} - Succès de l'envoi
   */
  async sendTicketEmail(to, ticketData) {
    try {
      if (!this.isConfigured) {
        console.log('📧 [SIMULATION] Envoi email ticket à:', to);
        console.log('Ticket:', ticketData.ticket_reference);
        // En mode développement, simuler l'envoi
        return true;
      }

      // En production, utiliser SendGrid
      /*
      const msg = {
        to: to,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@congomuv.com',
        subject: `Votre ticket CongoMuv - ${ticketData.ticket_reference}`,
        html: this.generateTicketEmailHTML(ticketData),
        attachments: [
          {
            content: ticketData.qr_code.split('base64,')[1],
            filename: 'ticket-qrcode.png',
            type: 'image/png',
            disposition: 'inline',
            content_id: 'qrcode'
          }
        ]
      };

      await sgMail.send(msg);
      console.log('✅ Email ticket envoyé à:', to);
      */
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      throw new Error('Impossible d\'envoyer l\'email');
    }
  }

  /**
   * Générer le HTML de l'email du ticket
   * @param {Object} ticketData - Données du ticket
   * @returns {string} - HTML de l'email
   */
  generateTicketEmailHTML(ticketData) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #059669, #14b8a6); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .qr-code { text-align: center; margin: 30px 0; }
    .ticket-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { color: #6b7280; font-size: 14px; }
    .info-value { font-weight: bold; color: #111827; }
    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🎫 Votre Ticket CongoMuv</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${ticketData.ticket_reference}</p>
    </div>
    
    <div class="content">
      <p>Bonjour <strong>${ticketData.passenger_name}</strong>,</p>
      <p>Votre réservation est confirmée ! Voici votre ticket numérique.</p>
      
      <div class="qr-code">
        <img src="cid:qrcode" alt="QR Code" style="width: 250px; height: 250px; border: 4px solid #059669; border-radius: 12px;"/>
        <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Présentez ce QR Code à l'embarquement</p>
      </div>
      
      <div class="ticket-info">
        <h3 style="margin-top: 0; color: #059669;">Détails du voyage</h3>
        
        <div class="info-row">
          <span class="info-label">Trajet</span>
          <span class="info-value">${ticketData.departure_city} → ${ticketData.arrival_city}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Date de départ</span>
          <span class="info-value">${new Date(ticketData.departure_time).toLocaleString('fr-FR')}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Référence réservation</span>
          <span class="info-value">${ticketData.booking_reference}</span>
        </div>
        
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Montant payé</span>
          <span class="info-value" style="color: #059669;">${ticketData.total_amount.toLocaleString()} FC</span>
        </div>
      </div>
      
      <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 15px; margin-top: 20px;">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          ℹ️ <strong>Important:</strong> Ce ticket est valable jusqu'au ${new Date(ticketData.expiration_date).toLocaleDateString('fr-FR')}. Merci de l'imprimer ou de le conserver sur votre téléphone.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>Merci de voyager avec CongoMuv</p>
      <p>Pour toute assistance: support@congomuv.com | +243 XXX XXX XXX</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

module.exports = new EmailService();
