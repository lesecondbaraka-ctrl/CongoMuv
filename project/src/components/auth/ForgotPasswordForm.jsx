import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsLoading(true);
      await resetPassword(data.email);
      setIsEmailSent(true);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Vérifiez votre boîte mail</h1>
          <p className="text-sm text-gray-500">
            Nous avons envoyé un lien de réinitialisation à votre adresse email.
            Suivez les instructions pour créer un nouveau mot de passe.
          </p>
        </div>
        
        <div className="pt-4">
          <Button onClick={() => navigate('/login')} className="w-full">
            Retour à la connexion
          </Button>
        </div>
        
        <p className="text-sm text-gray-500">
          Vous n'avez pas reçu d'email ?{' '}
          <button
            onClick={() => setIsEmailSent(false)}
            className="font-medium text-primary hover:underline"
          >
            Renvoyer
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
        <p className="text-sm text-gray-500">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        <Link to="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
