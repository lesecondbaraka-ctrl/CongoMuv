const { Pool } = require('pg');
require('dotenv').config();

const useSSL = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'congomuv',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test de connexion
pool.on('connect', (client) => {
  console.log('🔗 Nouvelle connexion à la base de données PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('❌ Erreur de connexion à la base de données:', err);
});

// Fonction d'initialisation de la base de données
async function initializeDatabase() {
  try {
    // Test de connexion
    const client = await pool.connect();

    // Assurer la présence de l'extension pgcrypto pour gen_random_uuid()
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    } catch (e) {
      console.warn('⚠️ Impossible de créer l\'extension pgcrypto (peut nécessiter des privilèges SUPERUSER):', e.message);
    }

    // Vérifier si les tables existent, sinon les créer
    await createTablesIfNotExist(client);

    client.release();
    console.log('✅ Base de données initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Création des tables si elles n'existent pas
async function createTablesIfNotExist(client) {
  const tables = [
    // Utilisateurs
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      full_name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      organization_id UUID,
      is_active BOOLEAN DEFAULT true,
      two_factor_enabled BOOLEAN DEFAULT false,
      two_factor_secret VARCHAR(255),
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Organisations/Opérateurs
    `CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      logo_url VARCHAR(500),
      contact_email VARCHAR(255),
      contact_phone VARCHAR(20),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Types de transport
    `CREATE TABLE IF NOT EXISTS transport_types (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      icon VARCHAR(100),
      description TEXT,
      organization_id UUID REFERENCES organizations(id),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Routes
    `CREATE TABLE IF NOT EXISTS routes (
      id SERIAL PRIMARY KEY,
      organization_id UUID REFERENCES organizations(id),
      transport_type_id INTEGER REFERENCES transport_types(id),
      departure_city VARCHAR(255) NOT NULL,
      arrival_city VARCHAR(255) NOT NULL,
      distance_km DECIMAL(10,2),
      estimated_duration_minutes INTEGER,
      base_price DECIMAL(10,2) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Trajets
    `CREATE TABLE IF NOT EXISTS trips (
      id SERIAL PRIMARY KEY,
      route_id INTEGER REFERENCES routes(id),
      departure_time TIMESTAMP NOT NULL,
      arrival_time TIMESTAMP NOT NULL,
      vehicle_number VARCHAR(100) NOT NULL,
      total_seats INTEGER NOT NULL,
      available_seats INTEGER NOT NULL,
      status VARCHAR(50) DEFAULT 'scheduled',
      driver_name VARCHAR(255),
      current_location JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Réservations
    `CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      trip_id INTEGER REFERENCES trips(id),
      status VARCHAR(50) DEFAULT 'pending',
      booking_reference VARCHAR(100) UNIQUE NOT NULL,
      number_of_passengers INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_status VARCHAR(50) DEFAULT 'pending',
      payment_reference VARCHAR(255),
      payment_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Passagers des réservations
    `CREATE TABLE IF NOT EXISTS booking_passengers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID REFERENCES bookings(id),
      full_name VARCHAR(255) NOT NULL,
      age INTEGER,
      phone VARCHAR(20),
      id_card VARCHAR(100),
      seat_number VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Paiements
    `CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID REFERENCES bookings(id),
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'CDF',
      payment_method VARCHAR(50) NOT NULL,
      payment_provider VARCHAR(100),
      transaction_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',
      payment_data JSONB,
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Notifications
    `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSONB,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Audit logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(100),
      resource_id VARCHAR(255),
      old_values JSONB,
      new_values JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Sessions utilisateurs
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      token VARCHAR(500) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      ip_address INET,
      user_agent TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of tables) {
    await client.query(query);
  }

  // Création des index pour les performances
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
    'CREATE INDEX IF NOT EXISTS idx_trips_departure_time ON trips(departure_time)',
    'CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id)',
    'CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)',
    'CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)'
  ];

  for (const query of indexes) {
    await client.query(query);
  }

  console.log('✅ Tables et index créés avec succès');
}

// Fonction utilitaire pour exécuter des requêtes
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query exécutée:', { text, duration: `${duration}ms`, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Erreur de requête:', error);
    throw error;
  }
}

// Fonction pour fermer proprement le pool de connexions
async function closeDatabase() {
  await pool.end();
  console.log('🔌 Connexion à la base de données fermée');
}

module.exports = {
  pool,
  query,
  initializeDatabase,
  closeDatabase
};
