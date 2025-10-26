// Types pour le module Passager

export type TransportTypeEnum = 'train' | 'fluvial' | 'transco' | 'private';

export interface TransportOption {
  id: TransportTypeEnum;
  name: string;
  icon: string;
  description: string;
  emoji: string;
}

export interface PassengerInfo {
  id: string;
  fullName: string;
  age: number;
  isChild: boolean; // < 5 ans
  discountApplied: boolean;
}

export interface BookingFormData {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  departureTime?: string;
  passengers: PassengerInfo[];
  transportType: TransportTypeEnum | '';
}

export interface PricingCalculation {
  basePrice: number;
  passengerPrices: {
    passengerId: string;
    passengerName: string;
    age: number;
    originalPrice: number;
    discount: number;
    finalPrice: number;
  }[];
  totalDiscount: number;
  totalAmount: number;
}

export interface TripSearchParams {
  departureCity: string;
  arrivalCity: string;
  date: string;
  transportType?: TransportTypeEnum;
  passengers: number;
}
