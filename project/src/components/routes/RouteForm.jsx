import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Loader2, MapPin, Clock, Route, ArrowRight, X, Save, Info } from 'lucide-react';

const ROUTE_TYPES = [
  { id: 'intercity', name: 'Interurbain' },
  { id: 'intracity', name: 'Urbain' },
  { id: 'airport', name: 'Aéroport' },
  { id: 'special', name: 'Spécial' },
];

const RouteForm = ({ 
  onSubmit, 
  initialData = {}, 
  isSubmitting = false,
  onCancel
}) => {
  const [waypoints, setWaypoints] = useState(initialData.waypoints || []);
  const [newWaypoint, setNewWaypoint] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: initialData.name || '',
      code: initialData.code || '',
      type: initialData.type || 'intercity',
      origin: initialData.origin || '',
      destination: initialData.destination || '',
      distance: initialData.distance || 0,
      estimatedDuration: initialData.estimatedDuration || 0,
      isActive: initialData.isActive ?? true,
      description: initialData.description || '',
      waypoints: initialData.waypoints || []
    }
  });

  useEffect(() => {
    setValue('waypoints', waypoints);
  }, [waypoints, setValue]);

  const addWaypoint = (e) => {
    e?.preventDefault();
    if (newWaypoint.trim() && !waypoints.includes(newWaypoint.trim())) {
      setWaypoints([...waypoints, newWaypoint.trim()]);
      setNewWaypoint('');
    }
  };

  const removeWaypoint = (index) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 1);
    setWaypoints(updatedWaypoints);
  };

  const processSubmit = (data) => {
    onSubmit({
      ...data,
      distance: parseFloat(data.distance) || 0,
      estimatedDuration: parseFloat(data.estimatedDuration) || 0,
      waypoints
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Détails de l'itinéraire
              </CardTitle>
              <CardDescription>
                Définissez les points de départ, d'arrivée et les étapes intermédiaires
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Ville de départ *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="origin"
                      placeholder="Ex: Kinshasa"
                      className="pl-10"
                      {...register('origin', { required: 'La ville de départ est requise' })}
                    />
                  </div>
                  {errors.origin && <p className="text-sm text-red-500">{errors.origin.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Ville d'arrivée *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Ex: Goma"
                      className="pl-10"
                      {...register('destination', { required: 'La ville d\'arrivée est requise' })}
                    />
                  </div>
                  {errors.destination && <p className="text-sm text-red-500">{errors.destination.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Points d'arrêt intermédiaires</Label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Ajouter un point d'arrêt"
                      value={newWaypoint}
                      onChange={(e) => setNewWaypoint(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addWaypoint(e)}
                      className="pl-10"
                    />
                  </div>
                  <Button type="button" onClick={addWaypoint} variant="outline">
                    Ajouter
                  </Button>
                </div>
                
                {waypoints.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {waypoints.map((point, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2 text-sm">
                        <span>{point}</span>
                        <button
                          type="button"
                          onClick={() => removeWaypoint(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km) *</Label>
                  <div className="relative">
                    <Input
                      id="distance"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Ex: 150.5"
                      {...register('distance', { 
                        required: 'La distance est requise',
                        min: { value: 0, message: 'La distance doit être positive' }
                      })}
                    />
                  </div>
                  {errors.distance && <p className="text-sm text-red-500">{errors.distance.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Durée estimée (heures) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="estimatedDuration"
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="Ex: 3.5"
                      className="pl-10"
                      {...register('estimatedDuration', { 
                        required: 'La durée estimée est requise',
                        min: { value: 0.1, message: 'La durée doit être supérieure à 0' }
                      })}
                    />
                  </div>
                  {errors.estimatedDuration && <p className="text-sm text-red-500">{errors.estimatedDuration.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description et détails</CardTitle>
              <CardDescription>
                Fournissez des informations supplémentaires sur cet itinéraire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description de l'itinéraire</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez l'itinéraire, les points d'intérêt, les arrêts principaux, etc."
                  className="min-h-[120px]"
                  {...register('description')}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="isActive">Itinéraire actif</Label>
                  <p className="text-sm text-muted-foreground">
                    {watch('isActive') ? 'Visible pour les réservations' : 'Masqué des réservations'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code d'itinéraire *</Label>
                <Input
                  id="code"
                  placeholder="Ex: KIN-GOM"
                  {...register('code', { 
                    required: 'Le code est requis',
                    pattern: {
                      value: /^[A-Z0-9-]+$/,
                      message: 'Utilisez uniquement des lettres majuscules, chiffres et tirets'
                    }
                  })}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Code unique pour identifier facilement cet itinéraire
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom d'affichage *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Kinshasa - Goma"
                  {...register('name', { required: 'Le nom est requis' })}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Nom complet de l'itinéraire tel qu'il apparaîtra aux utilisateurs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type d'itinéraire *</Label>
                <Select 
                  value={watch('type')} 
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROUTE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Catégorisez cet itinéraire pour faciliter la recherche
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Conseil</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Assurez-vous que tous les champs obligatoires sont remplis avant de sauvegarder.
                  Vérifiez l'exactitude des distances et des durées pour une meilleure expérience utilisateur.
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
          disabled={isSubmitting}
          onClick={onCancel}
        >
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer l'itinéraire
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default RouteForm;
