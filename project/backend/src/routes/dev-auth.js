/**
 * Routes d'authentification pour le DÉVELOPPEMENT UNIQUEMENT
 * Permet de se connecter sans email/OTP pour tester rapidement
 * ⚠️ NE PAS UTILISER EN PRODUCTION
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const env = require('../config/env');

// Login rapide pour le développement (SANS OTP)
router.post('/quick-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n🔧 DEV LOGIN - Tentative de connexion:', email);
    
    // Vérifier si le profil existe dans la table profiles
    const profileQuery = await pool.query(
      'SELECT id, email, role, full_name, organization_id FROM profiles WHERE email = $1',
      [email]
    );
    
    if (profileQuery.rows.length === 0) {
      console.log('❌ Profil non trouvé. Création automatique...');
      
      // Créer automatiquement le profil avec rôle admin
      const newProfile = await pool.query(
        `INSERT INTO profiles (email, role, full_name, phone, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, email, role, full_name, organization_id`,
        [email, 'admin', email.split('@')[0], '+243 XXX XXX XXX']
      );
      
      const user = newProfile.rows[0];
      console.log('✅ Profil créé:', user);
      
      // Générer le JWT
      const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        organization_id: user.organization_id
      }, env.JWT_SECRET, { expiresIn: '24h' });
      
      return res.json({
        success: true,
        message: '✅ Connexion réussie (profil créé)',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          organization_id: user.organization_id
        },
        redirect: '#/admin'
      });
    }
    
    const user = profileQuery.rows[0];
    console.log('✅ Profil trouvé:', user);
    
    // Générer le JWT
    const token = jwt.sign({
      id: user.id,
      email: user.email,
      name: user.full_name || user.email.split('@')[0],
      role: user.role,
      organization_id: user.organization_id
    }, env.JWT_SECRET, { expiresIn: '24h' });
    
    console.log('✅ Token généré pour:', user.email, 'avec rôle:', user.role);
    
    return res.json({
      success: true,
      message: '✅ Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || user.email.split('@')[0],
        role: user.role,
        organization_id: user.organization_id
      },
      redirect: '#/admin'
    });
  } catch (error) {
    console.error('❌ Erreur dev login:', error);
    return res.status(500).json({ 
      error: 'Erreur de connexion', 
      details: error.message 
    });
  }
});

// Test de token
router.get('/test-token', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ error: 'Pas de token fourni' });
  }
  
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return res.json({
      success: true,
      message: '✅ Token valide',
      decoded
    });
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token invalide', 
      details: error.message 
    });
  }
});

module.exports = router;
