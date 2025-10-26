const express = require('express');
const axios = require('axios');
const router = express.Router();
const env = require('../config/env');
const { verifyJWT, requireRole } = require('../middleware/auth');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/users/me - retourne email, role, organizationId, full_name
router.get('/me', verifyJWT, async (req, res) => {
  const email = String(req.user?.email || '').toLowerCase();
  try {
    const { data } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: 'email,role,organization_id,full_name,phone',
        email: `eq.${email}`,
        limit: 1
      }
    });

    if (!Array.isArray(data) || !data.length) {
      return res.status(404).json({ error: 'Profil introuvable' });
    }

    const p = data[0];
    return res.json({
      email: p.email,
      role: p.role,
      organizationId: p.organization_id || null,
      full_name: p.full_name || null,
      phone: p.phone || null
    });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Example admin-protected route (placeholder)
router.get('/admin/stats', verifyJWT, requireRole('ADMIN', 'SUPER_ADMIN', 'CONGOMUV_HQ', 'ONATRA', 'TRANSCO', 'PRIVATE'), async (req, res) => {
  return res.json({ ok: true });
});

// POST /api/users/admin/invite - SUPER_ADMIN only
// Body: { email, role, organization_id?, organization_name? }
router.post('/admin/invite', verifyJWT, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const role = String(req.body?.role || 'ADMIN').trim().toUpperCase();
    const organization_id = req.body?.organization_id ? String(req.body.organization_id) : null;
    const organization_name = req.body?.organization_name ? String(req.body.organization_name).trim() : null;

    if (!email) return res.status(400).json({ error: 'email requis' });

    let orgId = organization_id;

    // If organization_name provided and no organization_id, resolve or create operator
    if (!orgId && organization_name) {
      const headers = {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      };
      const orgRes = await axios.get(`${SUPABASE_URL}/rest/v1/operators`, {
        headers,
        params: { select: 'id,name', name: `eq.${organization_name}`, limit: 1 }
      });
      if (Array.isArray(orgRes.data) && orgRes.data.length) {
        orgId = String(orgRes.data[0].id);
      } else {
        // Auto-create operator with provided name
        const insert = await axios.post(`${SUPABASE_URL}/rest/v1/operators`, {
          name: organization_name,
          type: 'PRIVATE',
          is_active: true
        }, {
          headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' }
        });
        if (Array.isArray(insert.data) && insert.data.length) {
          orgId = String(insert.data[0].id);
        } else if (insert.data && insert.data.id) {
          orgId = String(insert.data.id);
        } else {
          return res.status(500).json({ error: `Échec de création de l'organisation: ${organization_name}` });
        }
      }
    }

    // Check if profile exists
    const prof = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: { select: 'email', email: `eq.${email}`, limit: 1 }
    });

    if (!Array.isArray(prof.data) || !prof.data.length) {
      // Create Supabase Auth user (random temp password)
      const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
      await axios.post(`${SUPABASE_URL}/auth/v1/admin/users`, {
        email,
        password: tempPassword,
        email_confirm: true
      }, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Upsert profile with admin role and organization link
    await axios.post(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=email`, {
      email,
      role,
      organization_id: orgId || null
    }, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'resolution=merge-duplicates,return=minimal',
        'Content-Type': 'application/json'
      }
    });

    return res.status(201).json({ message: 'Admin invité/créé avec succès', email, role, organization_id: orgId || null });
  } catch (error) {
    console.error('Erreur admin invite:', error.response?.data || error.message);
    // Try to surface clearer error messages from PostgREST
    const detail = error.response?.data?.message || error.response?.data?.hint || error.message;
    return res.status(500).json({ error: `Erreur serveur lors de l'invitation admin: ${detail}` });
  }
});

module.exports = router;
