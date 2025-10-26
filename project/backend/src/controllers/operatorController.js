const { query } = require('../config/database');
const { auditLogger } = require('../middleware/audit');

class OperatorController {
  // Récupérer tous les opérateurs
  static async getAllOperators(req, res) {
    try {
      const { organization_id } = req.query;

      let queryText = `
        SELECT o.*, COUNT(t.id) as total_trips,
               COUNT(b.id) as total_bookings,
               COALESCE(SUM(b.total_amount), 0) as total_revenue
        FROM organizations o
        LEFT JOIN routes r ON o.id = r.organization_id
        LEFT JOIN trips t ON r.id = t.route_id
        LEFT JOIN bookings b ON t.id = b.trip_id AND b.status = 'confirmed'
        WHERE o.is_active = true
      `;

      const queryParams = [];

      if (organization_id) {
        queryText += ' AND o.id = $1';
        queryParams.push(organization_id);
      }

      queryText += ' GROUP BY o.id ORDER BY o.name';

      const result = await query(queryText, queryParams);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des opérateurs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des opérateurs'
      });
    }
  }

  // Récupérer un opérateur par ID
  static async getOperatorById(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT o.*,
                COUNT(r.id) as total_routes,
                COUNT(t.id) as total_trips,
                COUNT(b.id) as total_bookings,
                COALESCE(SUM(b.total_amount), 0) as total_revenue
         FROM organizations o
         LEFT JOIN routes r ON o.id = r.organization_id
         LEFT JOIN trips t ON r.id = t.route_id
         LEFT JOIN bookings b ON t.id = b.trip_id AND b.status = 'confirmed'
         WHERE o.id = $1
         GROUP BY o.id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Opérateur non trouvé'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'opérateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération de l\'opérateur'
      });
    }
  }

  // Créer un nouvel opérateur
  static async createOperator(req, res) {
    try {
      const { name, type, description, logo_url, contact_email, contact_phone, services } = req.body;

      // Validation des données
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: 'Nom et type sont requis'
        });
      }

      const result = await query(
        `INSERT INTO organizations (name, type, description, logo_url, contact_email, contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, type, description, logo_url, contact_email, contact_phone]
      );

      const newOperator = result.rows[0];

      // Ajouter les services si fournis
      if (services && services.length > 0) {
        for (const service of services) {
          await query(
            `INSERT INTO transport_types (name, icon, description, organization_id)
             VALUES ($1, $2, $3, $4)`,
            [service.name, service.icon, service.description, newOperator.id]
          );
        }
      }

      // Log d'audit
      await auditLogger(req.user.id, 'CREATE', 'organizations', newOperator.id, null, newOperator);

      res.status(201).json({
        success: true,
        data: newOperator,
        message: 'Opérateur créé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'opérateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la création de l\'opérateur'
      });
    }
  }

  // Mettre à jour un opérateur
  static async updateOperator(req, res) {
    try {
      const { id } = req.params;
      const { name, type, description, logo_url, contact_email, contact_phone, is_active } = req.body;

      // Récupérer l'opérateur actuel pour l'audit
      const currentResult = await query('SELECT * FROM organizations WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Opérateur non trouvé'
        });
      }

      const oldOperator = currentResult.rows[0];

      // Mise à jour
      const result = await query(
        `UPDATE organizations
         SET name = $1, type = $2, description = $3, logo_url = $4,
             contact_email = $5, contact_phone = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
        [name, type, description, logo_url, contact_email, contact_phone, is_active, id]
      );

      const updatedOperator = result.rows[0];

      // Log d'audit
      await auditLogger(req.user.id, 'UPDATE', 'organizations', id, oldOperator, updatedOperator);

      res.json({
        success: true,
        data: updatedOperator,
        message: 'Opérateur mis à jour avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'opérateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la mise à jour de l\'opérateur'
      });
    }
  }

  // Supprimer un opérateur
  static async deleteOperator(req, res) {
    try {
      const { id } = req.params;

      // Vérifier si l'opérateur a des trajets actifs
      const tripsResult = await query(
        'SELECT COUNT(*) as count FROM trips t JOIN routes r ON t.route_id = r.id WHERE r.organization_id = $1 AND t.status IN (\'scheduled\', \'in_progress\')',
        [id]
      );

      if (parseInt(tripsResult.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Impossible de supprimer un opérateur avec des trajets actifs'
        });
      }

      // Récupérer l'opérateur pour l'audit
      const currentResult = await query('SELECT * FROM organizations WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Opérateur non trouvé'
        });
      }

      const operator = currentResult.rows[0];

      // Suppression en cascade
      await query('DELETE FROM transport_types WHERE organization_id = $1', [id]);
      await query('DELETE FROM routes WHERE organization_id = $1', [id]);
      await query('DELETE FROM organizations WHERE id = $1', [id]);

      // Log d'audit
      await auditLogger(req.user.id, 'DELETE', 'organizations', id, operator, null);

      res.json({
        success: true,
        message: 'Opérateur supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'opérateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la suppression de l\'opérateur'
      });
    }
  }

  // Récupérer les statistiques d'un opérateur
  static async getOperatorStats(req, res) {
    try {
      const { id } = req.params;
      const { period = '30d' } = req.query;

      // Calculer la date de début selon la période
      const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const stats = await query(`
        SELECT
          COUNT(DISTINCT t.id) as total_trips,
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(SUM(b.total_amount), 0) as total_revenue,
          AVG(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as on_time_rate,
          AVG(CASE WHEN b.status = 'confirmed' THEN b.total_amount ELSE 0 END) as avg_booking_value
        FROM organizations o
        LEFT JOIN routes r ON o.id = r.organization_id
        LEFT JOIN trips t ON r.id = t.route_id AND t.departure_time >= $2
        LEFT JOIN bookings b ON t.id = b.trip_id AND b.status = 'confirmed' AND b.created_at >= $2
        WHERE o.id = $1
        GROUP BY o.id
      `, [id, startDate]);

      if (stats.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Opérateur non trouvé'
        });
      }

      res.json({
        success: true,
        data: stats.rows[0],
        period: period
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des statistiques'
      });
    }
  }
}

module.exports = OperatorController;
