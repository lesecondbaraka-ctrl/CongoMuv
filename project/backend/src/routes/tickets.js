const express = require('express');
const router = express.Router();
const qrcodeService = require('../services/qrcode.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

/**
 * POST /api/tickets/generate
 * Générer un ticket numérique avec QR Code
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { booking_id, send_email, send_sms, passenger_email, passenger_phone } = req.body;
    const userId = req.user.id;

    // Vérifier que la réservation appartient à l'utilisateur
    const bookingQuery = `
      SELECT b.*, 
        json_build_object(
          'id', t.id,
          'departure_time', t.departure_time,
          'arrival_time', t.arrival_time,
          'vehicle_number', t.vehicle_number,
          'route', json_build_object(
            'departure_city', r.departure_city,
            'arrival_city', r.arrival_city,
            'base_price', r.base_price
          )
        ) as trip
      FROM bookings b
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN routes r ON t.route_id = r.id
      WHERE b.id = $1 AND b.user_id = $2
    `;
    
    const bookingResult = await pool.query(bookingQuery, [booking_id, userId]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }
    
    const booking = bookingResult.rows[0];

    // Vérifier si un ticket existe déjà
    const existingTicketQuery = 'SELECT * FROM tickets WHERE booking_id = $1';
    const existingTicketResult = await pool.query(existingTicketQuery, [booking_id]);

    if (existingTicketResult.rows.length > 0) {
      return res.json({ ticket: existingTicketResult.rows[0], message: 'Ticket déjà généré' });
    }

    // Générer la référence du ticket
    const ticketReference = qrcodeService.generateTicketReference();

    // Préparer les données pour le QR Code
    const passengerName = booking.passenger_details[0]?.full_name || 'Passager';
    const qrData = qrcodeService.encodeTicketData({
      ticket_reference: ticketReference,
      booking_reference: booking.booking_reference,
      passenger_name: passengerName,
      departure_city: booking.trip.route.departure_city,
      arrival_city: booking.trip.route.arrival_city,
      departure_time: booking.trip.departure_time
    });

    // Générer le QR Code
    const qrCodeBase64 = await qrcodeService.generateQRCode(qrData);

    // Date d'expiration : 7 jours après la création
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    // Créer le ticket dans la base de données
    const insertTicketQuery = `
      INSERT INTO tickets (
        booking_id, ticket_reference, qr_code, expiration_date,
        passenger_email, passenger_phone, email_sent, sms_sent, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const ticketResult = await pool.query(insertTicketQuery, [
      booking_id,
      ticketReference,
      qrCodeBase64,
      expirationDate,
      passenger_email || null,
      passenger_phone || null,
      false,
      false,
      'active'
    ]);
    
    const ticket = ticketResult.rows[0];

    // Préparer les données complètes du ticket pour l'envoi
    const ticketData = {
      ...ticket,
      passenger_name: passengerName,
      departure_city: booking.trip.route.departure_city,
      arrival_city: booking.trip.route.arrival_city,
      departure_time: booking.trip.departure_time,
      booking_reference: booking.booking_reference,
      total_amount: booking.total_amount
    };

    // Envoyer par email si demandé
    if (send_email && passenger_email) {
      try {
        await emailService.sendTicketEmail(passenger_email, ticketData);
        await pool.query('UPDATE tickets SET email_sent = true WHERE id = $1', [ticket.id]);
        ticket.email_sent = true;
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
      }
    }

    // Envoyer par SMS si demandé
    if (send_sms && passenger_phone) {
      try {
        await smsService.sendTicketSMS(passenger_phone, ticketData);
        await pool.query('UPDATE tickets SET sms_sent = true WHERE id = $1', [ticket.id]);
        ticket.sms_sent = true;
      } catch (smsError) {
        console.error('Erreur envoi SMS:', smsError);
      }
    }

    res.json({
      ticket,
      message: 'Ticket généré avec succès'
    });

  } catch (error) {
    console.error('Erreur génération ticket:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

/**
 * GET /api/tickets/booking/:bookingId
 * Récupérer le ticket d'une réservation
 */
router.get('/booking/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Vérifier que la réservation appartient à l'utilisateur
    const bookingQuery = `
      SELECT b.*, 
        json_build_object(
          'id', t.id,
          'departure_time', t.departure_time,
          'route', json_build_object(
            'departure_city', r.departure_city,
            'arrival_city', r.arrival_city
          )
        ) as trip
      FROM bookings b
      LEFT JOIN trips t ON b.trip_id = t.id
      LEFT JOIN routes r ON t.route_id = r.id
      WHERE b.id = $1 AND b.user_id = $2
    `;
    
    const bookingResult = await pool.query(bookingQuery, [bookingId, userId]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }
    
    const booking = bookingResult.rows[0];

    // Récupérer le ticket
    const ticketQuery = 'SELECT * FROM tickets WHERE booking_id = $1';
    const ticketResult = await pool.query(ticketQuery, [bookingId]);

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket introuvable' });
    }
    
    const ticket = ticketResult.rows[0];

    // Retourner le ticket avec les infos de la réservation
    res.json({
      ticket: {
        ...ticket,
        booking: {
          booking_reference: booking.booking_reference,
          passenger_details: booking.passenger_details,
          total_amount: booking.total_amount,
          trip: {
            departure_city: booking.trip.route.departure_city,
            arrival_city: booking.trip.route.arrival_city,
            departure_time: booking.trip.departure_time
          }
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération ticket:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

/**
 * POST /api/tickets/:ticketId/resend-email
 * Renvoyer le ticket par email
 */
router.post('/:ticketId/resend-email', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    // Récupérer le ticket avec les infos de réservation
    const ticketQuery = `
      SELECT t.*, b.user_id, b.booking_reference, b.total_amount,
        json_build_object(
          'departure_time', tr.departure_time,
          'route', json_build_object(
            'departure_city', r.departure_city,
            'arrival_city', r.arrival_city
          )
        ) as trip
      FROM tickets t
      JOIN bookings b ON t.booking_id = b.id
      JOIN trips tr ON b.trip_id = tr.id
      JOIN routes r ON tr.route_id = r.id
      WHERE t.id = $1
    `;
    
    const ticketResult = await pool.query(ticketQuery, [ticketId]);
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket introuvable' });
    }
    
    const ticket = ticketResult.rows[0];

    // Vérifier l'appartenance
    if (ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    if (!ticket.passenger_email) {
      return res.status(400).json({ error: 'Aucun email enregistré' });
    }

    // Préparer les données
    const ticketData = {
      ...ticket,
      passenger_name: 'Passager',
      departure_city: ticket.trip.route.departure_city,
      arrival_city: ticket.trip.route.arrival_city,
      departure_time: ticket.trip.departure_time,
      booking_reference: ticket.booking_reference,
      total_amount: ticket.total_amount
    };

    // Envoyer l'email
    await emailService.sendTicketEmail(ticket.passenger_email, ticketData);

    res.json({ message: 'Email renvoyé avec succès' });

  } catch (error) {
    console.error('Erreur renvoi email:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

/**
 * POST /api/tickets/:ticketId/resend-sms
 * Renvoyer le ticket par SMS
 */
router.post('/:ticketId/resend-sms', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    // Récupérer le ticket avec les infos de réservation
    const ticketQuery = `
      SELECT t.*, b.user_id,
        json_build_object(
          'departure_time', tr.departure_time,
          'route', json_build_object(
            'departure_city', r.departure_city,
            'arrival_city', r.arrival_city
          )
        ) as trip
      FROM tickets t
      JOIN bookings b ON t.booking_id = b.id
      JOIN trips tr ON b.trip_id = tr.id
      JOIN routes r ON tr.route_id = r.id
      WHERE t.id = $1
    `;
    
    const ticketResult = await pool.query(ticketQuery, [ticketId]);
    
    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket introuvable' });
    }
    
    const ticket = ticketResult.rows[0];

    // Vérifier l'appartenance
    if (ticket.user_id !== userId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    if (!ticket.passenger_phone) {
      return res.status(400).json({ error: 'Aucun numéro enregistré' });
    }

    // Préparer les données
    const ticketData = {
      ...ticket,
      departure_city: ticket.trip.route.departure_city,
      arrival_city: ticket.trip.route.arrival_city,
      departure_time: ticket.trip.departure_time
    };

    // Envoyer le SMS
    await smsService.sendTicketSMS(ticket.passenger_phone, ticketData);

    res.json({ message: 'SMS renvoyé avec succès' });

  } catch (error) {
    console.error('Erreur renvoi SMS:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

module.exports = router;
