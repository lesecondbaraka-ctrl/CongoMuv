-- Script pour corriger la structure de la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si la table existe et sa structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Si la colonne 'id' n'est pas UUID ou n'est pas la clé primaire, recréer la table
-- ATTENTION: Cela supprimera les données existantes!

-- Sauvegarder les données existantes (si nécessaire)
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- Supprimer l'ancienne table
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Créer la nouvelle table avec la bonne structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'admin', 'super_admin', 'PASSENGER', 'ADMIN', 'SUPER_ADMIN', 'CONGOMUV_HQ', 'ONATRA', 'TRANSCO', 'PRIVATE')),
  full_name TEXT,
  phone TEXT,
  organization_id UUID REFERENCES operators(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);

-- Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Politique: Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politique: Les admins peuvent tout voir
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'ADMIN', 'SUPER_ADMIN')
    )
  );

-- Politique: Service role peut tout faire
CREATE POLICY "Service role can do anything"
  ON profiles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vérification finale
SELECT 
  'Table profiles créée avec succès!' as message,
  COUNT(*) as nombre_profils
FROM profiles;
