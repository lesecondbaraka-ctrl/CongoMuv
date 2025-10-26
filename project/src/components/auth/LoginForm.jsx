import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription } from '../ui/alert';

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer l'URL de redirection après connexion
  const from = location.state?.from?.pathname || '/';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsLoading(true);
      
      console.log('Tentative de connexion avec:', data.email);
      
      // Appel à la fonction de connexion
      const result = await login(data.email, data.password);
      
      if (!result.success) {
        throw new Error(result.message || 'Échec de la connexion');
      }
      
      console.log('Connexion réussie, redirection vers:', result.redirect);
      
      // La redirection est gérée par la fonction login du contexte d'authentification
      // qui utilise getDashboardByRole pour déterminer la destination
      
    } catch (err) {
      console.error('Erreur de connexion:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="text-sm text-gray-500">Entrez vos identifiants pour accéder à votre compte</p>
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
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            {...register('password', {
              required: 'Mot de passe requis',
              minLength: {
                value: 6,
                message: 'Le mot de passe doit contenir au moins 6 caractères',
              },
            })}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          S'inscrire
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
