// Configuration dynamique de l'application CongoMuv
// Toutes les données sont chargées depuis Supabase (base de données PostgreSQL)

import { supabase } from './supabase';

export type City = {
  id: string;
  name: string;
  province: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
};

export type TransportType = {
  id: string;
  name: string;
  icon: string;
  is_active?: boolean;
};

export type Operator = {
  id: string;
  name: string;
  type: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
};

// Cache local pour performance (optionnel)
let cachedCities: City[] | null = null;
let cachedTransportTypes: TransportType[] | null = null;
let cachedOperators: Operator[] | null = null;

// ============================================
// API Helpers pour charger les données depuis Supabase
// ============================================

// Initialize app data (vide le cache)
export function initializeAppData() {
  cachedCities = null;
  cachedTransportTypes = null;
  cachedOperators = null;
}

// Get all cities from Supabase
export async function getCities(): Promise<City[]> {
  if (cachedCities) return cachedCities;
  
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    
    const cities: City[] = (data || []).map((city: any) => ({
      id: city.id,
      name: city.name,
      province: city.province,
      latitude: city.latitude,
      longitude: city.longitude,
      is_active: city.is_active,
    }));
    
    cachedCities = cities;
    return cities;
  } catch (error) {
    console.error('Error loading cities:', error);
    return [];
  }
}

// Get cities synchronously (use cached or empty)
export function getCitiesSync(): City[] {
  return cachedCities || [];
}

// Get city by ID
export async function getCityById(id: string): Promise<City | null> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      province: data.province,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

// Get city by name
export async function getCityByName(name: string): Promise<City | null> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .ilike('name', name)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      province: data.province,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

// Add city
export async function addCity(city: Omit<City, 'id'>): Promise<City | null> {
  try {
    const { data, error } = await supabase
      .from('cities')
      .insert({
        name: city.name,
        province: city.province,
        latitude: city.latitude,
        longitude: city.longitude,
      })
      .select()
      .single();
    
    if (error || !data) return null;
    
    // Invalider le cache
    cachedCities = null;
    
    return {
      id: data.id,
      name: data.name,
      province: data.province,
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch {
    return null;
  }
}

// Get all transport types from Supabase
export async function getTransportTypes(): Promise<TransportType[]> {
  if (cachedTransportTypes) return cachedTransportTypes;
  
  try {
    const { data, error } = await supabase
      .from('transport_types')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    
    const types: TransportType[] = (data || []).map((type: any) => ({
      id: type.id,
      name: type.name,
      icon: type.icon || '',
      is_active: type.is_active,
    }));
    
    cachedTransportTypes = types;
    return types;
  } catch (error) {
    console.error('Error loading transport types:', error);
    return [];
  }
}

// Get transport types synchronously
export function getTransportTypesSync(): TransportType[] {
  return cachedTransportTypes || [];
}

// Get transport type by ID
export async function getTransportTypeById(id: string): Promise<TransportType | null> {
  try {
    const { data, error } = await supabase
      .from('transport_types')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
    };
  } catch {
    return null;
  }
}

// Get all operators from Supabase
export async function getOperators(): Promise<Operator[]> {
  if (cachedOperators) return cachedOperators;
  
  try {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    
    const operators: Operator[] = (data || []).map((op: any) => ({
      id: op.id,
      name: op.name,
      type: op.type,
      contact_email: op.contact_email,
      contact_phone: op.contact_phone,
      is_active: op.is_active,
    }));
    
    cachedOperators = operators;
    return operators;
  } catch (error) {
    console.error('Error loading operators:', error);
    return [];
  }
}

// Get operators synchronously
export function getOperatorsSync(): Operator[] {
  return cachedOperators || [];
}

// Get active operators (already filtered in query)
export async function getActiveOperators(): Promise<Operator[]> {
  return getOperators(); // Already filtered by is_active=true
}

// Get operator by ID
export async function getOperatorById(id: string): Promise<Operator | null> {
  try {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      is_active: data.is_active,
    };
  } catch {
    return null;
  }
}

// Add operator
export async function addOperator(operator: Omit<Operator, 'id'>): Promise<Operator | null> {
  try {
    const { data, error } = await supabase
      .from('operators')
      .insert({
        name: operator.name,
        type: operator.type,
        contact_email: operator.contact_email,
        contact_phone: operator.contact_phone,
        is_active: operator.is_active,
      })
      .select()
      .single();
    
    if (error || !data) return null;
    
    // Invalider le cache
    cachedOperators = null;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      is_active: data.is_active,
    };
  } catch {
    return null;
  }
}

// Update operator
export async function updateOperator(id: string, updates: Partial<Operator>): Promise<Operator | null> {
  try {
    const { data, error } = await supabase
      .from('operators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return null;
    
    // Invalider le cache
    cachedOperators = null;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      is_active: data.is_active,
    };
  } catch {
    return null;
  }
}

// Delete operator (soft delete - set is_active to false)
export async function deleteOperator(id: string): Promise<boolean> {
  const result = await updateOperator(id, { is_active: false });
  return result !== null;
}

// Search cities by name
export async function searchCities(query: string): Promise<City[]> {
  if (!query) return getCities();
  
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,province.ilike.%${query}%`)
      .order('name');
    
    if (error) throw error;
    
    return (data || []).map((city: any) => ({
      id: city.id,
      name: city.name,
      province: city.province,
      latitude: city.latitude,
      longitude: city.longitude,
    }));
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
}

// Get popular routes (based on search history)
export function getPopularRoutes(): Array<{ from: string; to: string; count: number }> {
  try {
    const history = JSON.parse(localStorage.getItem('history.searches') || '[]');
    const routeCounts: Record<string, number> = {};
    
    history.forEach((h: any) => {
      const key = `${h.departureCity}→${h.arrivalCity}`;
      routeCounts[key] = (routeCounts[key] || 0) + 1;
    });
    
    return Object.entries(routeCounts)
      .map(([route, count]) => {
        const [from, to] = route.split('→');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch {
    return [];
  }
}
