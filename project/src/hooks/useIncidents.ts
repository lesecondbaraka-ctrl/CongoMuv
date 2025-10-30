import { useState, useEffect } from 'react';
import { useToast } from './useToast';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export const useIncidents = () => {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/support_tickets?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des incidents');
      }

      const data = await response.json();
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: "Impossible de charger les incidents",
        variant: "destructive" as const,
      });
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incidentData: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/support_tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          ...incidentData,
          status: 'open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Erreur lors de la création de l\'incident');
      }

      const newIncident = await response.json();
      setIncidents(prev => [...prev, ...(Array.isArray(newIncident) ? newIncident : [newIncident])] as Incident[]);
      
      toast({
        title: "Succès",
        description: "Incident créé avec succès",
        variant: "success"
      });
      
      return newIncident;
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

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/support_tickets?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          ...updates,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'incident');
      }

      const updatedIncident = await response.json();
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === id 
            ? { ...incident, ...(Array.isArray(updatedIncident) ? updatedIncident[0] : updatedIncident) }
            : incident
        ) as Incident[]
      );
      
      toast({
        title: "Succès",
        description: "Incident mis à jour avec succès",
        variant: "success"
      });
      
      return updatedIncident;
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
    fetchIncidents();
  }, []);

  return { 
    incidents, 
    loading, 
    error, 
    refresh: fetchIncidents,
    createIncident,
    updateIncident
  };
};

export default useIncidents;
