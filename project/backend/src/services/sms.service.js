// const twilio = require('twilio');

/**
 * Service d'envoi de SMS avec Twilio
 * Note: Décommenter et configurer Twilio en production
 */
class SMSService {
  constructor() {
    // En production, activer Twilio
    /*
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    */
    this.isConfigured = false; // Mettre à true quand Twilio est configuré
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+243XXXXXXXXX';
  }

  /**
   * Envoyer un SMS avec le lien du ticket
   * @param {string} to - Numéro de téléphone
   * @param {Object} ticketData - Données du ticket
   * @returns {Promise<boolean>} - Succès de l'envoi
   */
  async sendTicketSMS(to, ticketData) {
    try {
      if (!this.isConfigured) {
        console.log('📱 [SIMULATION] Envoi SMS ticket à:', to);
        console.log('Message:', this.generateTicketSMSMessage(ticketData));
        // En mode développement, simuler l'envoi
        return true;
      }

      // En production, utiliser Twilio
      /*
      const message = await this.client.messages.create({
        body: this.generateTicketSMSMessage(ticketData),
        from: this.twilioPhoneNumber,
        to: to
      });

      console.log('✅ SMS ticket envoyé à:', to, '| SID:', message.sid);
      */
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi SMS:', error);
      throw new Error('Impossible d\'envoyer le SMS');
    }
  }

  /**
   * Générer le message SMS du ticket
   * @param {Object} ticketData - Données du ticket
   * @returns {string} - Message SMS
   */
  generateTicketSMSMessage(ticketData) {
    const expirationDate = new Date(ticketData.expiration_date).toLocaleDateString('fr-FR');
    
    return `🎫 CongoMuv - Ticket confirmé!

Référence: ${ticketData.ticket_reference}
Trajet: ${ticketData.departure_city} → ${ticketData.arrival_city}
Départ: ${new Date(ticketData.departure_time).toLocaleDateString('fr-FR')}

Consultez votre email pour le QR Code ou téléchargez-le sur:
https://congomuv.com/ticket/${ticketData.id}

Expire le: ${expirationDate}

Bon voyage! 🚂`;
  }

  /**
   * Envoyer un SMS de notification
   * @param {string} to - Numéro de téléphone
   * @param {string} message - Message à envoyer
   * @returns {Promise<boolean>} - Succès de l'envoi
   */
  async sendNotificationSMS(to, message) {
    try {
      if (!this.isConfigured) {
        console.log('📱 [SIMULATION] Envoi SMS notification à:', to);
        console.log('Message:', message);
        return true;
      }

      /*
      const result = await this.client.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: to
      });

      console.log('✅ SMS notification envoyé | SID:', result.sid);
      */
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi SMS notification:', error);
      throw new Error('Impossible d\'envoyer le SMS');
    }
  }
}

module.exports = new SMSService();
