const express = require('express');
const axios = require('axios');
const router = express.Router();
const env = require('../config/env');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/public/cities - liste des villes (public)
router.get('/cities', async (req, res) => {
  try {
    const { q, limit } = req.query;
    const params = {
      select: 'id,name,province,country',
      order: 'name.asc'
    };
    if (limit) params.limit = String(limit);
    const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/cities`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params
    });
    let items = Array.isArray(data) ? data : [];
    if (q) {
      const needle = String(q).toLowerCase();
      items = items.filter(c => String(c.name || '').toLowerCase().includes(needle));
    }
    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors du chargement des villes' });
  }
});

module.exports = router;
