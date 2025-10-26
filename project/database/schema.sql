-- CongoMuv E-Ticket Database Schema
-- Script SQL pour initialiser la base de données Supabase
-- Exécuter dans l'éditeur SQL de Supabase

-- ============================================
-- TABLES DE CONFIGURATION
-- ============================================

-- Table des villes
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  timezone VARCHAR(50) DEFAULT 'Africa/Kinshasa',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des types de transport
CREATE TABLE IF NOT EXISTS transport_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(10),
  icon VARCHAR(10),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des opérateurs
CREATE TABLE IF NOT EXISTS operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des routes
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id),
  transport_type_id UUID REFERENCES transport_types(id),
  departure_city_id UUID REFERENCES cities(id),
  arrival_city_id UUID REFERENCES cities(id),
  route_code VARCHAR(20),
  name VARCHAR(100),
  distance_km DECIMAL(8, 2),
  duration_minutes INTEGER,
  base_price DECIMAL(10, 2) NOT NULL,
  stops JSONB, -- Array of {city_id, order, duration_minutes}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des trajets
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES routes(id),
  vehicle_id UUID,
  driver_id UUID,
  departure_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  delay_minutes INTEGER DEFAULT 0,
  cancellation_reason TEXT,
  gate_number VARCHAR(10),
  platform_number VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réservations
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID,
  trip_id UUID REFERENCES trips(id),
  number_of_passengers INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CDF',
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories de sièges
CREATE TABLE IF NOT EXISTS seat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL,
  description TEXT,
  price_multiplier DECIMAL(3, 2) DEFAULT 1.00,
  amenities JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des véhicules
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id),
  vehicle_number VARCHAR(20) UNIQUE NOT NULL,
  model VARCHAR(100),
  year INTEGER,
  total_seats INTEGER NOT NULL,
  amenities JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des conducteurs
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES operators(id),
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(100),
  rating DECIMAL(2, 1) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des prix des sièges par trajet
CREATE TABLE IF NOT EXISTS trip_seat_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  seat_category_id UUID REFERENCES seat_categories(id),
  price DECIMAL(10, 2) NOT NULL,
  available_seats INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des mises à jour de trajets
CREATE TABLE IF NOT EXISTS trip_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),
  update_type VARCHAR(20) NOT NULL, -- 'status_change', 'delay', 'cancellation', etc.
  old_value TEXT,
  new_value TEXT,
  message TEXT,
  created_by UUID, -- user_id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des profils utilisateurs (pour l'authentification)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role VARCHAR(20) DEFAULT 'passenger', -- 'passenger', 'operator', 'admin'
  name VARCHAR(100),
  phone TEXT, -- encrypted
  organization_id UUID REFERENCES operators(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DONNÉES DE BASE
-- ============================================

-- Insérer les villes principales de la RDC
INSERT INTO cities (name, province) VALUES
('Kinshasa', 'Kinshasa'),
('Matadi', 'Kongo-Central'),
('Lubumbashi', 'Haut-Katanga'),
('Mbuji-Mayi', 'Kasaï-Oriental'),
('Kananga', 'Kasaï-Central'),
('Kisangani', 'Tshopo'),
('Bukavu', 'Sud-Kivu'),
('Goma', 'Nord-Kivu'),
('Kolwezi', 'Lualaba'),
('Likasi', 'Haut-Katanga')
ON CONFLICT DO NOTHING;

-- Insérer les types de transport
INSERT INTO transport_types (name, code, icon, description) VALUES
('Bus', 'BUS', '🚌', 'Bus interurbain confortable'),
('Minibus', 'MINI', '🚐', 'Minibus rapide'),
('Taxi', 'TAXI', '🚕', 'Taxi collectif'),
('Train', 'TRAIN', '🚂', 'Transport ferroviaire')
ON CONFLICT DO NOTHING;

-- Insérer les opérateurs
INSERT INTO operators (name, type, contact_email, contact_phone) VALUES
('Transco', 'Bus', 'contact@transco.cd', '+243123456789'),
('Express Congo', 'Minibus', 'contact@express.cd', '+243123456790'),
('Rapide Transport', 'Bus', 'contact@rapide.cd', '+243123456791'),
('Comfort Lines', 'Bus', 'contact@comfort.cd', '+243123456792'),
('Congo Express', 'Minibus', 'contact@congoexpress.cd', '+243123456793')
ON CONFLICT DO NOTHING;

-- Insérer les catégories de sièges
INSERT INTO seat_categories (name, code, description, price_multiplier) VALUES
('Économique', 'ECO', 'Siège standard', 1.00),
('Confort', 'CONF', 'Siège plus large avec plus d''espace', 1.50),
('Premium', 'PREM', 'Siège premium avec services', 2.00),
('VIP', 'VIP', 'Siège VIP avec tous les services', 3.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- POLITIQUES RLS (Row Level Security)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_seat_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour les tables publiques (lecture seule)
CREATE POLICY "Allow public read access to cities" ON cities FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to transport_types" ON transport_types FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to operators" ON operators FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to routes" ON routes FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to trips" ON trips FOR SELECT USING (true);
CREATE POLICY "Allow public read access to seat_categories" ON seat_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to vehicles" ON vehicles FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to drivers" ON drivers FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to trip_seat_prices" ON trip_seat_prices FOR SELECT USING (true);

-- Politiques pour les réservations (utilisateurs authentifiés)
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour les paiements
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.user_id = auth.uid()
  )
);

-- Politiques pour les profils
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour les mises à jour de trajets (opérateurs et admins)
CREATE POLICY "Operators can view trip updates" ON trip_updates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM trips t
    JOIN routes r ON t.route_id = r.id
    JOIN operators o ON r.operator_id = o.id
    JOIN profiles p ON p.organization_id = o.id
    WHERE t.id = trip_updates.trip_id 
    AND p.id = auth.uid()
  )
);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour générer une référence de réservation
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement la référence de réservation
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_reference();

