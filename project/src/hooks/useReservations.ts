import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface Reservation {
  id: string;
  user_id: string;
  trip_id: string;
  seat_number: string;
  status: string;
  payment_status: string;
  amount: number;
  created_at: string;
  user_name?: string;
  user_email?: string;
  trip_departure?: string;
  trip_arrival?: string;
  trip_date?: string;
}

interface ReservationStats {
  total: number;
  today: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  revenue_total: number;
  revenue_today: number;
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats>({
    total: 0,
    today: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    revenue_total: 0,
    revenue_today: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async (filter = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${SUPABASE_URL}/rest/v1/bookings?select=*&order=created_at.desc&limit=100`;
      
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        url += `&created_at=gte.${today}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réservations');
      }

      const data = await response.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur chargement réservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const reservations = await response.json();
      const today = new Date().toISOString().split('T')[0];

      const calculatedStats = {
        total: reservations.length,
        today: reservations.filter((r: any) => r.created_at?.startsWith(today)).length,
        confirmed: reservations.filter((r: any) => r.status === 'confirmed').length,
        pending: reservations.filter((r: any) => r.status === 'pending').length,
        cancelled: reservations.filter((r: any) => r.status === 'cancelled').length,
        revenue_total: reservations
          .filter((r: any) => r.payment_status === 'paid')
          .reduce((sum: number, r: any) => sum + (r.total_price || 0), 0),
        revenue_today: reservations
          .filter((r: any) => r.payment_status === 'paid' && r.created_at?.startsWith(today))
          .reduce((sum: number, r: any) => sum + (r.total_price || 0), 0)
      };
      
      setStats(calculatedStats);
    } catch (err) {
      console.error('Erreur chargement stats réservations:', err);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchStats();
  }, []);

  return { 
    reservations, 
    stats,
    loading, 
    error, 
    refresh: fetchReservations,
    refreshStats: fetchStats
  };
};

export default useReservations;
