const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/email');
const env = require('../config/env');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = env.JWT_SECRET;

// 🔐 Connexion utilisateur
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    // 1. Vérifier d'abord si l'utilisateur existe dans la table profiles
    const { data: profiles } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: 'id,email,role',
        email: `eq.${normalizedEmail}`,
        limit: 1
      }
    });

    if (!profiles || profiles.length === 0) {
      console.log('Aucun utilisateur trouvé avec cet email:', normalizedEmail);
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }

    const user = profiles[0];
    console.log('Utilisateur trouvé:', user);

    // 2. Authentifier avec Supabase
    try {
      const { data } = await axios.post(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        { email: normalizedEmail, password },
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Authentification réussie avec Supabase');
      
      // 3. Générer un code OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // 4. Supprimer les anciens codes OTP non vérifiés
      await axios.delete(`${SUPABASE_URL}/rest/v1/otp_codes`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal'
        },
        params: {
          email: `eq.${normalizedEmail}`,
          verified: 'is.false'
        }
      });

      // 5. Enregistrer le nouveau code OTP
      await axios.post(
        `${SUPABASE_URL}/rest/v1/otp_codes`,
        {
          email: normalizedEmail,
          code,
          expires_at: expires,
          verified: false
        },
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'return=minimal',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Code OTP généré pour:', normalizedEmail);
      
      try {
        // Envoyer l'email avec le code OTP
        const emailSent = await sendOTPEmail(normalizedEmail, code);
        
        if (emailSent) {
          console.log('✅ Email OTP envoyé avec succès à:', normalizedEmail);
          return res.status(200).json({ 
            success: true,
            message: 'Un code de vérification a été envoyé à votre adresse email',
            // En développement, on peut renvoyer le code pour faciliter les tests
            ...(process.env.NODE_ENV === 'development' && { debug_code: code })
          });
        } else {
          console.error('❌ Échec de l\'envoi de l\'email OTP à:', normalizedEmail);
          return res.status(500).json({
            success: false,
            error: 'Impossible d\'envoyer le code de vérification. Veuillez réessayer plus tard.'
          });
        }
      } catch (emailError) {
        console.error('❌ Erreur lors de l\'envoi de l\'email OTP:', emailError);
        return res.status(500).json({
          success: false,
          error: 'Une erreur est survenue lors de l\'envoi du code de vérification',
          // En développement, on peut renvoyer le code même en cas d'erreur d'envoi
          ...(process.env.NODE_ENV === 'development' && { debug_code: code })
        });
      }

    } catch (authError) {
      console.error('Erreur d\'authentification avec Supabase:', {
        error: authError.response?.data || authError.message,
        email: normalizedEmail
      });
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }
  } catch (error) {
    console.error('Erreur login:', {
      email: normalizedEmail,
      error: error.response?.data || error.message
    });
    res.status(401).json({ error: 'Email ou mot de passe invalide' });
  }
});

