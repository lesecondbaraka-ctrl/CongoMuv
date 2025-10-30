import { useState, useEffect } from 'react';
import { useToast } from './useToast';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER' | 'DRIVER';
  phone?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/users?select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive" as const,
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Erreur lors de la création de l\'utilisateur');
      }

      const newUser = await response.json();
      setUsers(prev => [...prev, ...(Array.isArray(newUser) ? newUser : [newUser])] as User[]);
      
      toast({
        title: "Succès",
        description: "Utilisateur créé avec succès",
        variant: "success"
      });
      
      return newUser;
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

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/users?id=eq.${id}`, {
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
        throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
      }

      const updatedUser = await response.json();
      setUsers(prev => 
        prev.map(user => 
          user.id === id 
            ? { ...user, ...(Array.isArray(updatedUser) ? updatedUser[0] : updatedUser) }
            : user
        ) as User[]
      );
      
      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès",
        variant: "success"
      });
      
      return updatedUser;
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
    fetchUsers();
  }, []);

  return { 
    users, 
    loading, 
    error, 
    refresh: fetchUsers,
    createUser,
    updateUser
  };
};

export default useUsers;
