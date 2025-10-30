const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/email');
const env = require('../config/env');
const { getDashboardByRole } = require('../utils/roleUtils');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = env.JWT_SECRET;

// Inscription nouvel utilisateur
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, organization_id } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    // Vérifier si le profil existe déjà
    const { data: profiles } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: { select: 'id,email', email: `eq.${normalizedEmail}`, limit: 1 },
    });
    if (profiles && profiles.length > 0) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
    }


    // Créer utilisateur dans Supabase Auth et récupérer l'id
    // Créer utilisateur dans Supabase Auth via l'API admin pour email confirmé
    const signupRes = await axios.post(`${SUPABASE_URL}/auth/v1/admin/users`, {
      email: normalizedEmail,
      password,
      email_confirm: true
    }, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Récupérer l'id utilisateur Supabase
    const userId = signupRes?.data?.user?.id || signupRes?.data?.id;
    if (!userId) {
      return res.status(500).json({ error: "Impossible de récupérer l'id utilisateur Supabase." });
    }

    // Créer le profil utilisateur avec l'id Supabase
    await axios.post(`${SUPABASE_URL}/rest/v1/profiles`, {
      id: userId,
      email: normalizedEmail,
      full_name: full_name || null,
      phone: phone || null,
      role: 'passenger',
      organization_id: organization_id || null
    }, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
    });

    return res.status(201).json({ success: true, message: 'Inscription réussie. Vous pouvez vous connecter.' });
  } catch (error) {
    // Log complet pour debug
    console.error('Erreur inscription:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    const detail = error.response?.data?.error || error.response?.data?.message || error.message;
    return res.status(500).json({ error: `Erreur lors de l'inscription: ${detail}` });
  }
});

// Connexion avec email/password et génération code OTP pour 2FA
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    // Récupérer le profil pour obtenir le rôle et l'organisation
    const { data: profiles } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: { select: 'id,email,role,organization_id', email: `eq.${normalizedEmail}`, limit: 1 },
    });

    if (!profiles || profiles.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }
    const profile = profiles[0];

    // Vérification des identifiants côté Supabase Auth
    let tokenRes;
    try {
      tokenRes = await axios.post(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        { email: normalizedEmail, password },
        { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('Erreur login Supabase:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
      return res.status(401).json({ error: 'Email ou mot de passe invalide (Supabase)', details: err.response?.data });
    }

    // Générer et envoyer OTP par mail
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Nettoyer anciens codes OTP non utilisés
    await axios.delete(`${SUPABASE_URL}/rest/v1/otp_codes`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
      },
      params: { email: `eq.${normalizedEmail}`, verified: 'is.false' },
    });

    await axios.post(
      `${SUPABASE_URL}/rest/v1/otp_codes`,
      { email: normalizedEmail, code, expires_at: expires, verified: false },
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
          'Content-Type': 'application/json',
        },
      }
    );

    const emailSent = await sendOTPEmail(normalizedEmail, code);
    if (!emailSent) {
      return res.status(500).json({ error: "Impossible d'envoyer le code OTP." });
    }

    return res.status(200).json({
      success: true,
      message: 'Vérification OTP envoyée.',
      ...(process.env.NODE_ENV === 'development' && { debug_code: code }),
    });
  } catch (error) {
    console.error('Erreur login:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    return res.status(401).json({ error: 'Email ou mot de passe invalide.' });
  }
});

// Vérification OTP et génération du JWT avec le rôle et l'organisation en claims
router.post('/verify-otp', async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const inputCode = String(req.body.code || '').trim();
    const nowISO = new Date().toISOString();

    // Récupération du profil utilisateur
    const { data: profiles } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: { select: 'id,email,role,organization_id,full_name', email: `eq.${normalizedEmail}`, limit: 1 },
    });
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ error: 'Aucun compte trouvé.' });
    }
    const user = profiles[0];

    // Vérification OTP non expiré
    const { data: otpRecords } = await axios.get(`${SUPABASE_URL}/rest/v1/otp_codes`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      params: { select: '*', email: `eq.${normalizedEmail}`, code: `eq.${inputCode}`, verified: 'is.false', expires_at: `gt.${nowISO}`, order: 'created_at.desc', limit: 1 },
    });
    if (!otpRecords || otpRecords.length === 0) {
      return res.status(401).json({ error: 'Code OTP invalide ou expiré.' });
    }

    // Marquer OTP comme utilisé
    await axios.patch(`${SUPABASE_URL}/rest/v1/otp_codes?id=eq.${otpRecords[0].id}`, { verified: true }, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: 'return=minimal',
        'Content-Type': 'application/json',
      },
    });

    // Générer JWT avec claims clairs rôle et orga
    const userRole = (user.role || 'user').trim().toLowerCase();
    const organizationId = user.organization_id || null;

    const token = jwt.sign({
      id: user.id,
      email: user.email,
      name: user.full_name || user.email.split('@')[0],
      role: userRole,
      organization_id: organizationId
    }, JWT_SECRET, { expiresIn: '24h' });

    const dashboard = getDashboardByRole(userRole);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || user.email.split('@')[0],
        role: userRole,
        organization_id: organizationId
      },
      redirect: dashboard
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur lors de la vérification OTP.' });
  }
});

module.exports = router;
