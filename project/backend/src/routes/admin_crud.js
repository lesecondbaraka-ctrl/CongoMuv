/**
 * Routes CRUD administratives - gestion sécurisée multi-rôles
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Middleware vérifier rôles admin et superadmin
const requireAdmin = (req, res, next) => {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    const allowedRoles = ['SUPERADMIN', 'ADMIN', 'CONGOMUV_HQ', 'ONATRA', 'TRANSCO', 'PRIVATE'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Accès refusé - rôle non autorisé' });
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
};

// Lister toutes les routes (ajustez selon vos tables)
router.get('/routes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const params = [];
    let filterQuery = '';

    if (req.query.operator_id) {
      filterQuery = ' WHERE operator_id = $1 ';
      params.push(req.query.operator_id);
    }

    const query = `
      SELECT id, name, route_code, operator_id, departure_city, arrival_city, is_active, created_at
      FROM routes
      ${filterQuery}
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, params);
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Erreur récupération routes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer une nouvelle route - SIMPLIFIÉ
router.post('/routes', authenticateToken, async (req, res) => {
  console.log('\n=== POST /api/admin-crud/routes ===');
  console.log('User:', req.user);
  console.log('Body:', req.body);
  try {
    const {
      operator_id, name, base_price,
      transport_type_id, departure_city_id, arrival_city_id,
      route_code, distance_km, duration_minutes,
      stops, is_active, departure_city, arrival_city
    } = req.body;

    if (!operator_id || !name || !base_price) {
      return res.status(400).json({ error: 'operator_id, name et base_price sont requis' });
    }

    const insertQuery = `
      INSERT INTO routes (operator_id, name, base_price, transport_type_id, departure_city_id, arrival_city_id,
        route_code, distance_km, duration_minutes, stops, is_active, departure_city, arrival_city)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `;
    const values = [
      operator_id, name, base_price, transport_type_id || null, departure_city_id || null,
      arrival_city_id || null, route_code || null, distance_km || null, duration_minutes || null,
      stops || null, is_active !== undefined ? is_active : true, departure_city || null, arrival_city || null
    ];
    const result = await pool.query(insertQuery, values);
    console.log('✅ Route créée:', result.rows[0]);
    res.status(201).json({ success: true, route: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur création route:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Mettre à jour une route
router.put('/routes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    if (!Object.keys(payload).length) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    const sets = Object.keys(payload).map((key, i) => `${key} = $${i+1}`).join(', ');
    const values = Object.values(payload);
    values.push(id);

    const query = `UPDATE routes SET ${sets} WHERE id = $${values.length} RETURNING *`;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route non trouvée' });
    }

    res.json({ success: true, route: result.rows[0] });
  } catch (error) {
    console.error('Erreur mise à jour route:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une route
router.delete('/routes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route non trouvée' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression route:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
