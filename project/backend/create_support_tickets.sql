-- Création de la table support_tickets si elle n'existe pas
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Peut être NULL si l'utilisateur est supprimé
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) DEFAULT 'investigating' CHECK (status IN ('investigating', 'open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER trigger_update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Modifier la colonne user_id pour autoriser NULL (si la contrainte existe)
ALTER TABLE support_tickets ALTER COLUMN user_id DROP NOT NULL;

-- Insérer quelques incidents de test (sans user_id pour les incidents système)
INSERT INTO support_tickets (subject, message, priority, status) VALUES
  ('Retard de bus', 'Le bus sur la ligne Kinshasa-Matadi a 2h de retard', 'high', 'investigating'),
  ('Panne mécanique', 'Véhicule en panne sur la route nationale', 'critical', 'investigating'),
  ('Plainte passager', 'Passager mécontent du service', 'low', 'open')
ON CONFLICT DO NOTHING;
