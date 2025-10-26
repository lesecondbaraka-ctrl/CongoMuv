const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { supabase } = require('../config/database');

/**
 * POST /api/payments/initiate
 * Initialiser un paiement pour une réservation
 */
router.post('/initiate', verifyJWT, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const { 
      booking_id, 
      amount, 
      payment_method, 
      provider, 
      phone_number,
      card_number,
      card_expiry,
      card_holder_name
    } = req.body;

    // Validation
    if (!booking_id || !amount || !payment_method) {
      return res.status(400).json({ 
        error: 'booking_id, amount et payment_method sont requis' 
      });
    }

    // Vérifier que la réservation appartient à l'utilisateur
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, user_id, total_amount, status')
      .eq('id', booking_id)
      .eq('user_id', userId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cette réservation a été annulée' });
    }

    // Vérifier s'il y a déjà un paiement complété pour cette réservation
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('booking_id', booking_id)
      .eq('status', 'completed')
      .single();

    if (existingPayment) {
      return res.status(400).json({ 
        error: 'Un paiement a déjà été effectué pour cette réservation' 
      });
    }

    // Générer une référence de transaction unique
    const transaction_reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Créer l'enregistrement de paiement
    const paymentData = {
      booking_id: booking_id,
      amount: amount,
      payment_method: payment_method,
      provider: provider || null,
      phone_number: phone_number || null,
      status: 'pending',
      transaction_reference: transaction_reference,
      created_at: new Date().toISOString()
    };

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return res.status(500).json({ error: 'Erreur lors de la création du paiement' });
    }

    // Générer le code USSD pour Mobile Money
    let ussd_code = null;
    if (payment_method === 'mobile_money' && phone_number) {
      // Code USSD simulé selon le fournisseur
      const ussdCodes = {
        'Airtel Money': '*182*7*1#',
        'M-Pesa': '*542#',
        'Orange Money': '#144#',
        'Vodacom M-Pesa': '*501#'
      };
      ussd_code = ussdCodes[provider] || '*000#';
    }

    // Pour les paiements en espèces ou par carte, marquer comme complété immédiatement (simulation)
    if (payment_method === 'cash' || payment_method === 'bank_card') {
      const { error: updateError } = await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (!updateError) {
        // Mettre à jour le statut de la réservation
        await supabase
          .from('bookings')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', booking_id);
      }
    }

    // Préparer la réponse
    const response = {
      payment_id: payment.id,
      status: payment_method === 'cash' || payment_method === 'bank_card' ? 'completed' : 'pending',
      transaction_reference: transaction_reference,
      message: payment_method === 'mobile_money' 
        ? `Composez le code USSD ${ussd_code} pour compléter le paiement`
        : payment_method === 'cash'
        ? 'Réservation confirmée. Veuillez payer au guichet ou à l\'embarquement.'
        : 'Paiement effectué avec succès',
      ussd_code: ussd_code
    };

    return res.json(response);

  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'initialisation du paiement' });
  }
});

/**
 * GET /api/payments/:payment_id/status
 * Vérifier le statut d'un paiement
 */
router.get('/:payment_id/status', verifyJWT, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.user_id;
    const { payment_id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Récupérer le paiement avec la réservation associée
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings!inner(
          id,
          user_id
        )
      `)
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    // Vérifier que le paiement appartient à l'utilisateur
    if (payment.booking.user_id !== userId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Simuler la vérification du statut Mobile Money (en production, appeler l'API du fournisseur)
    let currentStatus = payment.status;
    if (payment.payment_method === 'mobile_money' && payment.status === 'pending') {
      // Simuler un succès aléatoire après 30 secondes (pour la démo)
      const paymentAge = Date.now() - new Date(payment.created_at).getTime();
      if (paymentAge > 30000 && Math.random() > 0.3) { // 70% de chance de succès
        currentStatus = 'completed';
        
        // Mettre à jour le paiement
        await supabase
          .from('payments')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', payment_id);

        // Mettre à jour la réservation
        await supabase
          .from('bookings')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', payment.booking_id);
      }
    }

    const response = {
      payment_id: payment.id,
      status: currentStatus,
      transaction_reference: payment.transaction_reference,
      amount: payment.amount,
      completed_at: payment.completed_at,
      message: currentStatus === 'completed' 
        ? 'Paiement effectué avec succès'
        : currentStatus === 'failed'
        ? 'Le paiement a échoué'
        : 'Paiement en attente'
    };

    return res.json(response);

  } catch (error) {
    console.error('Payment status check error:', error);
    return res.status(500).json({ error: 'Erreur lors de la vérification du statut' });
  }
});

/**
 * GET /api/payments/booking/:booking_id
 * Récupérer les paiements d'une réservation
 */
router.get('/booking/:booking_id', verifyJWT, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.user_id;
    const { booking_id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Vérifier que la réservation appartient à l'utilisateur
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, user_id')
      .eq('id', booking_id)
      .eq('user_id', userId)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Récupérer les paiements
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', booking_id)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
    }

    return res.json({ payments: payments || [] });

  } catch (error) {
    console.error('Fetch payments error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des paiements' });
  }
});

module.exports = router;
