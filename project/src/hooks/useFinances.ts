import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://bnyoyldctqbppvwqfodc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueW95bGRjdHFicHB2d3Fmb2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYzMTcxOSwiZXhwIjoyMDc2MjA3NzE5fQ.uLoD2YjcjVtV0sTvrTqrWTrRLl7mr6Pe3jfkAiAakGs';

interface Transaction {
  id: string;
  type: 'entree' | 'sortie';
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

interface FinanceStats {
  total_entrees: number;
  total_sorties: number;
  balance: number;
  entrees_today: number;
  sorties_today: number;
  entrees_month: number;
  sorties_month: number;
}

export const useFinances = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinanceStats>({
    total_entrees: 0,
    total_sorties: 0,
    balance: 0,
    entrees_today: 0,
    sorties_today: 0,
    entrees_month: 0,
    sorties_month: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (filter = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer depuis les réservations payées (entrées) directement
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=*&payment_status=eq.paid&order=created_at.desc&limit=100`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des transactions');
      }

      const bookings = await response.json();
      
      // Convertir les réservations en transactions
      const transactionsData = bookings.map((b: any) => ({
        id: b.id,
        type: 'entree' as const,
        amount: b.total_price || 0,
        description: `Réservation - ${b.seat_number || 'N/A'}`,
        category: 'reservation',
        date: b.created_at,
        created_at: b.created_at
      }));
      
      setTransactions(transactionsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur chargement transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=*&payment_status=eq.paid`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const bookings = await response.json();
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);

      const calculatedStats = {
        total_entrees: bookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0),
        total_sorties: 0, // À implémenter avec une table dédiée
        balance: bookings.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0),
        entrees_today: bookings
          .filter((b: any) => b.created_at?.startsWith(today))
          .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0),
        sorties_today: 0,
        entrees_month: bookings
          .filter((b: any) => b.created_at?.startsWith(thisMonth))
          .reduce((sum: number, b: any) => sum + (b.total_price || 0), 0),
        sorties_month: 0
      };
      
      setStats(calculatedStats);
    } catch (err) {
      console.error('Erreur chargement stats finances:', err);
    }
  };

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at'>) => {
    try {
      // Pour l'instant, on ne crée pas de transactions manuelles
      // Les transactions sont automatiques via les réservations
      console.log('Création de transaction:', transactionData);
      await fetchTransactions();
      await fetchStats();
      return { success: true };
    } catch (err) {
      console.error('Erreur création transaction:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  return { 
    transactions, 
    stats,
    loading, 
    error, 
    refresh: fetchTransactions,
    refreshStats: fetchStats,
    createTransaction
  };
};

export default useFinances;
