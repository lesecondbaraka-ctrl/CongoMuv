export interface TransportType {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export interface Operator {
  id: number;
  name: string;
  type: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
}

export interface Route {
  id: number;
  operator_id: number;
  transport_type_id: number;
  departure_city: string;
  arrival_city: string;
  distance_km: number;
  estimated_duration_minutes: number;
  base_price: number;
  is_active: boolean;
  operator?: Operator | null;
  transport_type?: TransportType | null;
}

export interface Trip {
  id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  vehicle_number: string;
  total_seats: number;
  available_seats: number;
  status: string;
  driver_name?: string;
  route?: Route | null;
}

export interface Booking {
  id: string | number;
  booking_reference: string;
  number_of_passengers: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;
  trip?: Trip | null;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  role: 'user' | 'admin' | 'operator' | 'superadmin' | 'SUPER_ADMIN';
  created_at: string;
  is_active?: boolean;
  token?: string; // Ajouté pour JWT
}

export interface OperatorReview {
  id: string;
  user_id: string;
  operator_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
  };
}
