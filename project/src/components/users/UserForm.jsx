import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Loader2, User, Mail, Phone, Lock, Building2, UserCog, X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../ui/use-toast';

const USER_ROLES = [
  { id: 'admin', name: 'Administrateur' },
  { id: 'operator', name: 'Opérateur' },
  { id: 'driver', name: 'Chauffeur' },
  { id: 'customer', name: 'Client' },
];

const UserForm = ({ 
  onSubmit, 
  initialData = {}, 
  isSubmitting = false,
  onCancel
}) => {
  const { toast } = useToast();
  const [isEmailAvailable, setIsEmailAvailable] = useState(true);
  const [isPhoneAvailable, setIsPhoneAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors },
    trigger
  } = useForm({
    defaultValues: {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      role: initialData.role || 'customer',
      isActive: initialData.isActive ?? true,
      company: initialData.company || '',
      position: initialData.position || '',
      ...(initialData._id ? {} : { sendWelcomeEmail: true })
    }
  });

  // Vérifier la disponibilité de l'email
  const checkEmailAvailability = async (email) => {
    if (!email || email === initialData.email) return true;
    
    setIsChecking(true);
    try {
      const response = await fetch(`/api/users/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setIsEmailAvailable(data.available);
      return data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      return true; // On laisse passer en cas d'erreur pour ne pas bloquer l'utilisateur
    } finally {
      setIsChecking(false);
    }
  };

  // Vérifier la disponibilité du numéro de téléphone
  const checkPhoneAvailability = async (phone) => {
    if (!phone || phone === initialData.phone) return true;
    
    setIsChecking(true);
    try {
      const response = await fetch(`/api/users/check-phone?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      setIsPhoneAvailable(data.available);
      return data.available;
    } catch (error) {
      console.error('Erreur lors de la vérification du téléphone:', error);
      return true;
    } finally {
      setIsChecking(false);
    }
  };

  const processSubmit = async (data) => {
    // Vérifier la disponibilité de l'email et du téléphone avant la soumission
    const isEmailOk = await checkEmailAvailability(data.email);
    const isPhoneOk = await checkPhoneAvailability(data.phone);
    
    if (!isEmailOk || !isPhoneOk) {
      toast({
        title: 'Erreur de validation',
        description: !isEmailOk 
          ? 'Cette adresse email est déjà utilisée.' 
          : 'Ce numéro de téléphone est déjà utilisé.',
        variant: 'destructive'
      });
      return;
    }
    
    // Si c'est une création et qu'un mot de passe est requis
    if (!initialData._id && !data.password) {
      toast({
        title: 'Champ manquant',
        description: 'Un mot de passe est requis pour la création d\'un utilisateur.',
        variant: 'destructive'
      });
      return;
    }
    
    // Préparer les données pour la soumission
    const userData = { ...data };
    
    // Ne pas envoyer le mot de passe s'il est vide (cas de la mise à jour)
    if (!userData.password) {
      delete userData.password;
      delete userData.confirmPassword;
    }
    
    // Supprimer le champ de confirmation du mot de passe avant l'envoi
    delete userData.confirmPassword;
    
    // Appeler la fonction de soumission fournie par le parent
    onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Renseignez les informations de base de l'utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Ex: Jean"
                    {...register('firstName', { 
                      required: 'Le prénom est requis',
                      minLength: {
                        value: 2,
                        message: 'Le prénom doit contenir au moins 2 caractères'
                      }
                    })}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Ex: Dupont"
                    {...register('lastName', { 
                      required: 'Le nom est requis',
                      minLength: {
                        value: 2,
                        message: 'Le nom doit contenir au moins 2 caractères'
                      }
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email *</Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    errors.email ? 'text-destructive' : 'text-muted-foreground'
                  }`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@domaine.com"
                    className={`pl-10 ${!isEmailAvailable && 'border-destructive'}`}
                    {...register('email', { 
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Adresse email invalide'
                      },
                      onChange: async (e) => {
                        await checkEmailAvailability(e.target.value);
                      }
                    })}
                  />
                </div>
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : !isEmailAvailable ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Cette adresse email est déjà utilisée
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    errors.phone ? 'text-destructive' : 'text-muted-foreground'
                  }`} />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ex: +243 81 234 5678"
                    className={`pl-10 ${!isPhoneAvailable && 'border-destructive'}`}
                    {...register('phone', { 
                      required: 'Le numéro de téléphone est requis',
                      pattern: {
                        value: /^\+?[0-9\s-]{10,}$/,
                        message: 'Numéro de téléphone invalide'
                      },
                      onChange: async (e) => {
                        await checkPhoneAvailability(e.target.value);
                      }
                    })}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                ) : !isPhoneAvailable ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Ce numéro de téléphone est déjà utilisé
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select 
                  value={watch('role')} 
                  onValueChange={(value) => setValue('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          {role.id === 'admin' && <UserCog className="h-4 w-4" />}
                          {role.id === 'operator' && <Building2 className="h-4 w-4" />}
                          {role.id === 'driver' && <User className="h-4 w-4" />}
                          {role.id === 'customer' && <User className="h-4 w-4" />}
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Définit les permissions de l'utilisateur dans le système
                </p>
              </div>
            </CardContent>
          </Card>

          {!initialData._id && (
            <Card>
              <CardHeader>
                <CardTitle>Mot de passe</CardTitle>
                <CardDescription>
                  Définissez un mot de passe sécurisé pour cet utilisateur
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...register('password', { 
                        required: 'Le mot de passe est requis',
                        minLength: {
                          value: 8,
                          message: 'Le mot de passe doit contenir au moins 8 caractères'
                        },
                        validate: (value) => {
                          if (!value) return true;
                          return (
                            [/[A-Z]/.test(value) || 'Au moins une majuscule',
                             /[a-z]/.test(value) || 'Au moins une minuscule',
                             /[0-9]/.test(value) || 'Au moins un chiffre',
                             /[^A-Za-z0-9]/.test(value) || 'Au moins un caractère spécial']
                              .find((rule) => typeof rule === 'string')
                          ) || true;
                        }
                      })
                    }
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...register('confirmPassword', {
                        validate: (value) => 
                          value === watch('password') || 'Les mots de passe ne correspondent pas'
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">
                    Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  placeholder="Nom de l'entreprise"
                  {...register('company')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Poste occupé</Label>
                <Input
                  id="position"
                  placeholder="Ex: Responsable logistique"
                  {...register('position')}
                />
              </div>

              <div className="flex items-center justify-between space-x-2 pt-2">
                <div>
                  <Label htmlFor="isActive">Compte actif</Label>
                  <p className="text-sm text-muted-foreground">
                    {watch('isActive') ? 'Le compte est actif' : 'Le compte est désactivé'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>

              {!initialData._id && (
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="sendWelcomeEmail"
                    checked={watch('sendWelcomeEmail')}
                    onCheckedChange={(checked) => setValue('sendWelcomeEmail', checked)}
                  />
                  <Label htmlFor="sendWelcomeEmail">
                    <div>Envoyer un email de bienvenue</div>
                    <p className="text-xs text-muted-foreground font-normal">
                      Inclut les instructions de connexion
                    </p>
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Conseil</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Assurez-vous que toutes les informations fournies sont exactes. 
                  Les champs marqués d'un astérisque (*) sont obligatoires.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          disabled={isSubmitting || isChecking}
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || isChecking || !isEmailAvailable || !isPhoneAvailable}
        >
          {isSubmitting || isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isSubmitting ? 'Enregistrement...' : 'Vérification...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {initialData._id ? 'Mettre à jour' : 'Créer l\'utilisateur'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
