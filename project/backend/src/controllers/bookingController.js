const { query } = require('../config/database');
const { auditLogger } = require('../middleware/audit');
const { generateQRCode } = require('../utils/qrGenerator');
const { sendEmail } = require('../services/emailService');
const { sendSMS } = require('../services/smsService');

class BookingController {
  // Créer une nouvelle réservation
  static async createBooking(req, res) {
    const client = await query('BEGIN');

    try {
      const { trip_id, passengers, payment_method } = req.body;
      const user_id = req.user.id;

      // Validation des données
      if (!trip_id || !passengers || passengers.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Trip ID et passagers sont requis'
        });
      }

      // Vérifier la disponibilité des places
      const tripResult = await client.query(
        'SELECT total_seats, available_seats FROM trips WHERE id = $1 AND status = \'scheduled\'',
        [trip_id]
      );

      if (tripResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Trajet non trouvé ou non disponible'
        });
      }

      const trip = tripResult.rows[0];
      if (trip.available_seats < passengers.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Places insuffisantes pour cette réservation'
        });
      }

      // Calculer le prix total
      const routeResult = await client.query(
        'SELECT base_price FROM routes WHERE id = (SELECT route_id FROM trips WHERE id = $1)',
        [trip_id]
      );

      const basePrice = parseFloat(routeResult.rows[0].base_price);
      const totalAmount = passengers.reduce((total, passenger) => {
        let price = basePrice;
        if (parseInt(passenger.age) < 5) {
          price *= 0.5; // Réduction de 50% pour les enfants < 5 ans
        }
        return total + price;
      }, 0);

      // Générer un numéro de référence unique
      const bookingReference = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Créer la réservation
      const bookingResult = await client.query(
        `INSERT INTO bookings (user_id, trip_id, booking_reference, number_of_passengers, total_amount, payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [user_id, trip_id, bookingReference, passengers.length, totalAmount, payment_method]
      );

      const booking = bookingResult.rows[0];

      // Ajouter les passagers
      for (let i = 0; i < passengers.length; i++) {
        const passenger = passengers[i];
        await client.query(
          `INSERT INTO booking_passengers (booking_id, full_name, age, phone, id_card)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, passenger.full_name, passenger.age, passenger.phone, passenger.id_card]
        );
      }

      // Mettre à jour les places disponibles
      await client.query(
        'UPDATE trips SET available_seats = available_seats - $1 WHERE id = $2',
        [passengers.length, trip_id]
      );

      await client.query('COMMIT');

      // Générer le QR code
      const qrCodeData = {
        bookingId: booking.id,
        reference: bookingReference,
        tripId: trip_id,
        passengerCount: passengers.length,
        amount: totalAmount,
        departure: trip.departure_time,
        arrival: trip.arrival_time
      };

      const qrCode = await generateQRCode(JSON.stringify(qrCodeData));

      // Préparer l'email
      const emailData = {
        to: req.user.email,
        subject: `Confirmation de réservation - ${bookingReference}`,
        template: 'booking-confirmation',
        data: {
          bookingReference,
          passengerCount: passengers.length,
          totalAmount,
          qrCode,
          tripDetails: trip
        }
      };

      // Envoyer l'email en arrière-plan
      sendEmail(emailData).catch(console.error);

      // Envoyer le SMS de confirmation
      const smsMessage = `Réservation confirmée: ${bookingReference}. ${passengers.length} passagers. Montant: ${totalAmount} FC. Présentez ce code au départ.`;
      sendSMS(req.user.phone, smsMessage).catch(console.error);

      // Log d'audit
      await auditLogger(user_id, 'CREATE', 'bookings', booking.id, null, booking);

      res.status(201).json({
        success: true,
        data: {
          booking: {
            ...booking,
            passengers,
            qr_code: qrCode
          }
        },
        message: 'Réservation créée avec succès. Vous recevrez une confirmation par email et SMS.'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de la création de la réservation:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la création de la réservation'
      });
    }
  }

  // Récupérer les réservations d'un utilisateur
  static async getUserBookings(req, res) {
    try {
      const user_id = req.user.id;
      const { status, limit = 20, offset = 0 } = req.query;

      let queryText = `
        SELECT b.*, t.*, r.*, o.name as operator_name, tt.name as transport_type
        FROM bookings b
        JOIN trips t ON b.trip_id = t.id
        JOIN routes r ON t.route_id = r.id
        JOIN organizations o ON r.organization_id = o.id
        JOIN transport_types tt ON r.transport_type_id = tt.id
        WHERE b.user_id = $1
      `;

      const queryParams = [user_id];

      if (status) {
        queryText += ' AND b.status = $' + (queryParams.length + 1);
        queryParams.push(status);
      }

      queryText += ' ORDER BY b.created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
      queryParams.push(limit, offset);

      const result = await query(queryText, queryParams);

      // Récupérer les passagers pour chaque réservation
      const bookingsWithPassengers = await Promise.all(
        result.rows.map(async (booking) => {
          const passengersResult = await query(
            'SELECT * FROM booking_passengers WHERE booking_id = $1',
            [booking.id]
          );
          return {
            ...booking,
            passengers: passengersResult.rows
          };
        })
      );

      res.json({
        success: true,
        data: bookingsWithPassengers,
        count: bookingsWithPassengers.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des réservations'
      });
    }
  }

  // Annuler une réservation
  static async cancelBooking(req, res) {
    const client = await query('BEGIN');

    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Vérifier que la réservation appartient à l'utilisateur
      const bookingResult = await client.query(
        'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
        [id, user_id]
      );

      if (bookingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          error: 'Réservation non trouvée'
        });
      }

      const booking = bookingResult.rows[0];

      // Vérifier que l'annulation est possible (plus de 2h avant le départ)
      const tripResult = await client.query(
        'SELECT departure_time FROM trips WHERE id = $1',
        [booking.trip_id]
      );

      const departureTime = new Date(tripResult.rows[0].departure_time);
      const now = new Date();
      const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

      if (hoursUntilDeparture < 2) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: 'Impossible d\'annuler une réservation moins de 2 heures avant le départ'
        });
      }

      // Annuler la réservation
      await client.query(
        'UPDATE bookings SET status = \'cancelled\', updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );

      // Remettre les places à disposition
      await client.query(
        'UPDATE trips SET available_seats = available_seats + $1 WHERE id = $2',
        [booking.number_of_passengers, booking.trip_id]
      );

      await client.query('COMMIT');

      // Log d'audit
      await auditLogger(user_id, 'CANCEL', 'bookings', id, booking, { status: 'cancelled' });

      res.json({
        success: true,
        message: 'Réservation annulée avec succès'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erreur lors de l\'annulation de la réservation:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de l\'annulation de la réservation'
      });
    }
  }
}

module.exports = BookingController;