// ✍️ Inscription voyageur (traveler signup)
router.post('/signup', async (req, res) => {
  try {
    console.log('📝 Requête d\'inscription reçue:', {
      email: req.body?.email,
      hasPassword: !!req.body?.password,
      full_name: req.body?.full_name,
      phone: req.body?.phone
    });

    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '').trim();
    const full_name = req.body?.full_name ? String(req.body.full_name).trim() : null;
    const phone = req.body?.phone ? String(req.body.phone).trim() : null;

    if (!email || !password) {
      console.error('❌ Champs manquants:', { email: !!email, password: !!password });
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Vérifier si un profil existe déjà
    console.log('🔍 Vérification de l\'existence du profil...');
    let existing;
    try {
      existing = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        params: { 
          select: 'email', 
          email: `eq.${email}`, 
          limit: 1 
        },
        timeout: 10000 // 10 secondes de timeout
      });
      
      if (Array.isArray(existing.data) && existing.data.length) {
        console.log('❌ Un compte existe déjà avec cet email:', email);
        return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
      }
    } catch (checkError) {
      console.error('❌ Erreur lors de la vérification du profil existant:', {
        message: checkError.message,
        response: checkError.response?.data,
        status: checkError.response?.status
      });
      return res.status(500).json({ 
        error: 'Erreur lors de la vérification du compte',
        details: checkError.message
      });
    }

    let userId;
    
    // Étape 1: Créer l'utilisateur dans Supabase Auth (Admin API)
    try {
      const authResponse = await axios.post(`${SUPABASE_URL}/auth/v1/admin/users`, {
        email, 
        password, 
        email_confirm: true,
        user_metadata: {
          full_name: full_name || '',
          phone: phone || ''
        }
      }, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      userId = authResponse.data?.id;
      if (!userId) {
        throw new Error('Impossible de récupérer l\'ID utilisateur');
      }
      console.log(`✅ Auth user créé: ${email} (ID: ${userId})`);
    } catch (authError) {
      console.error('❌ Erreur création auth:', authError.response?.data || authError.message);
      throw new Error('Échec de création du compte d\'authentification');
    }

    // Étape 2: Créer le profil avec rôle 'passenger'
    try {
      await axios.post(`${SUPABASE_URL}/rest/v1/profiles`, {
        id: userId,
        email,
        role: 'passenger',
        full_name: full_name || null,
        phone: phone || null
      }, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Profil créé pour: ${email}`);
    } catch (profileError) {
      console.error('❌ Erreur création profil:', profileError.response?.data || profileError.message);
      // Le compte auth existe mais pas le profil - on continue quand même
      console.warn('⚠️ Compte créé mais profil incomplet pour:', email);
    }

    return res.status(201).json({ message: 'Compte créé avec succès', userId });
  } catch (error) {
    const detail = error.response?.data || error.message;
    const errorMsg = JSON.stringify(detail);
    console.error('❌ Erreur signup complète:', errorMsg);
    console.error('Stack:', error.stack);
    
    if (String(detail).includes('duplicate') || String(detail).includes('already exists')) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
    }
    
    // Return more detailed error for debugging
    return res.status(500).json({ 
      error: 'Erreur serveur lors de l\'inscription',
      details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
    });
  }
});
router.post('/verify-otp', async (req, res) => {
  const normalizedEmail = String(req.body?.email || '').trim().toLowerCase();
  const inputCode = String(req.body?.code || '').trim();
  const nowISO = new Date().toISOString();

  try {
    // 1. Vérifier d'abord si l'utilisateur existe
    const { data: profiles } = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: 'id,email,role,full_name,organization_id',
        email: `eq.${normalizedEmail}`,
        limit: 1
      }
    });

    if (!profiles || profiles.length === 0) {
      console.log('Aucun utilisateur trouvé avec cet email pour la vérification OTP:', normalizedEmail);
      
      // Log de l'échec de connexion
      try {
        await axios.post(`${SUPABASE_URL}/rest/v1/login_logs`, {
          email: normalizedEmail,
          ip_address: req.ip,
          user_agent: `${req.headers['user-agent'] || ''} | OTP_FAILED:user_not_found`
        }, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'return=minimal'
          }
        });
      } catch (e) { /* ignore audit failure */ }
      
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' });
    }

    const user = profiles[0];
    console.log('Utilisateur trouvé pour vérification OTP:', user);

    // 2. Vérifier le code OTP
    const { data: otpRecords } = await axios.get(`${SUPABASE_URL}/rest/v1/otp_codes`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      params: {
        select: '*',
        email: `eq.${normalizedEmail}`,
        code: `eq.${inputCode}`,
        verified: 'is.false',
        expires_at: `gt.${nowISO}`,
        order: 'created_at.desc',
        limit: 1
      }
    });

    if (!otpRecords || otpRecords.length === 0) {
      console.log('Code OTP invalide ou expiré pour:', normalizedEmail);
      
      // Log de l'échec de l'OTP
      try {
        await axios.post(`${SUPABASE_URL}/rest/v1/login_logs`, {
          email: normalizedEmail,
          ip_address: req.ip,
          user_agent: `${req.headers['user-agent'] || ''} | OTP_FAILED:invalid_or_expired`
        }, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: 'return=minimal'
          }
        });
      } catch (e) { /* ignore audit failure */ }
      
      return res.status(401).json({ error: 'Code de vérification invalide ou expiré' });
    }

    const otpRecord = otpRecords[0];
    console.log('Code OTP valide trouvé pour:', normalizedEmail);

    // 3. Marquer le code OTP comme utilisé
    await axios.patch(
      `${SUPABASE_URL}/rest/v1/otp_codes?id=eq.${otpRecord.id}`,
      { verified: true },
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
          'Content-Type': 'application/json'
        }
      }
    );

    // 4. Récupérer et valider le rôle de l'utilisateur
    let userRole = (user.role || 'passenger').trim().toLowerCase();
    
    // Définir les rôles valides selon votre schéma
    const validRoles = ['superadmin', 'admin', 'operator', 'passenger', 'user'];
    
    // Si le rôle n'est pas valide, utiliser 'user' par défaut
    if (!validRoles.includes(userRole)) {
      console.warn(`Rôle invalide '${userRole}' pour l'utilisateur ${user.email}, utilisation de 'user' par défaut`);
      userRole = 'user';
    }
    
    const organizationId = user.organization_id || null;

    // 5. Récupérer les informations d'organisation si nécessaire
    const orgId = user.organization_id || null;
    
    // 6. Créer le token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email || normalizedEmail,
        name: user.full_name || user.name || (user.email ? user.email.split('@')[0] : 'Utilisateur'),
        role: userRole,
        organizationId: organizationId,
        // Inclure des métadonnées supplémentaires si nécessaire
        permissions: {
          canAccessAdmin: ['superadmin', 'admin'].includes(userRole.toLowerCase()),
          canManageUsers: ['superadmin', 'admin'].includes(userRole.toLowerCase()),
          canManageBookings: true,
          canViewReports: ['superadmin', 'admin', 'operator'].includes(userRole.toLowerCase())
        },
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 6. Journaliser la connexion réussie
    try {
      await axios.post(`${SUPABASE_URL}/rest/v1/login_logs`, {
        email: normalizedEmail,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        status: 'success',
        role: userRole
      }, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal'
        }
      });
    } catch (e) { 
      console.warn('Échec de la journalisation de la connexion:', e.message);
    }

    console.log('Connexion réussie pour:', user.email);

    // 7. Récupérer le tableau de bord approprié en fonction du rôle
    const { getDashboardByRole } = require('../utils/roleUtils');
    // Utilisation de la variable userRole déjà définie plus haut
    const dashboard = getDashboardByRole(userRole);
    
    // 8. Construire la réponse avec les informations utilisateur et de redirection
    const response = {
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email || normalizedEmail,
        name: user.full_name || user.name || (user.email ? user.email.split('@')[0] : 'Utilisateur'),
        role: userRole,
        organizationId: organizationId,
        permissions: {
          canAccessAdmin: ['super_admin', 'admin'].includes(userRole.toLowerCase()),
          canManageUsers: ['super_admin', 'admin'].includes(userRole.toLowerCase()),
          canManageBookings: true,
          canViewReports: ['super_admin', 'admin', 'operator'].includes(userRole.toLowerCase())
        }
      },
      redirect: {
        path: dashboard.path,
        name: dashboard.name,
        requiresSetup: dashboard.requiresSetup
      },
      // Pour la rétrocompatibilité
      redirectTo: dashboard.path
    };
    
    console.log('Réponse de connexion:', {
      userId: user.id,
      role: userRole,
      redirectTo: dashboard.path,
      hasAdminAccess: response.user.permissions.canAccessAdmin
    });
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Erreur vérification OTP:', {
      email: normalizedEmail,
      error: error.response?.data || error.message
    });
    // Audit: OTP failed due to server error
    try {
      await axios.post(`${SUPABASE_URL}/rest/v1/login_logs`, {
        email: normalizedEmail,
        ip_address: req.ip,
        user_agent: `${req.headers['user-agent'] || ''} | OTP_FAILED:server_error`
      }, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal'
        }
      });
    } catch (e) { /* ignore audit failure */ }
    res.status(500).json({ error: 'Erreur serveur lors de la vérification' });
  }
});

module.exports = router;
