const express = require('express');
const axios = require('axios');
const router = express.Router();
const env = require('../config/env');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Public: search trips with optional date filter
router.get('/search', async (req, res) => {
  try {
    const { date, limit, order, q, operator_id, max_price, offset, departure_city, arrival_city, departure_city_id, arrival_city_id, include_count } = req.query;

    const params = {
      select: 'id,route_id,departure_datetime,arrival_datetime,available_seats,total_seats,price,status,delay_minutes,routes:route_id(id,operator_id,route_code,name,departure_city,arrival_city,distance_km,duration_minutes,base_price,is_active)',
      is_active: 'eq.true'
    };
    if (date) params['departure_datetime'] = `gte.${date}T00:00:00`;
    if (date) params['arrival_datetime'] = `lte.${date}T23:59:59`;
    if (order) params['order'] = String(order);
    if (limit) params['limit'] = String(limit);
    if (offset) params['offset'] = String(offset);
    if (operator_id) params['routes.operator_id'] = `eq.${operator_id}`;
    if (departure_city_id) params['routes.departure_city_id'] = `eq.${departure_city_id}`;
    if (arrival_city_id) params['routes.arrival_city_id'] = `eq.${arrival_city_id}`;
    // Case-insensitive textual filter when IDs not provided
    if (!departure_city_id && departure_city) params['routes.departure_city'] = `ilike.*${departure_city}*`;
    if (!arrival_city_id && arrival_city) params['routes.arrival_city'] = `ilike.*${arrival_city}*`;
    if (max_price) params['price'] = `lte.${max_price}`;

    let totalFromHeader = null;
    // Optimized HEAD count when requested explicitly
    if (String(include_count).toLowerCase() === 'header') {
      try {
        const headResp = await axios.head(`${SUPABASE_URL}/rest/v1/trips`, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'count=exact',
            Range: '0-0'
          },
          params
        });
        const cr = String(headResp.headers['content-range'] || '');
        if (cr.includes('/')) totalFromHeader = Number(cr.split('/')[1]);
      } catch (e) {
        // fall back silently
      }
    }

    const resp = await axios.get(`${SUPABASE_URL}/rest/v1/trips`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'count=exact'
      },
      params
    });
    const data = resp.data;

    if (String(process.env.DEBUG_TRIPS || '').toLowerCase() === 'true') {
      console.log('[TRIPS][SEARCH] params=', params, 'totalFromHeader=', totalFromHeader);
    }

    let filtered = Array.isArray(data) ? data : [];
    if (q) {
      const needle = String(q).toLowerCase();
      filtered = filtered.filter(t => {
        const name = String(t?.routes?.name || '').toLowerCase();
        const code = String(t?.routes?.route_code || '').toLowerCase();
        const dep = String(t?.routes?.departure_city || '').toLowerCase();
        const arr = String(t?.routes?.arrival_city || '').toLowerCase();
        return name.includes(needle) || code.includes(needle) || dep.includes(needle) || arr.includes(needle);
      });
    }

    const items = (filtered || []).map(t => ({
      id: t.id,
      route_id: t.route_id,
      departure_time: t.departure_datetime,
      arrival_time: t.arrival_datetime,
      available_seats: t.available_seats,
      total_seats: t.total_seats,
      price: t.price,
      status: t.status,
      delay_minutes: t.delay_minutes,
      route: t.routes ? {
        id: t.routes.id,
        operator_id: t.routes.operator_id,
        route_code: t.routes.route_code,
        name: t.routes.name,
        departure_city: t.routes.departure_city || null,
        arrival_city: t.routes.arrival_city || null,
        distance_km: t.routes.distance_km,
        duration_minutes: t.routes.duration_minutes,
        base_price: t.routes.base_price,
        is_active: t.routes.is_active
      } : null
    }));

    if (include_count) {
      const cr = String(resp.headers['content-range'] || '');
      const total = totalFromHeader != null ? totalFromHeader : (cr.includes('/') ? Number(cr.split('/')[1]) : items.length);
      return res.json({ items, total });
    }
    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors de la recherche des voyages' });
  }
});

module.exports = router;
