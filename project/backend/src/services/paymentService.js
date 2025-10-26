const Flutterwave = require('flutterwave-node-v3');
const { query } = require('../config/database');
const { auditLogger } = require('../middleware/audit');

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

class PaymentService {
  // Initialiser un paiement Flutterwave
  static async initiatePayment(bookingId, amount, currency = 'XOF', customerInfo) {
    try {
      const paymentData = {
        tx_ref: `tx-${Date.now()}-${bookingId}`,
        amount: amount,
        currency: currency,
        redirect_url: `${process.env.FRONTEND_URL}/payment/callback`,
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: customerInfo.email,
          phone_number: customerInfo.phone,
          name: customerInfo.full_name
        },
        customizations: {
          title: 'CongoMuv - Paiement de réservation',
          description: `Paiement pour réservation ${bookingId}`,
          logo: 'https://congomuv.cd/logo.png'
        }
      };

      const response = await flw.Payment.init(paymentData);

      if (response.status === 'success') {
        // Sauvegarder la transaction en attente
        await query(
          `INSERT INTO payments (booking_id, amount, currency, payment_method, payment_provider, transaction_id, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [bookingId, amount, currency, 'flutterwave', 'flutterwave', response.data.id, 'pending']
        );

        return {
          success: true,
          payment_url: response.data.link,
          transaction_id: response.data.id
        };
      }

      throw new Error('Échec de l\'initialisation du paiement');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement Flutterwave:', error);
      throw error;
    }
  }

  // Initialiser un paiement Mobile Money (Airtel Money, Orange Money, etc.)
  static async initiateMobileMoneyPayment(bookingId, amount, phone, provider) {
    try {
      // Simulation de l'API Mobile Money (à remplacer par l'API réelle)
      const transactionRef = `mm-${Date.now()}-${bookingId}`;

      // Sauvegarder la transaction
      await query(
        `INSERT INTO payments (booking_id, amount, currency, payment_method, payment_provider, transaction_id, status, payment_data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [bookingId, amount, 'XOF', 'mobile_money', provider, transactionRef, 'pending',
         JSON.stringify({ phone, provider })]
      );

      // Simulation d'envoi de requête USSD/SMS
      // Dans un vrai environnement, intégrer l'API du provider (Airtel, Orange, Vodacom)

      return {
        success: true,
        message: `Demande de paiement envoyée à ${phone}`,
        transaction_ref: transactionRef,
        instructions: `Vous allez recevoir une demande de paiement sur votre téléphone. Confirmez le paiement de ${amount} FC.`
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du paiement Mobile Money:', error);
      throw error;
    }
  }

  // Vérifier le statut d'un paiement
  static async verifyPayment(transactionId) {
    try {
      const response = await flw.Payment.verify({ id: transactionId });

      if (response.status === 'successful') {
        // Mettre à jour le statut du paiement
        await query(
          'UPDATE payments SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE transaction_id = $2',
          ['completed', transactionId]
        );

        // Récupérer la réservation associée
        const paymentResult = await query(
          'SELECT booking_id FROM payments WHERE transaction_id = $1',
          [transactionId]
        );

        if (paymentResult.rows.length > 0) {
          const bookingId = paymentResult.rows[0].booking_id;

          // Mettre à jour la réservation
          await query(
            'UPDATE bookings SET payment_status = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
            ['paid', 'confirmed', bookingId]
          );

          // Log d'audit
          await auditLogger(null, 'PAYMENT_COMPLETED', 'payments', transactionId, null, response);

          return {
            success: true,
            status: 'completed',
            booking_id: bookingId
          };
        }
      }

      return {
        success: false,
        status: response.status,
        message: 'Paiement en attente ou échoué'
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      throw error;
    }
  }

  // Remboursement d'un paiement
  static async refundPayment(transactionId, amount = null) {
    try {
      const paymentResult = await query(
        'SELECT * FROM payments WHERE transaction_id = $1',
        [transactionId]
      );

      if (paymentResult.rows.length === 0) {
        throw new Error('Paiement non trouvé');
      }

      const payment = paymentResult.rows[0];

      if (payment.payment_provider === 'flutterwave') {
        // Remboursement Flutterwave
        const refundData = {
          id: transactionId,
          amount: amount || payment.amount
        };

        const response = await flw.Payment.refund(refundData);

        if (response.status === 'success') {
          // Mettre à jour le statut du paiement
          await query(
            'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE transaction_id = $2',
            ['refunded', transactionId]
          );

          // Mettre à jour la réservation
          await query(
            'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['refunded', payment.booking_id]
          );

          return {
            success: true,
            refund_id: response.data.id,
            message: 'Remboursement effectué avec succès'
          };
        }
      }

      throw new Error('Méthode de remboursement non supportée');
    } catch (error) {
      console.error('Erreur lors du remboursement:', error);
      throw error;
    }
  }

  // Webhook pour recevoir les notifications de paiement
  static async handleWebhook(payload) {
    try {
      const { event, data } = payload;

      switch (event) {
        case 'charge.completed':
          await this.verifyPayment(data.id);
          break;

        case 'charge.failed':
          await query(
            'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE transaction_id = $2',
            ['failed', data.id]
          );
          break;

        default:
          console.log('Événement webhook non géré:', event);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;