-- ============================================
-- INDEX POUR LES PERFORMANCES
-- ============================================

-- Index sur les colonnes fréquemment utilisées
CREATE INDEX IF NOT EXISTS idx_trips_departure_datetime ON trips(departure_datetime);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_routes_departure_city ON routes(departure_city_id);
CREATE INDEX IF NOT EXISTS idx_routes_arrival_city ON routes(arrival_city_id);
CREATE INDEX IF NOT EXISTS idx_routes_operator_id ON routes(operator_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_operator_id ON vehicles(operator_id);
CREATE INDEX IF NOT EXISTS idx_drivers_operator_id ON drivers(operator_id);
CREATE INDEX IF NOT EXISTS idx_trip_seat_prices_trip_id ON trip_seat_prices(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_updates_trip_id ON trip_updates(trip_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue pour les trajets avec toutes les relations
CREATE OR REPLACE VIEW trips_with_details AS
SELECT 
  t.*,
  r.name as route_name,
  r.distance_km,
  r.duration_minutes,
  r.base_price,
  r.stops,
  dc.name as departure_city,
  ac.name as arrival_city,
  o.name as operator_name,
  o.type as operator_type,
  tt.name as transport_type,
  tt.icon as transport_icon,
  v.vehicle_number,
  v.model as vehicle_model,
  v.total_seats as vehicle_total_seats,
  d.name as driver_name,
  d.rating as driver_rating
FROM trips t
JOIN routes r ON t.route_id = r.id
JOIN cities dc ON r.departure_city_id = dc.id
JOIN cities ac ON r.arrival_city_id = ac.id
JOIN operators o ON r.operator_id = o.id
JOIN transport_types tt ON r.transport_type_id = tt.id
LEFT JOIN vehicles v ON t.vehicle_id = v.id
LEFT JOIN drivers d ON t.driver_id = d.id
WHERE t.status IN ('scheduled', 'boarding');

-- ============================================
-- MESSAGES DE CONFIRMATION
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Schema CongoMuv créé avec succès!';
  RAISE NOTICE 'Tables créées: cities, transport_types, operators, routes, trips, bookings, payments, seat_categories, vehicles, drivers, trip_seat_prices, trip_updates, profiles';
  RAISE NOTICE 'Données de base insérées';
  RAISE NOTICE 'Politiques RLS configurées';
  RAISE NOTICE 'Index et vues créés';
  RAISE NOTICE 'Votre base de données est prête à être utilisée!';
END $$;
