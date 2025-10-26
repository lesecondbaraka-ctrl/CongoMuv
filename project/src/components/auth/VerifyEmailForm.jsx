import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';

export const VerifyEmailForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: '',
    },
  });

  // Vérification automatique si un token est présent dans l'URL
  useEffect(() => {
    const verifyToken = async () => {
      if (token && email) {
        try {
          setIsLoading(true);
          setError('');
          
          await axios.post('/api/auth/verify-email', {
            token,
            email,
          });
          
          setIsVerified(true);
          // Rediriger après 3 secondes
          const timer = setTimeout(() => {
            navigate('/login', {
              state: { emailVerified: true },
            });
          }, 3000);
          
          return () => clearTimeout(timer);
        } catch (err) {
          setError(
            err.response?.data?.message ||
              'Le lien de vérification est invalide ou a expiré.'
          );
        } finally {
          setIsLoading(false);
        }
      }
    };

    verifyToken();
  }, [token, email, navigate]);

  // Gestion du compte à rebours pour le renvoi d'email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0 || !email) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      await axios.post('/api/auth/resend-verification', { email });
      
      setResendSuccess(true);
      setCountdown(60); // 60 secondes avant de pouvoir renvoyer à nouveau
      
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Impossible d\'envoyer un nouvel email. Veuillez réessayer plus tard.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      
      await axios.post('/api/auth/verify-email', {
        code: data.code,
        email: email || data.email,
      });
      
      setIsVerified(true);
      
      // Rediriger après 3 secondes
      setTimeout(() => {
        navigate('/login', {
          state: { emailVerified: true },
        });
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Le code de vérification est invalide ou a expiré.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Email vérifié avec succès !</h1>
          <p className="text-sm text-gray-500">
            Votre adresse email a été vérifiée. Vous allez être redirigé vers la page de connexion...
          </p>
        </div>
        
        <div className="pt-4">
          <Button onClick={() => navigate('/login')} className="w-full">
            Aller à la page de connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Vérification d'email</h1>
        <p className="text-sm text-gray-500">
          {email 
            ? `Un code de vérification a été envoyé à ${email}`
            : 'Entrez votre email et le code de vérification'}
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {resendSuccess && (
        <Alert>
          <AlertDescription>
            Un nouvel email de vérification a été envoyé avec succès.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!email && (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              {...register('email', {
                required: 'Email requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide',
                },
              })}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="code">Code de vérification</Label>
          <Input
            id="code"
            type="text"
            placeholder="Entrez le code à 6 chiffres"
            {...register('code', {
              required: 'Code de vérification requis',
              pattern: {
                value: /^\d{6}$/,
                message: 'Le code doit contenir 6 chiffres',
              },
            })}
          />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Vérification en cours...' : 'Vérifier mon email'}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        <p className="text-gray-500">
          Vous n'avez pas reçu de code ?{' '}
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={countdown > 0 || isLoading}
            className={`font-medium ${countdown > 0 ? 'text-gray-400' : 'text-primary hover:underline'}`}
          >
            {countdown > 0 
              ? `Renvoyer (${countdown}s)` 
              : 'Renvoyer un nouveau code'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailForm;
