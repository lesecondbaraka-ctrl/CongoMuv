// Configuration production avec fallback automatique
// Détecte automatiquement les clés API et bascule entre mock et production

export type PaymentProvider = 'flutterwave' | 'airtel' | 'orange' | 'mock';
export type EmailProvider = 'mailgun' | 'sendgrid' | 'mock';
export type SMSProvider = 'twilio' | 'infobip' | 'mock';

// ============================================
// Configuration Environment Variables
// ============================================

const config = {
  // Paiements
  flutterwavePublicKey: (import.meta as any).env?.VITE_FLUTTERWAVE_PUBLIC_KEY,
  flutterwaveSecretKey: (import.meta as any).env?.VITE_FLUTTERWAVE_SECRET_KEY,
  airtelClientId: (import.meta as any).env?.VITE_AIRTEL_CLIENT_ID,
  airtelClientSecret: (import.meta as any).env?.VITE_AIRTEL_CLIENT_SECRET,
  orangeClientId: (import.meta as any).env?.VITE_ORANGE_CLIENT_ID,
  orangeClientSecret: (import.meta as any).env?.VITE_ORANGE_CLIENT_SECRET,
  
  // Email
  mailgunApiKey: (import.meta as any).env?.VITE_MAILGUN_API_KEY,
  mailgunDomain: (import.meta as any).env?.VITE_MAILGUN_DOMAIN,
  sendgridApiKey: (import.meta as any).env?.VITE_SENDGRID_API_KEY,
  
  // SMS
  twilioAccountSid: (import.meta as any).env?.VITE_TWILIO_ACCOUNT_SID,
  twilioAuthToken: (import.meta as any).env?.VITE_TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: (import.meta as any).env?.VITE_TWILIO_PHONE_NUMBER,
  infobipApiKey: (import.meta as any).env?.VITE_INFOBIP_API_KEY,
  
  // Backend API
  backendUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080',
};

// ============================================
// Détection automatique du mode (production vs mock)
// ============================================

export function isFlutterwaveConfigured(): boolean {
  return !!(config.flutterwavePublicKey && config.flutterwaveSecretKey);
}

export function isAirtelConfigured(): boolean {
  return !!(config.airtelClientId && config.airtelClientSecret);
}

export function isOrangeConfigured(): boolean {
  return !!(config.orangeClientId && config.orangeClientSecret);
}

export function isEmailConfigured(): boolean {
  return !!(config.mailgunApiKey || config.sendgridApiKey);
}

export function isSMSConfigured(): boolean {
  return !!(config.twilioAccountSid || config.infobipApiKey);
}

export function getPaymentProvider(): PaymentProvider {
  if (isFlutterwaveConfigured()) return 'flutterwave';
  if (isAirtelConfigured()) return 'airtel';
  if (isOrangeConfigured()) return 'orange';
  return 'mock';
}

export function getEmailProvider(): EmailProvider {
  if (config.mailgunApiKey) return 'mailgun';
  if (config.sendgridApiKey) return 'sendgrid';
  return 'mock';
}

export function getSMSProvider(): SMSProvider {
  if (config.twilioAccountSid) return 'twilio';
  if (config.infobipApiKey) return 'infobip';
  return 'mock';
}

// ============================================
// Service de Paiement avec Fallback
// ============================================

export type PaymentRequest = {
  amount: number;
  currency: string;
  email: string;
  phone: string;
  reference: string;
  description: string;
};

export type PaymentResponse = {
  success: boolean;
  provider: PaymentProvider;
  transactionId?: string;
  paymentUrl?: string;
  message?: string;
};

