/**
 * Types TypeScript générés depuis le schéma PostgreSQL
 * Correspond EXACTEMENT aux tables SQL créées
 * Auto-généré pour CongoMuv E-Ticket
 * Date: 16 Octobre 2025
 */

// ============================================
// TABLES DE CONFIGURATION
// ============================================

export interface City {
  id: string;
  name: string;
  province: string;
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransportType {
  id: string;
  name: string;
  code: string | null;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeatCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price_multiplier: number;
  amenities: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  name: string;
  type: string;
  code: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  logo_url: string | null;
  website_url: string | null;
  license_number: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  total_trips: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  code: string;
  min_points: number;
  max_points: number | null;
  discount_percentage: number;
  benefits: Record<string, any> | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// TABLES UTILISATEURS
// ============================================

export type UserRole = 'user' | 'operator' | 'admin' | 'support';

export interface Profile {
  id: string; // FK to auth.users
  role: UserRole;
  name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  address: string | null;
  city_id: string | null;
  profile_picture_url: string | null;
  organization_id: string | null;
  is_verified: boolean;
  is_active: boolean;
  last_login_at: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserRoleHistory {
  id: string;
  user_id: string;
  old_role: string | null;
  new_role: string;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

// ============================================
// TABLES TRANSPORT
// ============================================

export interface Vehicle {
  id: string;
  operator_id: string;
  transport_type_id: string;
  vehicle_number: string;
  model: string | null;
  manufacturer: string | null;
  year_manufactured: number | null;
  total_seats: number;
  amenities: Record<string, any>;
  is_active: boolean;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  operator_id: string;
  user_id: string | null;
  name: string;
  phone: string;
  license_number: string;
  license_expiry_date: string | null;
  date_of_birth: string | null;
  years_of_experience: number | null;
  rating: number;
  total_trips: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  operator_id: string;
  departure_city_id: string;
  arrival_city_id: string;
  transport_type_id: string;
  route_code: string | null;
  name: string | null;
  distance_km: number | null;
  base_price: number;
  duration_minutes: number;
  stops: Array<{ city_id: string; order: number; duration_minutes: number }> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TripStatus = 
  | 'scheduled' 
  | 'boarding' 
  | 'departed' 
  | 'in_transit' 
  | 'arrived' 
  | 'completed' 
  | 'cancelled' 
  | 'delayed';

export interface Trip {
  id: string;
  route_id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  departure_datetime: string;
  arrival_datetime: string;
  available_seats: number;
  total_seats: number;
  price: number;
  status: TripStatus;
  delay_minutes: number;
  cancellation_reason: string | null;
  gate_number: string | null;
  platform_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TripSeatPrice {
  id: string;
  trip_id: string;
  seat_category_id: string;
  price: number;
  available_seats: number;
  created_at: string;
  updated_at: string;
}

export type TripUpdateType = 
  | 'status_change' 
  | 'delay' 
  | 'cancellation' 
  | 'gate_change' 
  | 'departure' 
  | 'arrival';

export interface TripUpdate {
  id: string;
  trip_id: string;
  update_type: TripUpdateType;
  old_value: string | null;
  new_value: string | null;
  message: string | null;
  created_by: string | null;
  created_at: string;
}

export interface VehiclePosition {
  id: string;
  trip_id: string;
  vehicle_id: string | null;
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed_kmh: number | null;
  heading: number | null;
  accuracy_meters: number | null;
  battery_level: number | null;
  timestamp: string;
}

// ============================================
// TABLES RÉSERVATIONS
// ============================================

export type BookingStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'refunded' 
  | 'completed' 
  | 'no_show';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'success' 
  | 'failed' 
  | 'refunded';

export type BookingSource = 'web' | 'mobile' | 'agent' | 'api';

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  reference: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_id_number: string | null;
  num_passengers: number;
  seat_category_id: string | null;
  seat_numbers: string[];
  total_amount: number;
  discount_amount: number;
  final_amount: number; // GENERATED column
  status: BookingStatus;
  payment_status: PaymentStatus;
  booking_source: BookingSource;
  special_requests: string | null;
  is_checked_in: boolean;
  checked_in_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  refund_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BookingPassenger {
  id: string;
  booking_id: string;
  name: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  id_number: string | null;
  seat_number: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  transaction_id: string | null;
  reference: string;
  amount: number;
  currency: string;
  provider: string;
  payment_method: string | null;
  phone_number: string | null;
  status: PaymentStatus;
  failure_reason: string | null;
  refund_reference: string | null;
  refunded_at: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  booking_id: string;
  ticket_number: string;
  qr_code: string;
  barcode: string | null;
  is_valid: boolean;
  is_used: boolean;
  used_at: string | null;
  validated_by: string | null;
  validation_location: string | null;
  download_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// TABLES FIDÉLITÉ
// ============================================

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  current_points: number;
  total_earned: number;
  total_spent: number;
  tier_id: string | null;
  last_points_earned_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LoyaltyHistoryType = 
  | 'earned' 
  | 'spent' 
  | 'expired' 
  | 'refunded' 
  | 'bonus';

export interface LoyaltyHistory {
  id: string;
  user_id: string;
  points: number;
  type: LoyaltyHistoryType;
  description: string;
  booking_id: string | null;
  expires_at: string | null;
  created_at: string;
}

// ============================================
// TABLES PROMOTIONS
// ============================================

export type DiscountType = 'percentage' | 'fixed_amount';

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number | null;
  valid_from: string;
  valid_until: string;
  applicable_routes: string[] | null;
  applicable_operators: string[] | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  user_id: string;
  booking_id: string;
  discount_amount: number;
  created_at: string;
}

// ============================================
// TABLES SUPPORT
// ============================================

export interface FAQ {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  order_index: number;
  views: number;
  helpful_count: number;
  not_helpful_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SupportTicketCategory = 
  | 'booking' 
  | 'payment' 
  | 'technical' 
  | 'complaint' 
  | 'feedback' 
  | 'other';

export type SupportTicketPriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'urgent';

export type SupportTicketStatus = 
  | 'open' 
  | 'pending' 
  | 'in_progress' 
  | 'resolved' 
  | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assigned_to: string | null;
  booking_id: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketResponse {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  attachments: Array<{ name: string; url: string }>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  related_id: string | null;
  is_read: boolean;
  is_sent: boolean;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  booking_updates: boolean;
  payment_updates: boolean;
  trip_reminders: boolean;
  promotions: boolean;
  newsletter: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// TABLES REVIEWS
// ============================================

export interface TripReview {
  id: string;
  trip_id: string;
  user_id: string;
  booking_id: string;
  overall_rating: number;
  comfort_rating: number | null;
  punctuality_rating: number | null;
  cleanliness_rating: number | null;
  staff_rating: number | null;
  comment: string | null;
  is_verified: boolean;
  is_visible: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// TABLES AUDIT & SÉCURITÉ
// ============================================

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
}

export interface PaymentLog {
  id: string;
  payment_id: string;
  event_type: string;
  provider_response: Record<string, any>;
  http_status: number | null;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
}

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  ip_address: string;
  user_agent: string | null;
  details: Record<string, any>;
  severity: SecurityEventSeverity;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface BlockedSession {
  id: string;
  user_id: string;
  session_id: string;
  reason: string | null;
  blocked_by: string | null;
  expires_at: string | null;
  created_at: string;
}

// ============================================
// TABLES STATISTIQUES
// ============================================

export interface DailyStatistics {
  id: string;
  date: string;
  total_bookings: number;
  total_revenue: number;
  total_passengers: number;
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  average_rating: number;
  new_users: number;
  active_users: number;
  created_at: string;
  updated_at: string;
}

export interface OperatorStatistics {
  id: string;
  operator_id: string;
  date: string;
  total_bookings: number;
  total_revenue: number;
  total_passengers: number;
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// TYPES AVEC RELATIONS (JOIN)
// ============================================

export interface TripWithRelations extends Trip {
  route?: Route & {
    departure_city?: City;
    arrival_city?: City;
    operator?: Operator;
    transport_type?: TransportType;
  };
  vehicle?: Vehicle;
  driver?: Driver;
  seat_prices?: TripSeatPrice[];
}

export interface BookingWithRelations extends Booking {
  trip?: TripWithRelations;
  passengers?: BookingPassenger[];
  payment?: Payment;
  ticket?: Ticket;
  promo_code_usage?: PromoCodeUsage & {
    promo_code?: PromoCode;
  };
}

export interface ProfileWithRelations extends Profile {
  city?: City;
  organization?: Operator;
  loyalty_points?: LoyaltyPoints & {
    tier?: LoyaltyTier;
  };
  notification_preferences?: NotificationPreferences;
}

// ============================================
// TYPES HELPER POUR API
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchTripsParams {
  departure_city_id?: string;
  arrival_city_id?: string;
  departure_date?: string;
  transport_type_id?: string;
  operator_id?: string;
  min_price?: number;
  max_price?: number;
  min_seats?: number;
}

export interface CreateBookingParams {
  trip_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  num_passengers: number;
  seat_category_id?: string;
  seat_numbers?: string[];
  special_requests?: string;
  promo_code?: string;
}

export interface CreatePaymentParams {
  booking_id: string;
  amount: number;
  currency: string;
  provider: string;
  payment_method: string;
  phone_number?: string;
}
