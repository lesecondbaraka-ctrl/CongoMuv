const express = require('express');
const axios = require('axios');
const router = express.Router();
const env = require('../config/env');
const { verifyJWT } = require('../middleware/auth');

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const { generateTicketPDF } = require('../services/ticket');
const { sendOTPEmail } = require('../services/email');

// Create a booking for the current user
router.post('/', verifyJWT, async (req, res) => {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    const { trip_id, passenger_count } = req.body || {};
    const count = Number(passenger_count || 1);
    if (!trip_id || count <= 0) return res.status(400).json({ error: 'trip_id et passenger_count requis' });

    // Fetch user id from auth via profiles
    const prof = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      params: { select: 'id,email', email: `eq.${email}`, limit: 1 }
    });
    const userId = Array.isArray(prof.data) && prof.data.length ? prof.data[0].id : null;
    if (!userId) return res.status(400).json({ error: 'Profil utilisateur introuvable' });

    // Get trip info with ETag for optimistic concurrency control
    const tripRes = await axios.get(`${SUPABASE_URL}/rest/v1/trips`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/vnd.pgrst.object+json'
      },
      params: { select: 'id,available_seats,total_seats,price,status,is_active', id: `eq.${trip_id}` }
    });
    const tripEtag = tripRes.headers?.etag;
    const trip = tripRes.data;
    if (!trip || !trip.id) return res.status(404).json({ error: 'Voyage introuvable' });
    if (trip.is_active === false || String(trip.status).toLowerCase() === 'cancelled') {
      return res.status(400).json({ error: 'Voyage inactif ou annulé' });
    }
    if (Number(trip.available_seats) < count) return res.status(400).json({ error: 'Pas assez de places disponibles' });

    const totalPrice = Number(trip.price) * count;

    // Insert booking
    const bookingInsert = await axios.post(`${SUPABASE_URL}/rest/v1/bookings`, {
      user_id: userId,
      trip_id,
      passenger_count: count,
      total_price: totalPrice,
      status: 'pending'
    }, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Atomic availability update using If-Match with ETag
    const newAvail = Number(trip.available_seats) - count;
    try {
      await axios.patch(`${SUPABASE_URL}/rest/v1/trips?id=eq.${trip_id}`, { available_seats: newAvail }, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'return=minimal',
          'If-Match': tripEtag || '*'
        }
      });
    } catch (err) {
      // 412 means ETag mismatch -> concurrent update occurred
      if (err?.response?.status === 412) {
        return res.status(409).json({ error: 'Conflit de réservation: les places viennent d\'être mises à jour. Réessayez.' });
      }
      throw err;
    }

    return res.status(201).json({ booking: Array.isArray(bookingInsert.data) ? bookingInsert.data[0] : bookingInsert.data, available_seats: newAvail });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur lors de la réservation' });
  }
});