export async function initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
  const provider = getPaymentProvider();
  
  // Mode Mock (par défaut si pas de clés API)
  if (provider === 'mock') {
    console.log('[Payment Mock] Simuler paiement:', request);
    // Simuler délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler succès 80% du temps
    const success = Math.random() > 0.2;
    
    return {
      success,
      provider: 'mock',
      transactionId: `MOCK_${Date.now()}`,
      message: success ? 'Paiement mock réussi' : 'Paiement mock échoué (simulation)',
    };
  }
  
  // Mode Production Flutterwave
  if (provider === 'flutterwave') {
    try {
      const response = await fetch(`${config.backendUrl}/api/payments/flutterwave/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Flutterwave API error');
      
      const data = await response.json();
      return {
        success: true,
        provider: 'flutterwave',
        transactionId: data.data.id,
        paymentUrl: data.data.link,
        message: 'Redirection vers Flutterwave',
      };
    } catch (error) {
      console.error('[Flutterwave] Erreur:', error);
      // Fallback mock si erreur
      return {
        success: false,
        provider: 'mock',
        message: 'Erreur Flutterwave, mode mock activé',
      };
    }
  }
  
  // Mode Production Airtel
  if (provider === 'airtel') {
    try {
      const response = await fetch(`${config.backendUrl}/api/payments/airtel/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Airtel API error');
      
      const data = await response.json();
      return {
        success: true,
        provider: 'airtel',
        transactionId: data.transaction_id,
        message: 'Paiement Airtel Money initié',
      };
    } catch (error) {
      console.error('[Airtel] Erreur:', error);
      return {
        success: false,
        provider: 'mock',
        message: 'Erreur Airtel, mode mock activé',
      };
    }
  }
  
  // Mode Production Orange
  if (provider === 'orange') {
    try {
      const response = await fetch(`${config.backendUrl}/api/payments/orange/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Orange API error');
      
      const data = await response.json();
      return {
        success: true,
        provider: 'orange',
        transactionId: data.transaction_id,
        message: 'Paiement Orange Money initié',
      };
    } catch (error) {
      console.error('[Orange] Erreur:', error);
      return {
        success: false,
        provider: 'mock',
        message: 'Erreur Orange, mode mock activé',
      };
    }
  }
  
  // Fallback par défaut
  return {
    success: false,
    provider: 'mock',
    message: 'Aucun provider configuré',
  };
}

// ============================================
// Service Email avec Fallback
// ============================================

export type EmailRequest = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(request: EmailRequest): Promise<{ success: boolean; provider: EmailProvider; message?: string }> {
  const provider = getEmailProvider();
  
  // Mode Mock
  if (provider === 'mock') {
    console.log('[Email Mock] Simuler envoi email:', { to: request.to, subject: request.subject });
    return {
      success: true,
      provider: 'mock',
      message: 'Email mock envoyé (console log)',
    };
  }
  
  // Mode Production Mailgun
  if (provider === 'mailgun') {
    try {
      const response = await fetch(`${config.backendUrl}/api/email/mailgun/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Mailgun API error');
      
      return {
        success: true,
        provider: 'mailgun',
        message: 'Email envoyé via Mailgun',
      };
    } catch (error) {
      console.error('[Mailgun] Erreur:', error);
      return {
        success: false,
        provider: 'mock',
        message: 'Erreur Mailgun, mode mock activé',
      };
    }
  }
  
  // Mode Production SendGrid
  if (provider === 'sendgrid') {
    try {
      const response = await fetch(`${config.backendUrl}/api/email/sendgrid/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('SendGrid API error');
      
      return {
        success: true,
        provider: 'sendgrid',
        message: 'Email envoyé via SendGrid',
      };
    } catch (error) {
      console.error('[SendGrid] Erreur:', error);
      return {
        success: false,
        provider: 'mock',
        message: 'Erreur SendGrid, mode mock activé',
      };
    }
  }
  
  return {
    success: false,
    provider: 'mock',
    message: 'Aucun provider email configuré',
  };
}

// ============================================
// Service SMS avec Fallback
// ============================================

export type SMSRequest = {
  to: string;
  message: string;
};

export async function sendSMS(request: SMSRequest): Promise<{ success: boolean; provider: SMSProvider; message?: string }> {
  const provider = getSMSProvider();
  
  // Mode Mock
  if (provider === 'mock') {
    console.log('[SMS Mock] Simuler envoi SMS:', { to: request.to, message: request.message.substring(0, 50) });
    return {
      success: true,
      provider: 'mock',
      message: 'SMS mock envoyé (console log)',
    };
  }
  
  // Mode Production Twilio
  if (provider === 'twilio') {
    try {
      const response = await fetch(`${config.backendUrl}/api/sms/twilio/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Twilio API error');
      
      return {
        success: true,
        provider: 'twilio',
        message: 'SMS envoyé via Twilio',
      };
    } catch (error) {
      console.error('[Twilio] Erreur:', error);
      return {
        success: false,
        provider: 'mock',
        message: 'Erreur Twilio, mode mock activé',
      };
    }
  }
  
  // Mode Production Infobip
  if (provider === 'infobip') {
    try {
      const response = await fetch(`${config.backendUrl}/api/sms/infobip/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Infobip API error');
      
      return {
        success: true,
        provider: 'infobip',
        message: 'SMS envoyé via Infobip',
      };
    } catch (error) {
      console.error('[Infobip] Erreur:', error);
      return {
        success: false,
        provider: 'mock',
        message: 'Erreur Infobip, mode mock activé',
      };
    }
  }
  
  return {
    success: false,
    provider: 'mock',
    message: 'Aucun provider SMS configuré',
  };
}

// ============================================
// Statut du Système (Pour Dashboard Admin)
// ============================================

export function getSystemStatus(): {
  payment: { provider: PaymentProvider; configured: boolean };
  email: { provider: EmailProvider; configured: boolean };
  sms: { provider: SMSProvider; configured: boolean };
  backend: { url: string; reachable: boolean };
} {
  return {
    payment: {
      provider: getPaymentProvider(),
      configured: getPaymentProvider() !== 'mock',
    },
    email: {
      provider: getEmailProvider(),
      configured: isEmailConfigured(),
    },
    sms: {
      provider: getSMSProvider(),
      configured: isSMSConfigured(),
    },
    backend: {
      url: config.backendUrl,
      reachable: false, // À vérifier avec un ping
    },
  };
}
