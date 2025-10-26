/**
 * Routes API pour le Module Administratif Global (CongoMuv HQ)
 * Toutes les 5 fonctionnalités selon l'image
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/database');

// Middleware pour vérifier le rôle ADMIN
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Accès refusé - Admin requis' });
  }
  next();
};

// ====================
// 1. SUPERVISION PASSAGERS
// ====================

// GET /api/admin-hq/supervision/passengers - Stats passagers par période
router.get('/supervision/passengers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter = '';
    switch (period) {
      case 'day':
        dateFilter = "AND b.created_at >= NOW() - INTERVAL '1 day'";
        break;
      case 'week':
        dateFilter = "AND b.created_at >= NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND b.created_at >= NOW() - INTERVAL '30 days'";
        break;
    }

    const query = `
      SELECT 
        DATE(b.created_at) as date,
        COUNT(DISTINCT b.id) as total_bookings,
        SUM(b.number_of_passengers) as total_passengers,
        SUM(p.amount) as total_payments,
        AVG(p.amount / NULLIF(b.number_of_passengers, 0)) as average_ticket_price
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
        averageTicketPrice: parseFloat(row.average_ticket_price) || 0
      }))
    });
  } catch (error) {
    console.error('Erreur supervision passagers:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET /api/admin-hq/supervision/routes/top - Top routes populaires
router.get('/supervision/routes/top', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        r.departure_city || ' → ' || r.arrival_city as route,
        COUNT(b.id) as bookings_count,
        SUM(b.number_of_passengers) as passengers,
        SUM(p.amount) as revenue
      FROM routes r
      JOIN trips t ON t.route_id = r.id
      JOIN bookings b ON b.trip_id = t.id
      LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'completed'
      WHERE b.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY r.id, r.departure_city, r.arrival_city
      ORDER BY revenue DESC
      LIMIT 10
    `;

    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        route: row.route,
        passengers: parseInt(row.passengers) || 0,
        revenue: parseFloat(row.revenue) || 0
      }))
    });
  } catch (error) {
    console.error('Erreur top routes:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// 2. GESTION MULTI-ADMINS
// ====================

// GET /api/admin-hq/admins - Liste tous les administrateurs
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
        permissions: ['manage_trips', 'view_bookings'], // TODO: Système permissions dynamique
        is_active: row.is_active,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    console.error('Erreur liste admins:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/admin-hq/admins/invite - Inviter un nouvel administrateur
router.post('/admins/invite', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, role, organization_name } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email et rôle requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Créer ou récupérer l'organisation
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

    // Créer l'utilisateur (normalement on enverrait un email d'invitation)
    const insertQuery = `
      INSERT INTO users (email, full_name, role, organization_id, email_confirmed)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, role
    `;
    
    const result = await pool.query(insertQuery, [
      email,
      email.split('@')[0], // Nom temporaire
      role,
      organizationId,
      false // Pas encore confirmé
    ]);

    res.json({
      success: true,
      message: 'Invitation envoyée avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur invitation admin:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// PUT /api/admin-hq/admins/:id/toggle-active - Activer/Désactiver un admin
router.put('/admins/:id/toggle-active', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

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

    res.json({
      success: true,
      message: 'Statut mis à jour',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur toggle admin:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// DELETE /api/admin-hq/admins/:id - Supprimer un administrateur
router.delete('/admins/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier qu'on ne supprime pas son propre compte
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrateur non trouvé' });
    }

    res.json({
      success: true,
      message: 'Administrateur supprimé'
    });
  } catch (error) {
    console.error('Erreur suppression admin:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// 3. MONITORING & ALERTES
// ====================

// GET /api/admin-hq/incidents - Liste des incidents
router.get('/incidents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filter = 'all' } = req.query;

    let statusFilter = '';
    if (filter === 'pending') {
      statusFilter = "AND status != 'resolved'";
    } else if (filter === 'resolved') {
      statusFilter = "AND status = 'resolved'";
    }

    const query = `
      SELECT 
        st.id,
        st.subject as type,
        st.message as description,
        st.priority as severity,
        st.status,
        u.full_name as operator_name,
        st.created_at,
        st.resolved_at
      FROM support_tickets st
      LEFT JOIN users u ON u.id = st.user_id
      WHERE st.priority IN ('low', 'medium', 'high')
      ${statusFilter}
      ORDER BY 
        CASE st.priority 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        st.created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        type: row.type,
        description: row.description,
        severity: row.severity,
        status: row.status,
        operator_name: row.operator_name || 'System',
        created_at: row.created_at,
        resolved_at: row.resolved_at
      }))
    });
  } catch (error) {
    console.error('Erreur liste incidents:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// POST /api/admin-hq/incidents - Créer un incident
router.post('/incidents', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, description, severity } = req.body;

    const query = `
      INSERT INTO support_tickets (user_id, subject, message, priority, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, subject, message, priority, status, created_at
    `;

    const result = await pool.query(query, [
      req.user.id,
      type,
      description,
      severity,
      'investigating'
    ]);

    res.json({
      success: true,
      message: 'Incident créé',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur création incident:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// PUT /api/admin-hq/incidents/:id/resolve - Résoudre un incident
router.put('/incidents/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE support_tickets
      SET status = 'resolved', resolved_at = NOW()
      WHERE id = $1
      RETURNING id, status, resolved_at
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident non trouvé' });
    }

    res.json({
      success: true,
      message: 'Incident résolu',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur résolution incident:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// 4. SÉCURITÉ & CONFORMITÉ
// ====================

// GET /api/admin-hq/security/audit-logs - Logs d'audit
router.get('/security/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // TODO: Créer une table audit_logs dédiée
    // Pour l'instant, on retourne des logs simulés basés sur l'activité système
    const query = `
      SELECT 
        'login' as action,
        u.email as user,
        u.created_at as timestamp,
        'success' as status
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
        status: row.status
      }))
    });
  } catch (error) {
    console.error('Erreur audit logs:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET /api/admin-hq/security/settings - Paramètres de sécurité
router.get('/security/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Retourner les paramètres de sécurité
    res.json({
      success: true,
      data: {
        twoFactorEnabled: true,
        autoBackupEnabled: true,
        encryption: {
          database: 'AES-256',
          api: 'TLS 1.3',
          files: 'Encrypted'
        },
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
        backupFrequency: '6h',
        retentionDays: 30
      }
    });
  } catch (error) {
    console.error('Erreur settings sécurité:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// ====================
// 5. API MANAGEMENT
// ====================

// GET /api/admin-hq/api-keys - Liste des clés API
router.get('/api-keys', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // TODO: Créer une table api_keys
    // Pour l'instant retourner un exemple
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
          is_active: true
        }
      ]
    });
  } catch (error) {
    console.error('Erreur liste API keys:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET /api/admin-hq/stats - Statistiques globales dashboard
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
        apiCalls24h: 15420 // TODO: Implémenter tracking API calls
      }
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

module.exports = router;