// List bookings for current user
router.get('/me', verifyJWT, async (req, res) => {
  try {
    console.log('Début de la récupération des réservations pour l\'utilisateur:', req.user?.email);
    const email = String(req.user?.email || '').toLowerCase();
    console.log('Email normalisé:', email);
    
    // Récupérer l'ID du profil utilisateur
    const prof = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: { 
        apikey: SUPABASE_SERVICE_ROLE_KEY, 
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` 
      },
      params: { 
        select: 'id', 
        email: `eq.${email}`, 
        limit: 1 
      }
    });
    
    console.log('Réponse de la requête de profil:', {
      status: prof.status,
      data: prof.data,
      config: { url: prof.config.url, params: prof.config.params }
    });
    
    const userId = Array.isArray(prof.data) && prof.data.length ? prof.data[0].id : null;
    console.log('ID utilisateur trouvé:', userId);
    
    if (!userId) {
      console.error('Aucun profil trouvé pour l\'email:', email);
      return res.status(400).json({ error: 'Profil utilisateur introuvable' });
    }

    // Fetch bookings with trip and route info via nested selects
    console.log('Récupération des réservations pour l\'utilisateur ID:', userId);
    
    // D'abord, récupérer les réservations de base
    console.log('Récupération des réservations de base...');
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/bookings`, {
      headers: { 
        apikey: SUPABASE_SERVICE_ROLE_KEY, 
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` 
      },
      params: {
        select: 'id,trip_id,passenger_count,total_price,status,created_at',
        user_id: `eq.${userId}`,
        order: 'created_at.desc'
      }
      });
      
      console.log('Réponse des réservations:', {
        status: response.status,
        data: response.data,
        config: { url: response.config.url, params: response.config.params }
      });
      
      const bookings = Array.isArray(response.data) ? response.data : [];
      console.log(`Nombre de réservations trouvées: ${bookings.length}`);
      
      if (bookings.length === 0) {
        return res.json({ items: [] });
      }
      
      // Pour chaque réservation, récupérer les détails du voyage
      console.log('Récupération des détails des voyages...');
      const items = [];
      
      for (const booking of bookings) {
        try {
          if (!booking.trip_id) {
            console.warn('Réservation sans trip_id:', booking.id);
            continue;
          }
          
          // Récupérer les détails du voyage
          console.log(`Récupération du voyage ${booking.trip_id} pour la réservation ${booking.id}`);
          const tripResponse = await axios.get(`${SUPABASE_URL}/rest/v1/trips`, {
            headers: { 
              apikey: SUPABASE_SERVICE_ROLE_KEY, 
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` 
            },
            params: {
              select: 'id,departure_datetime,arrival_datetime,route_id',
              id: `eq.${booking.trip_id}`,
              limit: 1
            }
          });
          
          const trip = Array.isArray(tripResponse.data) ? tripResponse.data[0] : null;
          
          if (!trip) {
            console.warn(`Aucun voyage trouvé pour l'ID: ${booking.trip_id}`);
            continue;
          }
          
          let route = null;
          
          if (trip.route_id) {
            // Récupérer les détails de l'itinéraire
            console.log(`Récupération de l'itinéraire ${trip.route_id} pour le voyage ${trip.id}`);
            const routeResponse = await axios.get(`${SUPABASE_URL}/rest/v1/routes`, {
              headers: { 
                apikey: SUPABASE_SERVICE_ROLE_KEY, 
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` 
              },
              params: {
                select: 'id,name,operator_id',
                id: `eq.${trip.route_id}`,
                limit: 1
              }
            });
            
            route = Array.isArray(routeResponse.data) ? routeResponse.data[0] : null;
          }
          
          items.push({
            id: booking.id,
            trip_id: booking.trip_id,
            passenger_count: booking.passenger_count,
            total_price: booking.total_price,
            status: booking.status,
            created_at: booking.created_at,
            trip: {
              id: trip.id,
              departure_time: trip.departure_datetime,
              arrival_time: trip.arrival_datetime,
              route: route ? {
                id: route.id,
                name: route.name,
                operator_id: route.operator_id
              } : null
            }
          });
        } catch (error) {
          console.error(`Erreur lors du traitement de la réservation ${booking.id}:`, error);
          // On continue avec les autres réservations même en cas d'erreur sur une seule
        }
      }
      
      // Retourner les réservations formatées
      return res.json({ items });
      
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du chargement des réservations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

// Generate and return ticket PDF, also email it to the user
router.post('/:id/ticket', verifyJWT, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const email = String(req.user?.email || '').toLowerCase();

    // Load profile (for name) and user id
    const prof = await axios.get(`${SUPABASE_URL}/rest/v1/profiles`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      params: { select: 'id,email,full_name', email: `eq.${email}`, limit: 1 }
    });
    const profile = Array.isArray(prof.data) && prof.data[0] ? prof.data[0] : { email };
    const userId = profile?.id;

    // Load booking with trip and route
    const bk = await axios.get(`${SUPABASE_URL}/rest/v1/bookings`, {
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
      params: {
        select: 'id,trip_id,passenger_count,total_price,status,created_at, trips:trip_id(id,departure_datetime,arrival_datetime,route_id, routes:route_id(id,name,operator_id,departure_city,arrival_city))',
        id: `eq.${bookingId}`,
        limit: 1
      }
    });
    if (!Array.isArray(bk.data) || !bk.data.length) return res.status(404).json({ error: 'Réservation introuvable' });
    const booking = bk.data[0];
    const trip = booking.trips || null;
    const route = trip?.routes || null;

    // Compose PDF
    const pdf = await generateTicketPDF({ booking: {
      id: booking.id,
      trip_id: booking.trip_id,
      passenger_count: booking.passenger_count,
      total_price: booking.total_price,
      status: booking.status,
      created_at: booking.created_at
    }, trip: trip ? {
      departure_datetime: trip.departure_datetime,
      arrival_datetime: trip.arrival_datetime
    } : null, route: route ? {
      name: route.name,
      departure_city: route.departure_city,
      arrival_city: route.arrival_city
    } : null, user: { email, full_name: profile?.full_name || null } });

    // Send email with PDF attached (reuse transporter via sendOTPEmail signature by adding attachment)
    try {
      const transport = require('nodemailer').createTransport({
        host: env.EMAIL_HOST,
        port: parseInt(env.EMAIL_PORT),
        secure: false,
        auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS }
      });
      await transport.sendMail({
        from: `CongoMuv <${env.EMAIL_USER}>`,
        to: email,
        subject: 'Votre billet électronique CongoMuv',
        text: 'Veuillez trouver votre billet en pièce jointe.',
        attachments: [ { filename: `ticket_${bookingId}.pdf`, content: pdf } ]
      });
    } catch (e) {
      // Continue even if email fails; user still gets the file download
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket_${bookingId}.pdf"`);
    return res.status(200).send(pdf);
  } catch (e) {
    return res.status(500).json({ error: 'Erreur génération du billet' });
  }
});
