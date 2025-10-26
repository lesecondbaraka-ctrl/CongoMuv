import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';

export const ResetPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: email || '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) {
      setError('Lien de réinitialisation invalide ou expiré');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      
      await axios.post('/api/auth/reset-password', {
        token,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirmPassword,
      });
      
      setIsSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Une erreur est survenue lors de la réinitialisation du mot de passe.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
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
          <h1 className="text-2xl font-bold">Mot de passe réinitialisé</h1>
          <p className="text-sm text-gray-500">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
        </div>
        
        <div className="pt-4">
          <Button onClick={() => navigate('/login')} className="w-full">
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Lien invalide</h1>
          <p className="text-sm text-gray-500">
            Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
          </p>
        </div>
        
        <div className="pt-4">
          <Button onClick={() => navigate('/forgot-password')} variant="outline" className="w-full">
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Réinitialiser le mot de passe</h1>
        <p className="text-sm text-gray-500">
          Entrez votre nouveau mot de passe pour {email}
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('email')} />
        
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <Input
            id="password"
            type="password"
            {...register('password', {
              required: 'Mot de passe requis',
              minLength: {
                value: 8,
                message: 'Le mot de passe doit contenir au moins 8 caractères',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Doit contenir au moins une majuscule, une minuscule et un chiffre',
              },
            })}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: 'Veuillez confirmer votre mot de passe',
              validate: (value) => value === password || 'Les mots de passe ne correspondent pas',
            })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
