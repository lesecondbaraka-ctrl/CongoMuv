import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      userType: 'passenger',
      terms: false,
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      
      await signup({
        email: data.email,
        password: data.password,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          user_type: data.userType,
        },
      });
      
      navigate('/verify-email');
    } catch (err) {
      setError(err.message || "Une erreur s'est produite lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        <p className="text-sm text-gray-500">Remplissez les champs ci-dessous pour créer votre compte</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              {...register('firstName', { required: 'Prénom requis' })}
              placeholder="Jean"
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              {...register('lastName', { required: 'Nom requis' })}
              placeholder="Dupont"
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
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
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+243 XX XXX XXXX"
            {...register('phone', {
              required: 'Numéro de téléphone requis',
              pattern: {
                value: /^\+?[0-9\s-]{10,}$/,
                message: 'Numéro de téléphone invalide',
              },
            })}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="userType">Type de compte *</Label>
          <Select
            onValueChange={(value) => setValue('userType', value)}
            defaultValue="passenger"
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type de compte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passenger">Passager</SelectItem>
              <SelectItem value="operator">Opérateur de transport</SelectItem>
              <SelectItem value="admin">Administrateur (sur invitation)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe *</Label>
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
          <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
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
        
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            {...register('terms', {
              required: 'Vous devez accepter les conditions d\'utilisation',
            })}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'accepte les{' '}
              <a href="/terms" className="text-primary hover:underline">
                conditions d'utilisation
              </a>{' '}
              et la{' '}
              <a href="/privacy" className="text-primary hover:underline">
                politique de confidentialité
              </a>
              *
            </label>
            {errors.terms && <p className="text-sm text-red-500">{errors.terms.message}</p>}
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
        </Button>
      </form>
      
      <div className="text-center text-sm">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
