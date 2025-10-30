import { useState, useEffect } from 'react';
import { useToast } from './useToast';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface Operator {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export const useOperators = () => {
  const { toast } = useToast();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOperators = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/organizations?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des opérateurs');
      }

      const data = await response.json();
      const operatorsData = Array.isArray(data) ? data : [];
      setOperators(operatorsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
toast({
        title: "Erreur",
        description: "Impossible de charger les opérateurs",
        variant: "destructive" as const,
      });
    } finally {
      setLoading(false);
    }
  };

  const createOperator = async (operatorData: any) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(operatorData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'opérateur');
      }

      const newOperator = await response.json();
      setOperators(prev => [...prev, ...(Array.isArray(newOperator) ? newOperator : [newOperator])] as Operator[]);
      
toast({
        title: "Succès",
        description: "Opérateur créé avec succès",
        variant: "success"
      });

      return newOperator;
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
    fetchOperators();
  }, []);

  return { 
    operators, 
    loading, 
    error, 
    refresh: fetchOperators,
    createOperator
  };
};

export default useOperators;
