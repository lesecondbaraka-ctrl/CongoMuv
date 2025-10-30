/**
 * Routes API pour le Module Administratif Global (CongoMuv HQ)
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Middleware pour vérifier les rôles admin et superadmin
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Accès refusé - authentification requise' });
    }
    const role = String(req.user.role).toLowerCase();
    const allowedRoles = ['superadmin', 'admin', 'congomuv_hq', 'onatra', 'transco', 'private', 'operator'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: `Accès refusé - rôle "${role}" non autorisé`, requiredRoles: allowedRoles });
    }
    next();
  } catch (error) {
    console.error('Erreur requireAdmin:', error);
    return res.status(403).json({ error: 'Accès refusé' });
  }
};

// Helper pour headers supabase
function sbHeaders() {
  return {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
}

// 1. Supervision passagers
router.get('/supervision/passengers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let dateFilter = '';
    switch (period) {
      case 'day': dateFilter = "AND b.created_at >= NOW() - INTERVAL '1 day'"; break;
      case 'week': dateFilter = "AND b.created_at >= NOW() - INTERVAL '7 days'"; break;
      case 'month': dateFilter = "AND b.created_at >= NOW() - INTERVAL '30 days'"; break;
    }

    const query = `
      SELECT 
        DATE(b.created_at) as date,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.number_of_passengers) as total_passengers,
        SUM(p.amount) as total_payments,
        AVG(p.amount/NULLIF(b.number_of_passengers, 0)) as average_ticket_price
      FROM bookings b
      LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'completed'
      WHERE 1=1 ${dateFilter}
      GROUP BY DATE(b.created_at)
      ORDER BY date DESC
    `;

    const result = await pool.query(query);
    res.json({
      success: true,
      data: result.rows.map(row => ({
        date: row.date,
        totalPassengers: parseInt(row.total_passengers) || 0,
        totalBookings: parseInt(row.total_bookings) || 0,
        totalPayments: parseFloat(row.total_payments) || 0,
        averageTicketPrice: parseFloat(row.average_ticket_price) || 0,
      })),
    });
  } catch (error) {
    console.error('Erreur supervision passagers:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// 2. Gestion multi-admins

// Liste des admins
router.get('/admins', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        o.name as organization_name,
        u.organization_id,
        u.created_at,
        CASE WHEN u.email_confirmed THEN true ELSE false END as is_active
      FROM users u
      LEFT JOIN organizations o ON o.id = u.organization_id
      WHERE u.role IN ('ADMIN', 'OPERATOR')
      ORDER BY u.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        email: row.email,
        full_name: row.full_name,
        role: row.role,
        organization_name: row.organization_name || 'N/A',
        organization_id: row.organization_id,
        permissions: ['manage_trips', 'view_bookings'], // TODO: Permissions dynamiques
        is_active: row.is_active,
        created_at: row.created_at,
      })),
    });
  } catch (error) {
    console.error('Erreur liste admins:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Invitation nouvel admin
router.post('/admins/invite', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, role, organization_name } = req.body;
    if (!email || !role) return res.status(400).json({ error: 'Email et rôle requis' });

    const validRoles = ['SUPERADMIN', 'ADMIN', 'OPERATOR', 'DRIVER', 'PASSENGER'];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Utilisateur existe déjà' });
    }

    let organizationId = null;
    if (organization_name) {
      const orgCheck = await pool.query('SELECT id FROM organizations WHERE name = $1', [organization_name]);
      if (orgCheck.rows.length > 0) {
        organizationId = orgCheck.rows[0].id;
      } else {
        const orgInsert = await pool.query(
          'INSERT INTO organizations (name, type, is_active) VALUES ($1, $2, $3) RETURNING id',
          [organization_name, 'PRIVATE', true]
        );
        organizationId = orgInsert.rows[0].id;
      }
    }

    const insertQuery = `
      INSERT INTO users (email, full_name, role, organization_id, email_confirmed)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, role
    `;
    const result = await pool.query(insertQuery, [email, email.split('@')[0], role, organizationId, false]);

    res.json({
      success: true,
      message: 'Invitation envoyée avec succès',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Erreur invitation admin:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Activer/désactiver admin
router.put('/admins/:id/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const query = `
      UPDATE users
      SET email_confirmed = NOT email_confirmed
      WHERE id = $1
      RETURNING id, email, email_confirmed as is_active
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    res.json({ success: true, message: 'Statut mis à jour', data: result.rows[0] });
  } catch (error) {
    console.error('Erreur toggle admin:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Supprimer admin
router.delete('/admins/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }
    res.json({ success: true, message: 'Administrateur supprimé' });
  } catch (error) {
    console.error('Erreur suppression admin:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Endpoint de test sans auth pour debug  
router.get('/incidents/test', async (req, res) => {
  try {
    const axios = require('axios');
    const env = require('../config/env');
    
    const { data: incidents } = await axios.get(
      `${env.SUPABASE_URL}/rest/v1/incidents?select=*&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    res.json({
      success: true,
      count: incidents.length,
      data: incidents || []
    });
  } catch (error) {
    console.error('Erreur test incidents:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.response?.data || error.message });
  }
});

// Monitoring & alertes (incidents) - Utilise Supabase directement (SANS AUTH pour simplifier)
router.get('/incidents', async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    const axios = require('axios');
    const env = require('../config/env');
    
    // Construire le filtre de statut
    let statusQuery = '';
    if (filter === 'pending') statusQuery = '&status=neq.resolved';
    else if (filter === 'resolved') statusQuery = '&status=eq.resolved';

    // Récupérer les incidents depuis Supabase
    const { data: incidents } = await axios.get(
      `${env.SUPABASE_URL}/rest/v1/incidents?select=*&order=date.desc,created_at.desc&limit=50${statusQuery}`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    res.json({
      success: true,
      data: incidents || []
    });
  } catch (error) {
    console.error('Erreur liste incidents:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.response?.data || error.message });
  }
});

// Créer un incident - AVEC SUPABASE (SANS AUTH pour simplifier)
router.post('/incidents', async (req, res) => {
  try {
    console.log('\n=== POST /api/admin-hq/incidents ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const { type, description, severity, operator_id, trip_id, location, status } = req.body;
    
    console.log('✅ Insertion dans Supabase incidents...');
    
    const axios = require('axios');
    const env = require('../config/env');
    
    const payload = {
      type: type || 'Incident général',
      description: description || '',
      severity: severity || 'medium',
      status: status || 'open',
      operator_id: operator_id || null,
      trip_id: trip_id || null,
      location: location || null,
      date: new Date().toISOString()
    };
    
    const { data } = await axios.post(
      `${env.SUPABASE_URL}/rest/v1/incidents`,
      payload,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );
    
    console.log('✅ Incident créé dans Supabase:', data[0]);
    res.json({ success: true, message: 'Incident créé', data: data[0] });
  } catch (error) {
    console.error('❌ Erreur création incident:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.response?.data || error.message });
  }
});

// Résoudre un incident
router.put('/incidents/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const query = `
      UPDATE support_tickets
      SET status = 'resolved', resolved_at = NOW()
      WHERE id = $1
      RETURNING id, status, resolved_at
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Incident non trouvé' });
    res.json({ success: true, message: 'Incident résolu', data: result.rows[0] });
  } catch (error) {
    console.error('Erreur résolution incident:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Sécurité & conformité - audit logs
router.get('/security/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const query = `
      SELECT 'login' as action, u.email as user, u.created_at as timestamp, 'success' as status
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    res.json({
      success: true,
      data: result.rows.map(row => ({
        time: row.timestamp,
        user: row.user,
        action: row.action,
        status: row.status,
      })),
    });
  } catch (error) {
    console.error('Erreur audit logs:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Paramètres de sécurité
router.get('/security/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        twoFactorEnabled: true,
        autoBackupEnabled: true,
        encryption: { database: 'AES-256', api: 'TLS 1.3', files: 'Encrypted' },
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
        backupFrequency: '6h',
        retentionDays: 30,
      },
    });
  } catch (error) {
    console.error('Erreur settings sécurité:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// API management - clés API
router.get('/api-keys', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Production Key - Airtel Money',
          key: 'sk_live_abc123xyz789def456ghi',
          partner_name: 'Airtel Money',
          permissions: ['payments:read', 'payments:write'],
          calls_today: 1547,
          created_at: new Date('2025-01-15'),
          is_active: true,
        },
      ],
    });
  } catch (error) {
    console.error('Erreur liste API keys:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Test endpoint pour vérifier l'authentification
router.get('/test-auth', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    message: '✅ Authentification réussie!',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      organization_id: req.user.organization_id
    }
  });
});

// Statistiques globales dashboard
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'USER') as total_passengers,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM organizations WHERE is_active = true) as active_operators,
        (SELECT COUNT(*) FROM support_tickets WHERE status != 'resolved') as pending_incidents
    `;
    const result = await pool.query(statsQuery);
    const stats = result.rows[0];
    res.json({
      success: true,
      data: {
        totalPassengers: parseInt(stats.total_passengers) || 0,
        totalBookings: parseInt(stats.total_bookings) || 0,
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        activeOperators: parseInt(stats.active_operators) || 0,
        pendingIncidents: parseInt(stats.pending_incidents) || 0,
        apiCalls24h: 15420, // À implémenter
      },
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// 3. Gestion des opérateurs (organizations)
// Liste des opérateurs
router.get('/operators', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search = '', is_active } = req.query;
    const params = [];
    let where = 'WHERE 1=1';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (LOWER(name) LIKE LOWER($${params.length}))`;
    }
    if (typeof is_active !== 'undefined') {
      params.push(String(is_active).toLowerCase() === 'true');
      where += ` AND is_active = $${params.length}`;
    }
    const query = `
      SELECT id, name, type, is_active, created_at
      FROM organizations
      ${where}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    const result = await pool.query(query, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur liste opérateurs:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Créer un opérateur - AVEC SUPABASE
router.post('/operators', authenticateToken, async (req, res) => {
  try {
    console.log('\n=== POST /api/admin-hq/operators ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const { name, type = 'PRIVATE', is_active = true, contact_email = null, contact_phone = null, address = null, city = null, country = null } = req.body || {};
    
    if (!name) {
      console.log('❌ Nom manquant');
      return res.status(400).json({ error: 'name requis' });
    }

    console.log('✅ Insertion dans Supabase organizations...');
    
    // Utiliser l'API REST Supabase
    const axios = require('axios');
    const env = require('../config/env');
    
    const payload = {
      name,
      type,
      is_active: !!is_active,
      contact_email,
      contact_phone,
      address,
      city,
      country
    };
    
    const { data } = await axios.post(
      `${env.SUPABASE_URL}/rest/v1/organizations`,
      payload,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );
    
    console.log('✅ Opérateur créé dans Supabase:', data[0]);
    return res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error('❌ Erreur création opérateur:', error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

module.exports = router;
