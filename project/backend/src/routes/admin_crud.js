const express = require('express');
const axios = require('axios');
const router = express.Router();
const env = require('../config/env');
const { verifyJWT } = require('../middleware/auth');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function assertAdmin(req, res, next) {
  try {
    const role = String(req.user?.role || '').toUpperCase();
    const allowed = ['ADMIN', 'SUPER_ADMIN', 'CONGOMUV_HQ', 'ONATRA', 'TRANSCO', 'PRIVATE'];
    if (!allowed.includes(role)) return res.status(403).json({ error: 'Accès refusé' });
    next();
  } catch {
    return res.status(403).json({ error: 'Accès refusé' });
  }
}

// Helpers
function sbHeaders() {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };
}

// ROUTES CRUD
router.get('/routes', verifyJWT, assertAdmin, async (req, res) => {
  try {
    const params = {
      select: 'id,name,route_code,operator_id,departure_city,arrival_city,is_active',
      order: 'created_at.desc'
    };
    if (req.query?.operator_id) params['operator_id'] = `eq.${req.query.operator_id}`;
    const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/routes`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params
    });
    return res.json({ items: Array.isArray(data) ? data : [] });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur chargement trajets' });
  }
});
router.post('/routes', verifyJWT, assertAdmin, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.operator_id || !body.name || !body.base_price) {
      return res.status(400).json({ error: 'operator_id, name, base_price requis' });
    }
    const payload = {
      operator_id: body.operator_id,
      transport_type_id: body.transport_type_id || null,
      departure_city_id: body.departure_city_id || null,
      arrival_city_id: body.arrival_city_id || null,
      route_code: body.route_code || null,
      name: body.name,
      distance_km: body.distance_km || null,
      duration_minutes: body.duration_minutes || null,
      base_price: body.base_price,
      stops: body.stops || null,
      is_active: body.is_active !== undefined ? !!body.is_active : true,
      departure_city: body.departure_city || null,
      arrival_city: body.arrival_city || null,
    };
    const { data } = await axios.post(`${SUPABASE_URL}/rest/v1/routes`, payload, { headers: sbHeaders() });
    return res.status(201).json({ route: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur création trajet' });
  }
});

router.put('/routes/:id', verifyJWT, assertAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { data } = await axios.patch(`${SUPABASE_URL}/rest/v1/routes?id=eq.${id}`, req.body || {}, {
      headers: { ...sbHeaders(), Prefer: 'return=representation' }
    });
    return res.json({ route: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur mise à jour trajet' });
  }
});

router.delete('/routes/:id', verifyJWT, assertAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await axios.delete(`${SUPABASE_URL}/rest/v1/routes`, {
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      params: { id: `eq.${id}` }
    });
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error: 'Erreur suppression trajet' });
  }
});

// TRIPS CRUD
router.post('/trips', verifyJWT, assertAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.route_id || !b.departure_datetime || !b.total_seats) {
      return res.status(400).json({ error: 'route_id, departure_datetime, total_seats requis' });
    }
    const payload = {
      route_id: b.route_id,
      departure_datetime: b.departure_datetime,
      arrival_datetime: b.arrival_datetime || null,
      available_seats: b.available_seats ?? b.total_seats,
      total_seats: b.total_seats,
      vehicle_number: b.vehicle_number || null,
      status: b.status || 'scheduled',
      price: b.price || null
    };
    const { data } = await axios.post(`${SUPABASE_URL}/rest/v1/trips`, payload, { headers: sbHeaders() });
    return res.status(201).json({ trip: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur création voyage' });
  }
});

router.put('/trips/:id', verifyJWT, assertAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { data } = await axios.patch(`${SUPABASE_URL}/rest/v1/trips?id=eq.${id}`, req.body || {}, {
      headers: { ...sbHeaders(), Prefer: 'return=representation' }
    });
    return res.json({ trip: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur mise à jour voyage' });
  }
});

router.delete('/trips/:id', verifyJWT, assertAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await axios.delete(`${SUPABASE_URL}/rest/v1/trips`, {
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      params: { id: `eq.${id}` }
    });
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error: 'Erreur suppression voyage' });
  }
});

module.exports = router;
