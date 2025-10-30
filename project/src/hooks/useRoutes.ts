import { useState, useEffect } from 'react';
import { useToast } from './useToast';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export const useRoutes = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/routes?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les itinéraires",
          variant: "destructive" as const,
        });
        throw new Error('Erreur lors du chargement des trajets');
      }

      const data = await response.json();
      const routesData = Array.isArray(data) ? data : [];
      setRoutes(routesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: "Impossible de charger les itinéraires",
        variant: "destructive" as const,
      });
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (routeData: any) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(routeData)
      });

      if (!response.ok) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la création du trajet",
          variant: "destructive" as const,
        });
        throw new Error('Erreur lors de la création du trajet');
      }

      const newRoute = await response.json();
      setRoutes(prev => [...prev, ...(Array.isArray(newRoute) ? newRoute : [newRoute])] as Route[]);
      
      toast({
        title: "Succès",
        description: "Itinéraire créé avec succès",
        variant: "success"
      });

      return newRoute;
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
    fetchRoutes();
  }, []);

  return { 
    routes, 
    loading, 
    error, 
    refresh: fetchRoutes,
    createRoute
  };
};

export default useRoutes;
