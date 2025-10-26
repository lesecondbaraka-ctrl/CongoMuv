// Types pour le système de paiement

export type PaymentMethod = 'mobile_money' | 'bank_card' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  providers?: string[]; // Ex: ['Airtel Money', 'M-Pesa', 'Orange Money']
}

export interface PaymentFormData {
  method: PaymentMethod | '';
  phoneNumber?: string; // Pour Mobile Money
  provider?: string; // Airtel, M-Pesa, Orange
  cardNumber?: string; // Pour carte bancaire
  cardExpiry?: string;
  cardCvv?: string;
  cardHolderName?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference?: string;
  provider?: string;
  phone_number?: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface PaymentInitResponse {
  payment_id: string;
  status: PaymentStatus;
  transaction_reference?: string;
  message: string;
  ussd_code?: string; // Pour Mobile Money
  payment_url?: string; // Pour redirection
}

export interface PaymentVerificationResponse {
  payment_id: string;
  status: PaymentStatus;
  transaction_reference: string;
  amount: number;
  completed_at?: string;
  message: string;
}
