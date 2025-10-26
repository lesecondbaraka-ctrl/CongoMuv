const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Ensure dev-friendly defaults to avoid DB-required startup
if (!process.env.ALLOW_START_WITHOUT_DB) process.env.ALLOW_START_WITHOUT_DB = 'true';
if (!process.env.DB_SKIP_INIT) process.env.DB_SKIP_INIT = 'true';

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const bookingsRoutes = require('./routes/bookings');
const tripsRoutes = require('./routes/trips');
const paymentsRoutes = require('./routes/payments');
const publicRoutes = require('./routes/public');
const adminCrudRoutes = require('./routes/admin_crud');
const debugRoutes = require('./routes/debug');
const ticketsRoutes = require('./routes/tickets');
const trackingRoutes = require('./routes/tracking');
const operatorRoutes = require('./routes/operator');
const adminHQRoutes = require('./routes/admin-hq');
const rolesRoutes = require('./routes/roles');
const dashboardRoutes = require('./routes/dashboard');
const homeRoutes = require('./routes/home');

// Import services
const { initializeDatabase } = require('./config/database');
const { sendOTPEmail } = require('./services/email');

const app = express();
const server = createServer(app);

// Configuration du moteur de vue
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour parser les données des formulaires
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware pour ajouter des variables locales aux vues
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isAuthenticated = !!req.user;
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const env = require('./config/env');
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser clients or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Trop de requêtes depuis cette IP, réessayez plus tard.' }
});
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives de connexion, réessayez plus tard.' }
});
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de tentatives OTP, réessayez plus tard.' }
});
app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/verify-otp', otpLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes principales
app.use('/', homeRoutes);

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin-crud', adminCrudRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/operator', operatorRoutes); // Alias pour la rétrocompatibilité
app.use('/api/admin-hq', adminHQRoutes);
app.use('/api/roles', rolesRoutes);

// Routes des tableaux de bord
app.use('/dashboard', dashboardRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`
  });
});

// Note: global error handler removed due to missing middleware implementation

// Initialize services
async function initializeServices() {
  try {
    if (String(process.env.DB_SKIP_INIT || '').toLowerCase() === 'true') {
      console.warn('⚠️ DB initialization skipped due to DB_SKIP_INIT=true');
    } else {
      try {
        await initializeDatabase();
      } catch (dbErr) {
        if (String(process.env.ALLOW_START_WITHOUT_DB || '').toLowerCase() === 'true') {
          console.warn('⚠️ DB init failed but continuing because ALLOW_START_WITHOUT_DB=true:', dbErr.message || dbErr);
        } else {
          throw dbErr;
        }
      }
    }

    // Test OTP email (optionnel)
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
    ) {
      try {
        await sendOTPEmail(process.env.EMAIL_USER, '123456');
        console.log('📧 Test OTP envoyé à ton email');
      } catch (e) {
        console.warn('⚠️ Impossible d\'envoyer l\'email de test OTP:', e.message);
      }
    }

    // Validate critical ENV (non-blocking warnings)
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants. Les routes /api/auth utiliseront des comportements limités.');
    }
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET manquant. Les tokens signés ne seront pas sécurisés en production.');
    }

    console.log('✅ Tous les services ont été initialisés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des services:', error);
    process.exit(1);
  }
}

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🔗 Nouveau client connecté:', socket.id);

  socket.on('join-trip', (tripId) => {
    socket.join(`trip-${tripId}`);
    console.log(`Client ${socket.id} a rejoint le trajet ${tripId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client déconnecté:', socket.id);
  });
});

global.io = io;

let desiredPort = Number(env.PORT) || 3002;

async function startServer() {
  try {
    await initializeServices();

    server.listen(desiredPort, () => {
      console.log(`🚀 Serveur CongoMuv démarré sur le port ${desiredPort}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL (CORS): ${env.FRONTEND_URL || 'http://localhost:5173'}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`❌ Le port ${desiredPort} est déjà utilisé. Définissez une autre valeur dans backend/.env (PORT) et redémarrez.`);
      } else {
        console.error('❌ Erreur lors du démarrage du serveur:', err);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt gracieux...');
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});

startServer();

module.exports = { app, server, io };
