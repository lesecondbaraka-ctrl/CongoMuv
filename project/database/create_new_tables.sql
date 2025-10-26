-- ================================================
-- Script de création des nouvelles tables
-- Module Passager - Fonctionnalités manquantes
-- ================================================

-- Table: tickets (Tickets numériques avec QR Code)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  ticket_reference TEXT UNIQUE NOT NULL,
  qr_code TEXT NOT NULL, -- Base64 encoded QR Code
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  passenger_email TEXT,
  passenger_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used', 'cancelled'))
);

-- Index sur booking_id pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tickets_booking_id ON tickets(booking_id);
-- Index sur ticket_reference pour validation QR Code
CREATE INDEX IF NOT EXISTS idx_tickets_reference ON tickets(ticket_reference);
-- Index sur status pour filtres
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ================================================

-- Table: vehicle_tracking (Suivi GPS en temps réel)
CREATE TABLE IF NOT EXISTS vehicle_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  speed NUMERIC(6, 2) DEFAULT 0, -- km/h
  heading NUMERIC(5, 2) DEFAULT 0, -- Direction en degrés (0-360)
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'en_route', 'arrived', 'delayed')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index sur vehicle_id pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_tracking_vehicle_id ON vehicle_tracking(vehicle_id);
-- Index sur trip_id pour recherche par trajet
CREATE INDEX IF NOT EXISTS idx_tracking_trip_id ON vehicle_tracking(trip_id);
-- Index sur timestamp pour historique
CREATE INDEX IF NOT EXISTS idx_tracking_timestamp ON vehicle_tracking(timestamp DESC);
-- Index composé pour dernière position d'un véhicule
CREATE INDEX IF NOT EXISTS idx_tracking_vehicle_timestamp ON vehicle_tracking(vehicle_id, timestamp DESC);

-- ================================================

-- Table: support_tickets (Tickets de support)
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Référence à auth.users(id) sans FK (Supabase Auth)
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index sur user_id pour tickets par utilisateur
CREATE INDEX IF NOT EXISTS idx_support_user_id ON support_tickets(user_id);
-- Index sur booking_id pour tickets liés à une réservation
CREATE INDEX IF NOT EXISTS idx_support_booking_id ON support_tickets(booking_id);
-- Index sur status pour filtres
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
-- Index sur priority pour triage
CREATE INDEX IF NOT EXISTS idx_support_priority ON support_tickets(priority);

-- ================================================

-- Fonction trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour support_tickets
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================

-- Ajouter la colonne vehicle_id à la table trips si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'trips' 
        AND column_name = 'vehicle_id'
    ) THEN
        ALTER TABLE trips ADD COLUMN vehicle_id TEXT;
        CREATE INDEX idx_trips_vehicle_id ON trips(vehicle_id);
    END IF;
END $$;

-- ================================================

-- Données de test pour le développement (optionnel)
-- Décommenter pour insérer des données de test

/*
-- Insérer une position GPS de test
-- Note: Remplacer les UUID par de vrais IDs de trips existants
INSERT INTO vehicle_tracking (vehicle_id, trip_id, latitude, longitude, speed, heading, status, timestamp)
VALUES 
  ('VEH-001', 'votre-trip-id-uuid'::UUID, -4.3276, 15.3136, 45, 180, 'en_route', NOW()),
  ('VEH-002', NULL, -4.4419, 15.2663, 60, 90, 'en_route', NOW());

-- Insérer un ticket de support de test
-- Note: Remplacer 'votre-user-id-uuid' par un vrai UUID de auth.users
INSERT INTO support_tickets (user_id, subject, message, status, priority)
VALUES (
  'votre-user-id-uuid'::UUID,
  'Test de support',
  'Ceci est un message de test pour le système de support.',
  'open',
  'medium'
);
*/

-- ================================================

-- Afficher les tables créées
SELECT 
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tickets', 'vehicle_tracking', 'support_tickets')
ORDER BY tablename;

-- ================================================
-- Fin du script
-- ================================================
