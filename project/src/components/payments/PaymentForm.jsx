import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Loader2, CreditCard, Smartphone, Wallet, CheckCircle2, XCircle } from 'lucide-react';

export const PAYMENT_METHODS = [
  { id: 'mobile_money', name: 'Mobile Money', icon: <Smartphone className="h-5 w-5" /> },
  { id: 'credit_card', name: 'Carte bancaire', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'cash', name: 'Paiement en agence', icon: <Wallet className="h-5 w-5" /> },
];

const MOBILE_MONEY_PROVIDERS = [
  { id: 'airtel_money', name: 'Airtel Money' },
  { id: 'orange_money', name: 'Orange Money' },
  { id: 'mpesa', name: 'M-Pesa' },
  { id: 'africell_money', name: 'Africell Money' },
];

const PaymentForm = ({ 
  amount, 
  bookingId, 
  onSuccess, 
  onCancel,
  defaultMethod = 'mobile_money'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(defaultMethod);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      paymentMethod: defaultMethod,
      phoneNumber: '',
      mobileProvider: MOBILE_MONEY_PROVIDERS[0]?.id,
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardHolderName: '',
      termsAccepted: false
    }
  });

  const handlePayment = async (data) => {
    setIsProcessing(true);
    setPaymentStatus(null);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      // Initier le paiement côté backend
      const initRes = await fetch('http://localhost:3002/api/payments/initiate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          booking_id: bookingId,
          amount,
          payment_method: data.paymentMethod,
          provider: data.mobileProvider,
          phone_number: data.phoneNumber,
          card_number: data.cardNumber,
          card_expiry: data.cardExpiry,
          card_holder_name: data.cardHolderName,
        }),
      });

      const initJson = await initRes.json().catch(() => ({}));
      if (!initRes.ok) {
        throw new Error(initJson?.error || initJson?.message || "Échec de l'initialisation du paiement");
      }

      // Si paiement immédiat (cash/carte) -> succès direct
      if (initJson.status === 'completed') {
        setPaymentStatus('success');
        onSuccess?.(initJson);
        return;
      }

      // Si Mobile Money: proposer USSD et lancer un polling de statut
      if (data.paymentMethod === 'mobile_money' && initJson.payment_id) {
        let attempts = 0;
        const maxAttempts = 12; // ~60s si intervalle 5s
        const poll = async () => {
          attempts += 1;
          try {
            const statusRes = await fetch(`http://localhost:3002/api/payments/${initJson.payment_id}/status`, {
              headers,
              method: 'GET',
            });
            const statusJson = await statusRes.json().catch(() => ({}));
            if (statusRes.ok && statusJson.status === 'completed') {
              setPaymentStatus('success');
              onSuccess?.(statusJson);
              return;
            }
          } catch (e) {
            console.error('Erreur polling statut paiement:', e);
          }
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            // Timeout: rester en attente ou afficher une info
            setPaymentStatus('error');
          }
        };
        // Démarrer le polling, afficher info USSD si dispo
        setPaymentStatus(null);
        poll();
        return;
      }

      // Cas par défaut: si pas completed et pas mobile_money
      setPaymentStatus('error');
    } catch (error) {
      console.error('Erreur de paiement:', error);
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case 'mobile_money':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobileProvider">Opérateur mobile *</Label>
              <Select 
                value={watch('mobileProvider')} 
                onValueChange={(value) => setValue('mobileProvider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {MOBILE_MONEY_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numéro de téléphone *</Label>
              <div className="flex items-center space-x-2">
                <Select defaultValue="+243" className="w-24">
                  <SelectTrigger>
                    <SelectValue placeholder="+243" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+243">+243 (RDC)</SelectItem>
                    <SelectItem value="+242">+242 (Congo)</SelectItem>
                    <SelectItem value="+225">+225 (Côte d'Ivoire)</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  id="phoneNumber"
                  type="tel"
                  placeholder="Ex: 81 234 5678"
                  {...register('phoneNumber', { 
                    required: 'Le numéro de téléphone est requis',
                    pattern: {
                      value: /^[0-9\s-]{9,15}$/,
                      message: 'Numéro de téléphone invalide'
                    }
                  })}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Vous recevrez une demande de paiement sur votre téléphone.</p>
            </div>
          </div>
        );
        
      case 'credit_card':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Numéro de carte *</Label>
              <Input 
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber', { 
                  required: 'Le numéro de carte est requis',
                  pattern: {
                    value: /^[0-9\s]{13,19}$/,
                    message: 'Numéro de carte invalide'
                  }
                })}
              />
              {errors.cardNumber && (
                <p className="text-sm text-red-500">{errors.cardNumber.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Date d'expiration *</Label>
                <Input 
                  id="cardExpiry"
                  type="text"
                  placeholder="MM/AA"
                  {...register('cardExpiry', { 
                    required: "La date d'expiration est requise",
                    pattern: {
                      value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                      message: 'Format invalide (MM/AA)'
                    }
                  })}
                />
                {errors.cardExpiry && (
                  <p className="text-sm text-red-500">{errors.cardExpiry.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardCvv">CVV *</Label>
                <Input 
                  id="cardCvv"
                  type="text"
                  placeholder="123"
                  className="w-24"
                  {...register('cardCvv', { 
                    required: 'Le code de sécurité est requis',
                    pattern: {
                      value: /^[0-9]{3,4}$/,
                      message: 'Code de sécurité invalide'
                    }
                  })}
                />
                {errors.cardCvv && (
                  <p className="text-sm text-red-500">{errors.cardCvv.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardHolderName">Nom sur la carte *</Label>
              <Input 
                id="cardHolderName"
                type="text"
                placeholder="Nom tel qu'il apparaît sur la carte"
                {...register('cardHolderName', { 
                  required: 'Le nom du titulaire est requis'
                })}
              />
              {errors.cardHolderName && (
                <p className="text-sm text-red-500">{errors.cardHolderName.message}</p>
              )}
            </div>
          </div>
        );
        
      case 'cash':
        return (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Paiement en agence</h3>
            <p className="text-sm text-muted-foreground">
              Vous pourrez régler votre réservation directement dans l'une de nos agences partenaires.
              Un code de réservation vous sera fourni pour finaliser le paiement.
            </p>
            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('/agences', '_blank')}
              >
                Voir les agences partenaires
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Paiement réussi !</h2>
        <p className="mt-2 text-muted-foreground">
          Votre réservation a été confirmée. Vous recevrez un email de confirmation.
        </p>
        <div className="mt-6">
          <Button onClick={() => onSuccess?.()}>
            Voir ma réservation
          </Button>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold">Paiement échoué</h2>
        <p className="mt-2 text-muted-foreground">
          Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={() => setPaymentStatus(null)}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handlePayment)}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-xl">Montant à payer</CardTitle>
          <div className="text-3xl font-bold">{amount.toLocaleString()} CDF</div>
          <CardDescription>Référence: {bookingId}</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Méthode de paiement *</Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setValue('paymentMethod', method.id);
                    }}
                    className={`flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="mb-2">{method.icon}</div>
                    <span className="text-sm">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              {renderPaymentMethod()}
            </div>
            
            {selectedMethod !== 'cash' && (
              <div className="pt-2">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    {...register('termsAccepted', {
                      required: 'Vous devez accepter les conditions de paiement',
                    })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="termsAccepted"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    J'accepte les{' '}
                    <a href="/conditions-de-paiement" className="text-primary hover:underline">
                      conditions de paiement
                    </a>{' '}
                    et la{' '}
                    <a href="/confidentialite" className="text-primary hover:underline">
                      politique de confidentialité
                    </a>
                    *
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="mt-1 text-sm text-red-500">{errors.termsAccepted.message}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-x-3 sm:space-y-0">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              `Payer ${amount.toLocaleString()} CDF`
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default PaymentForm;
