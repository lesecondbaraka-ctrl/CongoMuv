const express = require('express');
const axios = require('axios');
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Test endpoint pour vérifier la connexion Supabase
router.get('/test-supabase', async (req, res) => {
  try {
    const results = {
      supabase_url: SUPABASE_URL ? '✅ Configuré' : '❌ Manquant',
      service_key: SUPABASE_SERVICE_ROLE_KEY ? '✅ Configuré' : '❌ Manquant',
      tests: {}
    };

    // Test 1: Connexion à l'API REST
    try {
      const response = await axios.get(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        }
      });
      results.tests.rest_api = '✅ Connexion OK';
    } catch (error) {
      results.tests.rest_api = `❌ Erreur: ${error.message}`;
    }

    // Test 2: Vérifier la table profiles
    try {
      const response = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        params: { select: 'id,email,role', limit: 1 }
      });
      results.tests.profiles_table = `✅ Table accessible (${response.data?.length || 0} profils)`;
    } catch (error) {
      results.tests.profiles_table = `❌ Erreur: ${error.response?.data?.message || error.message}`;
    }

    // Test 3: Vérifier l'API Auth
    try {
      const response = await axios.get(`${SUPABASE_URL}/auth/v1/health`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY
        }
      });
      results.tests.auth_api = '✅ Auth API OK';
    } catch (error) {
      results.tests.auth_api = `❌ Erreur: ${error.message}`;
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: 'Erreur lors des tests',
      message: error.message
    });
  }
});

// Test de création d'utilisateur (sans vraiment créer)
router.post('/test-signup', async (req, res) => {
  const { email, password, full_name, phone } = req.body;

  const steps = [];

  try {
    // Étape 1: Vérifier si l'email existe déjà
    steps.push({ step: 1, action: 'Vérification email existant', status: 'en cours' });
    const existing = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: { select: 'email', email: `eq.${email}`, limit: 1 }
    });
    
    if (Array.isArray(existing.data) && existing.data.length) {
      steps[0].status = '❌ Email déjà utilisé';
      return res.json({ steps, result: 'Email déjà utilisé' });
    }
    steps[0].status = '✅ Email disponible';

    // Étape 2: Simuler création auth user
    steps.push({ 
      step: 2, 
      action: 'Création utilisateur auth', 
      status: '✅ Prêt (non exécuté en mode test)',
      payload: {
        email,
        password: '***',
        email_confirm: true,
        user_metadata: { full_name, phone }
      }
    });

    // Étape 3: Simuler création profil
    steps.push({ 
      step: 3, 
      action: 'Création profil', 
      status: '✅ Prêt (non exécuté en mode test)',
      payload: {
        email,
        role: 'passenger',
        full_name,
        phone
      }
    });

    res.json({ 
      steps, 
      result: '✅ Tous les tests passés - L\'inscription devrait fonctionner',
      note: 'Aucune donnée n\'a été créée (mode test)'
    });

  } catch (error) {
    steps.push({
      step: 'error',
      action: 'Erreur',
      status: '❌',
      error: error.response?.data || error.message
    });
    res.status(500).json({ steps });
  }
});

module.exports = router;
