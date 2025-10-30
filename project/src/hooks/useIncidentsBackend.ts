import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

interface Incident {
  id: string;
  operator_id?: string;
  trip_id?: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  date?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export const useIncidentsBackend = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('app_jwt') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE}/admin-hq/incidents`;
      console.log('🔍 Chargement incidents depuis:', url);
      
      const response = await fetch(url);
      
      console.log('📡 Status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Erreur response:', text);
        throw new Error(`Erreur ${response.status}: ${text}`);
      }

      const result = await response.json();
      console.log('✅ Données reçues:', result);
      
      const data = result.data || result;
      console.log('📊 Nombre incidents:', data.length);
      
      setIncidents(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('❌ ERREUR COMPLETE:', err);
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (incidentData: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${API_BASE}/admin-hq/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'incident');
      }

      const result = await response.json();
      const newIncident = result.data || result;
      
      // Rafraîchir la liste
      await fetchIncidents();
      
      return newIncident;
    } catch (err) {
      console.error('Erreur création incident:', err);
      throw err;
    }
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      const response = await fetch(`${API_BASE}/admin-hq/incidents/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'incident');
      }

      const updatedIncident = await response.json();
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === id ? { ...incident, ...updatedIncident } : incident
        )
      );
      return updatedIncident;
    } catch (err) {
      console.error('Erreur mise à jour incident:', err);
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

export default useIncidentsBackend;
