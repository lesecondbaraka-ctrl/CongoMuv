import { useState, useEffect } from 'react';
import { useToast } from './useToast';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface Trip {
  id: string;
  route_id: string;
  vehicle_id: string;
  driver_id: string;
  departure_time: string;
  arrival_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  available_seats: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export const useTrips = () => {
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/trips?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des voyages');
      }

      const data = await response.json();
      const tripsData = Array.isArray(data) ? data : [];
      setTrips(tripsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
toast({
        title: "Erreur",
        description: "Impossible de charger les voyages",
        variant: "destructive" as const,
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(tripData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du voyage');
      }

      const newTrip = await response.json();
      setTrips(prev => [...prev, ...(Array.isArray(newTrip) ? newTrip : [newTrip])] as Trip[]);
      
toast({
        title: "Succès",
        description: "Voyage créé avec succès",
        variant: "success"
      });

      return newTrip;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive" as const,
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return { 
    trips, 
    loading, 
    error, 
    refresh: fetchTrips,
    createTrip
  };
};

export default useTrips;
