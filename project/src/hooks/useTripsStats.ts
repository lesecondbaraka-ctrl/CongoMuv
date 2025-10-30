import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface TripStats {
  total: number;
  en_cours: number;
  en_attente: number;
  termine: number;
  annule: number;
}

export const useTripsStats = () => {
  const [stats, setStats] = useState<TripStats>({
    total: 0,
    en_cours: 0,
    en_attente: 0,
    termine: 0,
    annule: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer directement depuis Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/trips?select=status`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des voyages');
      }

      const trips = await response.json();
      
      // Calculer les statistiques
      const calculatedStats = {
        total: trips.length,
        en_cours: trips.filter((t: any) => t.status === 'en_cours' || t.status === 'in_progress').length,
        en_attente: trips.filter((t: any) => t.status === 'en_attente' || t.status === 'scheduled' || t.status === 'pending').length,
        termine: trips.filter((t: any) => t.status === 'termine' || t.status === 'completed').length,
        annule: trips.filter((t: any) => t.status === 'annule' || t.status === 'cancelled').length
      };
      
      setStats(calculatedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur chargement stats voyages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refresh: fetchStats };
};

export default useTripsStats;
