const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

/**
 * GET /api/tracking/:bookingId/location
 * Obtenir la position GPS du véhicule pour une réservation
 */
router.get('/:bookingId/location', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Vérifier que la réservation appartient à l'utilisateur
    const bookingQuery = `
      SELECT b.*, t.vehicle_id, t.arrival_time
      FROM bookings b
      JOIN trips t ON b.trip_id = t.id
      WHERE b.id = $1 AND b.user_id = $2
    `;
    
    const bookingResult = await pool.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }
    
    const booking = bookingResult.rows[0];

    if (!booking.vehicle_id) {
      return res.status(404).json({ error: 'Aucun véhicule assigné à ce trajet' });
    }

    // Récupérer la dernière position GPS du véhicule
    const trackingQuery = `
      SELECT * FROM vehicle_tracking
      WHERE vehicle_id = $1
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    
    const trackingResult = await pool.query(trackingQuery, [booking.vehicle_id]);

    if (trackingResult.rows.length === 0) {
      // Si pas de position GPS réelle, retourner une position simulée
      const simulatedLocation = {
        booking_id: bookingId,
        vehicle_id: booking.vehicle_id,
        location: {
          latitude: -4.3276, // Coordonnées exemple (Kinshasa)
          longitude: 15.3136,
          speed: 45,
          heading: 180
        },
        status: 'en_route',
        last_update: new Date().toISOString(),
        estimated_arrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() // +3h
      };

      return res.json(simulatedLocation);
    }
    
    const tracking = trackingResult.rows[0];

    // Retourner la position réelle
    res.json({
      booking_id: bookingId,
      vehicle_id: booking.vehicle_id,
      location: {
        latitude: parseFloat(tracking.latitude),
        longitude: parseFloat(tracking.longitude),
        speed: parseFloat(tracking.speed),
        heading: parseFloat(tracking.heading)
      },
      status: tracking.status,
      last_update: tracking.timestamp,
      estimated_arrival: calculateETA(booking, tracking)
    });

  } catch (error) {
    console.error('Erreur récupération position GPS:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

/**
 * POST /api/tracking/update
 * Mettre à jour la position GPS d'un véhicule
 * (Utilisé par les conducteurs/système de tracking)
 */
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const {
      vehicle_id,
      trip_id,
      latitude,
      longitude,
      speed,
      heading,
      status
    } = req.body;

    // Validation
    if (!vehicle_id || !latitude || !longitude) {
      return res.status(400).json({ error: 'Données GPS incomplètes' });
    }

    // Insérer la nouvelle position
    const insertQuery = `
      INSERT INTO vehicle_tracking (
        vehicle_id, trip_id, latitude, longitude, speed, heading, status, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const trackingResult = await pool.query(insertQuery, [
      vehicle_id,
      trip_id || null,
      latitude,
      longitude,
      speed || 0,
      heading || 0,
      status || 'en_route',
      new Date()
    ]);
    
    const tracking = trackingResult.rows[0];

    // Émettre via WebSocket (si implémenté)
    // wsServer.emit(`tracking:${trip_id}`, tracking);

    res.json({
      message: 'Position GPS mise à jour',
      tracking
    });

  } catch (error) {
    console.error('Erreur mise à jour GPS:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

/**
 * GET /api/tracking/history/:vehicleId
 * Récupérer l'historique GPS d'un véhicule
 */
router.get('/history/:vehicleId', authenticateToken, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { hours = 24 } = req.query;

    const since = new Date();
    since.setHours(since.getHours() - parseInt(hours));

    const historyQuery = `
      SELECT * FROM vehicle_tracking
      WHERE vehicle_id = $1 AND timestamp >= $2
      ORDER BY timestamp DESC
    `;
    
    const historyResult = await pool.query(historyQuery, [vehicleId, since]);
    const history = historyResult.rows;

    res.json({
      vehicle_id: vehicleId,
      period_hours: hours,
      count: history.length,
      history
    });

  } catch (error) {
    console.error('Erreur récupération historique GPS:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

/**
 * Calculer l'heure d'arrivée estimée
 * @param {Object} trip - Données du trajet
 * @param {Object} tracking - Données GPS actuelles
 * @returns {string} - ISO date string
 */
function calculateETA(trip, tracking) {
  // Logique simplifiée - en production, calculer basé sur:
  // - Distance restante
  // - Vitesse moyenne
  // - Conditions de trafic
  
  const arrivalTime = new Date(trip.arrival_time);
  const now = new Date();
  
  // Si déjà arrivé ou en retard
  if (tracking.status === 'arrived' || now > arrivalTime) {
    return arrivalTime.toISOString();
  }
  
  // Sinon retourner l'heure d'arrivée prévue
  return arrivalTime.toISOString();
}

module.exports = router;
