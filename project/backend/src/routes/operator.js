/**
 * Routes API pour le Module Opérateur
 * Gestion complète des trajets, réservations, conducteurs, GPS et rapports
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Middleware pour vérifier le rôle OPERATOR ou ADMIN
const requireOperator = (req, res, next) => {
  if (!['OPERATOR', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès refusé - Opérateur requis' });
  }
  next();
};

// ====================
// DASHBOARD STATS
// ====================

// GET /api/operator/stats - Statistiques dashboard
router.get('/stats', authenticateToken, requireOperator, async (req, res) => {
  try {
    const organizationId = req.user.organization_id;

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM trips WHERE organization_id = $1) as total_trips,
        (SELECT COUNT(*) FROM trips WHERE organization_id = $1 AND status = 'in_progress') as active_trips,
        (SELECT COUNT(*) FROM bookings b 
         JOIN trips t ON t.id = b.trip_id 
         WHERE t.organization_id = $1) as total_bookings,
        (SELECT COALESCE(SUM(p.amount), 0) FROM payments p 
         JOIN bookings b ON b.id = p.booking_id
         JOIN trips t ON t.id = b.trip_id
         WHERE t.organization_id = $1 AND p.status = 'completed') as revenue
    `;

    const result = await pool.query(query, [organizationId]);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        totalTrips: parseInt(stats.total_trips) || 0,
        activeTrips: parseInt(stats.active_trips) || 0,
        totalBookings: parseInt(stats.total_bookings) || 0,
        revenue: parseFloat(stats.revenue) || 0,
        averageOccupancy: 78, // TODO: Calcul réel
        onTimeRate: 85 // TODO: Calcul réel
      }
    });
  } catch (error) {
    console.error('Erreur stats opérateur:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// GESTION DES TRAJETS
// ====================

// GET /api/operator/trips - Liste des trajets de l'opérateur
router.get('/trips', authenticateToken, requireOperator, async (req, res) => {
  try {
    const organizationId = req.user.organization_id;

    const query = `
      SELECT 
        t.id,
        t.route_id,
        r.departure_city,
        r.arrival_city,
        t.departure_datetime as departure_time,
        t.arrival_datetime as arrival_time,
        t.vehicle_number,
        t.available_seats,
        t.total_seats,
        t.status
      FROM trips t
      JOIN routes r ON r.id = t.route_id
      WHERE t.organization_id = $1
      ORDER BY t.departure_datetime DESC
      LIMIT 100
    `;

    const result = await pool.query(query, [organizationId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        route: {
          departure_city: row.departure_city,
          arrival_city: row.arrival_city
        },
        departure_time: row.departure_time,
        arrival_time: row.arrival_time,
        vehicle_number: row.vehicle_number,
        total_seats: row.total_seats,
        available_seats: row.available_seats,
        status: row.status
      }))
    });
  } catch (error) {
    console.error('Erreur liste trajets:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/operator/trips - Créer un nouveau trajet - SIMPLIFIÉ
router.post('/trips', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== POST /api/operator/trips ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const { route_id, departure_datetime, arrival_datetime, vehicle_number, total_seats } = req.body;
    const organizationId = req.user.organization_id || null;

    console.log('✅ Insertion dans trips...');
    const query = `
      INSERT INTO trips (
        route_id, organization_id, departure_datetime, arrival_datetime,
        vehicle_number, total_seats, available_seats, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      route_id,
      organizationId,
      departure_datetime,
      arrival_datetime,
      vehicle_number,
      total_seats,
      total_seats, // available_seats = total_seats au début
      'scheduled'
    ]);

    console.log('✅ Voyage créé:', result.rows[0]);
    res.json({
      success: true,
      message: 'Trajet créé avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur création trajet:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// PUT /api/operator/trips/:id - Modifier un trajet
router.put('/trips/:id', authenticateToken, requireOperator, async (req, res) => {
  try {
    const { id } = req.params;
    const { departure_datetime, arrival_datetime, vehicle_number, total_seats, status } = req.body;
    const organizationId = req.user.organization_id;

    const query = `
      UPDATE trips
      SET 
        departure_datetime = COALESCE($1, departure_datetime),
        arrival_datetime = COALESCE($2, arrival_datetime),
        vehicle_number = COALESCE($3, vehicle_number),
        total_seats = COALESCE($4, total_seats),
        status = COALESCE($5, status)
      WHERE id = $6 AND organization_id = $7
      RETURNING *
    `;

    const result = await pool.query(query, [
      departure_datetime,
      arrival_datetime,
      vehicle_number,
      total_seats,
      status,
      id,
      organizationId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }

    res.json({
      success: true,
      message: 'Trajet mis à jour',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur modification trajet:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE /api/operator/trips/:id - Supprimer un trajet
router.delete('/trips/:id', authenticateToken, requireOperator, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization_id;

    // Vérifier s'il y a des réservations
    const bookingsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE trip_id = $1',
      [id]
    );

    if (parseInt(bookingsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer - Des réservations existent pour ce trajet' 
      });
    }

    const query = 'DELETE FROM trips WHERE id = $1 AND organization_id = $2 RETURNING id';
    const result = await pool.query(query, [id, organizationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }

    res.json({
      success: true,
      message: 'Trajet supprimé'
    });
  } catch (error) {
    console.error('Erreur suppression trajet:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// GESTION DES RÉSERVATIONS
// ====================

// GET /api/operator/bookings - Liste des réservations
router.get('/bookings', authenticateToken, requireOperator, async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    const organizationId = req.user.organization_id;

    let statusFilter = '';
    if (filter === 'confirmed') {
      statusFilter = "AND b.status = 'confirmed'";
    } else if (filter === 'pending') {
      statusFilter = "AND b.status = 'pending'";
    } else if (filter === 'cancelled') {
      statusFilter = "AND b.status = 'cancelled'";
    }

    const query = `
      SELECT 
        b.id,
        b.booking_reference,
        b.passenger_name,
        b.passenger_email,
        b.number_of_passengers,
        b.total_amount,
        b.status,
        b.created_at,
        r.departure_city,
        r.arrival_city,
        t.departure_datetime,
        p.status as payment_status
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      JOIN routes r ON r.id = t.route_id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE t.organization_id = $1 ${statusFilter}
      ORDER BY b.created_at DESC
      LIMIT 100
    `;

    const result = await pool.query(query, [organizationId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        booking_reference: row.booking_reference,
        passenger_name: row.passenger_name,
        trip: {
          departure_city: row.departure_city,
          arrival_city: row.arrival_city,
          departure_time: row.departure_datetime
        },
        number_of_passengers: row.number_of_passengers,
        total_amount: parseFloat(row.total_amount),
        payment_status: row.payment_status || 'pending',
        status: row.status,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    console.error('Erreur liste réservations:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// PUT /api/operator/bookings/:id/validate-payment - Valider un paiement
router.put('/bookings/:id/validate-payment', authenticateToken, requireOperator, async (req, res) => {
  try {
    const { id } = req.params;

    // Mettre à jour le paiement et la réservation
    const updatePayment = await pool.query(
      "UPDATE payments SET status = 'completed' WHERE booking_id = $1 RETURNING id",
      [id]
    );

    const updateBooking = await pool.query(
      "UPDATE bookings SET status = 'confirmed' WHERE id = $1 RETURNING *",
      [id]
    );

    if (updateBooking.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    res.json({
      success: true,
      message: 'Paiement validé',
      data: updateBooking.rows[0]
    });
  } catch (error) {
    console.error('Erreur validation paiement:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// PUT /api/operator/bookings/:id/cancel - Annuler une réservation
router.put('/bookings/:id/cancel', authenticateToken, requireOperator, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Libérer les places
    await pool.query(
      'UPDATE trips SET available_seats = available_seats + $1 WHERE id = $2',
      [result.rows[0].number_of_passengers, result.rows[0].trip_id]
    );

    res.json({
      success: true,
      message: 'Réservation annulée',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur annulation réservation:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// SUIVI GPS VÉHICULES
// ====================

// GET /api/operator/vehicles/active - Véhicules actifs avec position GPS
router.get('/vehicles/active', authenticateToken, requireOperator, async (req, res) => {
  try {
    const organizationId = req.user.organization_id;

    const query = `
      SELECT DISTINCT ON (t.vehicle_number)
        t.vehicle_number as vehicle_id,
        t.vehicle_number,
        r.departure_city,
        r.arrival_city,
        vt.latitude,
        vt.longitude,
        vt.speed,
        vt.heading,
        vt.status,
        vt.timestamp as last_update,
        t.arrival_datetime as estimated_arrival
      FROM trips t
      JOIN routes r ON r.id = t.route_id
      LEFT JOIN vehicle_tracking vt ON vt.trip_id = t.id
      WHERE t.organization_id = $1 
        AND t.status = 'in_progress'
        AND vt.timestamp IS NOT NULL
      ORDER BY t.vehicle_number, vt.timestamp DESC
    `;

    const result = await pool.query(query, [organizationId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        vehicle_id: row.vehicle_id,
        vehicle_number: row.vehicle_number,
        trip: {
          departure_city: row.departure_city,
          arrival_city: row.arrival_city
        },
        latitude: parseFloat(row.latitude) || 0,
        longitude: parseFloat(row.longitude) || 0,
        speed: parseFloat(row.speed) || 0,
        heading: parseFloat(row.heading) || 0,
        status: row.status || 'en_route',
        last_update: row.last_update,
        estimated_arrival: row.estimated_arrival
      }))
    });
  } catch (error) {
    console.error('Erreur véhicules actifs:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// RAPPORTS & ANALYTICS
// ====================

// GET /api/operator/reports/revenue - Évolution du revenu
router.get('/reports/revenue', authenticateToken, requireOperator, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const organizationId = req.user.organization_id;

    let interval = '7 days';
    let groupBy = 'week';
    
    if (period === 'day') {
      interval = '1 day';
      groupBy = 'hour';
    } else if (period === 'year') {
      interval = '365 days';
      groupBy = 'month';
    }

    const query = `
      SELECT 
        DATE_TRUNC('${groupBy}', b.created_at) as period,
        COUNT(b.id) as trips,
        SUM(b.number_of_passengers) as passengers,
        SUM(p.amount) as revenue
      FROM bookings b
      JOIN trips t ON t.id = b.trip_id
      LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'completed'
      WHERE t.organization_id = $1
        AND b.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY period
      ORDER BY period ASC
    `;

    const result = await pool.query(query, [organizationId]);

    res.json({
      success: true,
      data: result.rows.map((row, index) => ({
        period: `Période ${index + 1}`,
        revenue: parseFloat(row.revenue) || 0,
        trips: parseInt(row.trips) || 0,
        passengers: parseInt(row.passengers) || 0
      }))
    });
  } catch (error) {
    console.error('Erreur rapport revenu:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET /api/operator/reports/performance - Performance par ligne
router.get('/reports/performance', authenticateToken, requireOperator, async (req, res) => {
  try {
    const organizationId = req.user.organization_id;

    const query = `
      SELECT 
        r.departure_city || ' → ' || r.arrival_city as line_name,
        COUNT(b.id) as trips_count,
        SUM(p.amount) as revenue,
        ROUND(AVG(CAST(t.total_seats - t.available_seats AS FLOAT) / NULLIF(t.total_seats, 0) * 100), 0) as occupancy_rate
      FROM routes r
      JOIN trips t ON t.route_id = r.id
      LEFT JOIN bookings b ON b.trip_id = t.id
      LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'completed'
      WHERE t.organization_id = $1
      GROUP BY r.id, r.departure_city, r.arrival_city
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [organizationId]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        line_name: row.line_name,
        revenue: parseFloat(row.revenue) || 0,
        occupancy_rate: parseInt(row.occupancy_rate) || 0,
        trips_count: parseInt(row.trips_count) || 0
      }))
    });
  } catch (error) {
    console.error('Erreur rapport performance:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

module.exports = router;
