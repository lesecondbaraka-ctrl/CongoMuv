const express = require('express');
const axios = require('axios');
const router = express.Router();
const env = require('../config/env');
const { verifyJWT, requireRole, ensureOrgScoped } = require('../middleware/auth');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/admin/activity (SUPER_ADMIN only)
router.get('/activity', verifyJWT, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    // Fetch recent login/activity logs (last 24h, max 200)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: logs } = await axios.get(`${SUPABASE_URL}/rest/v1/login_logs`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: 'id,email,ip_address,user_agent,created_at',
        created_at: `gte.${since}`,
        order: 'created_at.desc',
        limit: 200
      }
    });

// GET /api/admin/operators/:id/admins (SUPER_ADMIN only)
router.get('/operators/:id/admins', verifyJWT, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const operatorId = String(req.params.id);
    const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: 'email,role,full_name,phone,organization_id',
        organization_id: `eq.${operatorId}`,
        order: 'email.asc'
      }
    });
    // Filter to admin-like roles on the server response for safety
    const admins = (data || []).filter(p => ['ADMIN','SUPER_ADMIN','CONGOMUV_HQ','ONATRA','TRANSCO','PRIVATE'].includes(String(p.role).toUpperCase()));
    return res.json({ items: admins });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors du chargement des administrateurs' });
  }
});

    const emails = Array.from(new Set((logs || []).map(l => String(l.email || '').toLowerCase()).filter(Boolean)));
    let profilesByEmail = {};
    if (emails.length) {
      // Query profiles for roles and organization_ids in batches to avoid URL length issues
      const batchSize = 30;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        const { data: profs } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          },
          params: {
            select: 'email,role,organization_id',
            email: `in.(${batch.join(',')})`
          }
        });
        for (const p of profs || []) {
          profilesByEmail[String(p.email).toLowerCase()] = {
            role: p.role,
            organization_id: p.organization_id || null
          };
        }
      }
    }

    const items = (logs || []).map(l => ({
      id: l.id,
      email: l.email,
      ip_address: l.ip_address,
      user_agent: l.user_agent,
      created_at: l.created_at,
      role: (profilesByEmail[String(l.email || '').toLowerCase()]?.role) || null,
      organization_id: (profilesByEmail[String(l.email || '').toLowerCase()]?.organization_id) || null
    }));

    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors du chargement des activités' });
  }
});

// GET /api/admin/operators (SUPER_ADMIN only)
router.get('/operators', verifyJWT, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/operators`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: 'id,name,type,is_active',
        order: 'name.asc'
      }
    });
    return res.json({ items: data || [] });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors du chargement des opérateurs' });
  }
});

// GET /api/admin/stats
router.get('/stats', verifyJWT, requireRole('ADMIN','SUPER_ADMIN','CONGOMUV_HQ','ONATRA','TRANSCO','PRIVATE'), ensureOrgScoped, async (req, res) => {
  try {
    const orgId = req.scopeOrgId; // null => SUPER_ADMIN (pleins droits)

    // Fetch trips joined with routes, scoped by operator if needed
    const params = {
      select: 'id,route_id,departure_datetime,arrival_datetime,available_seats,total_seats,price,status,delay_minutes,routes!inner(operator_id)',
      is_active: 'eq.true'
    };
    if (orgId) {
      // PostgREST nested filter: routes.operator_id=eq.<uuid>
      params['routes.operator_id'] = `eq.${orgId}`;
    }

    const { data: trips } = await axios.get(`${SUPABASE_URL}/rest/v1/trips`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params
    });

    const activeStatuses = new Set(['scheduled', 'ongoing', 'in_transit']);
    let totalBookings = 0; // nombre de places réservées (approximation)
    let totalRevenue = 0; // somme (places réservées * prix du trip)
    let activeTrips = 0;
    let totalPassengers = 0; // total des passagers (approximation)
    for (const t of (trips || [])) {
      const total = Number(t.total_seats || 0);
      const avail = Number(t.available_seats || 0);
      const booked = Math.max(0, total - avail);
      const price = Number(t.price || 0);
      totalBookings += booked;
      totalRevenue += booked * price;
      totalPassengers += booked;
      if (activeStatuses.has(String(t.status || 'scheduled'))) activeTrips += 1;
    }

    const stats = {
      scopeOrganizationId: orgId || null,
      totalBookings,
      totalRevenue,
      activeTrips,
      totalPassengers,
      onTimeRate: 100 - Math.min(100, Math.max(0, Math.round(((trips || []).reduce((acc, t) => acc + (Number(t.delay_minutes || 0) > 5 ? 1 : 0), 0) / Math.max(1, (trips || []).length)) * 100))),
      satisfactionRate: 90, // placeholder en l'absence de table de feedback
      incidentReports: 0 // placeholder en l'absence de table incidents
    };
    return res.json(stats);
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

// GET /api/admin/trips
router.get('/trips', verifyJWT, requireRole('ADMIN','SUPER_ADMIN','CONGOMUV_HQ','ONATRA','TRANSCO','PRIVATE'), ensureOrgScoped, async (req, res) => {
  try {
    const orgId = req.scopeOrgId;
    const params = {
      select: 'id,route_id,departure_datetime,arrival_datetime,available_seats,total_seats,price,status,delay_minutes,created_at,updated_at,routes!inner(id,operator_id,route_code,name,distance_km,duration_minutes,base_price,is_active)'
    };
    if (orgId) params['routes.operator_id'] = `eq.${orgId}`;

    const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/trips`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params
    });

    const items = (data || []).map(t => ({
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
        distance_km: t.routes.distance_km,
        duration_minutes: t.routes.duration_minutes,
        base_price: t.routes.base_price,
        is_active: t.routes.is_active
      } : null
    }));

    return res.json({ organizationId: orgId || null, items });
  } catch (e) {
    return res.status(500).json({ error: "Erreur lors de la récupération des voyages" });
  }
});

// GET /api/admin/incidents
router.get('/incidents', verifyJWT, requireRole('ADMIN','SUPER_ADMIN','CONGOMUV_HQ','ONATRA','TRANSCO','PRIVATE'), ensureOrgScoped, async (req, res) => {
  try {
    const orgId = req.scopeOrgId;

    const params = {
      select: 'id,operator_id,trip_id,type,severity,status,description,date,location,created_at,updated_at',
      order: 'date.desc',
      limit: 100
    };
    if (orgId) params['operator_id'] = `eq.${orgId}`;

    const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/incidents`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params
    });

    const items = (data || []).map(i => ({
      id: i.id,
      operator_id: i.operator_id,
      trip_id: i.trip_id,
      type: i.type,
      severity: i.severity,
      status: i.status,
      description: i.description,
      date: i.date,
      location: i.location,
      created_at: i.created_at,
      updated_at: i.updated_at
    }));

    return res.json({ organizationId: orgId || null, items });
  } catch (e) {
    return res.status(500).json({ error: "Erreur lors de la récupération des incidents" });
  }
});

module.exports = router;
