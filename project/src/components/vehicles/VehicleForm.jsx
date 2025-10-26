import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Loader2, Bus, Save, X, Calendar as CalendarIcon, Users, Wifi, Snowflake, Tv, Usb } from 'lucide-react';

const VEHICLE_TYPES = [
  { id: 'bus', name: 'Bus' },
  { id: 'minibus', name: 'Minibus' },
  { id: 'van', name: 'Fourgonnette' },
  { id: 'car', name: 'Voiture' },
  { id: 'other', name: 'Autre' },
];

const VEHICLE_FEATURES = [
  { id: 'wifi', name: 'Wi-Fi', icon: <Wifi className="h-4 w-4" /> },
  { id: 'ac', name: 'Climatisation', icon: <Snowflake className="h-4 w-4" /> },
  { id: 'tv', name: 'Télévision', icon: <Tv className="h-4 w-4" /> },
  { id: 'usb', name: 'Ports USB', icon: <Usb className="h-4 w-4" /> },
  { id: 'toilet', name: 'Toilettes', icon: null },
  { id: 'snacks', name: 'Collations', icon: null },
];

const VehicleForm = ({ onSubmit, initialData = {}, isSubmitting = false, operators = [] }) => {
  const [selectedFeatures, setSelectedFeatures] = useState(initialData.features || []);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      name: initialData.name || '',
      licensePlate: initialData.licensePlate || '',
      type: initialData.type || 'bus',
      capacity: initialData.capacity || '',
      year: initialData.year || new Date().getFullYear(),
      operatorId: initialData.operatorId || '',
      isActive: initialData.isActive ?? true,
      features: initialData.features || [],
      notes: initialData.notes || ''
    }
  });

  const toggleFeature = (featureId) => {
    const newFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId];
    
    setSelectedFeatures(newFeatures);
    setValue('features', newFeatures);
  };

  const processSubmit = (data) => {
    onSubmit({
      ...data,
      capacity: parseInt(data.capacity, 10),
      year: parseInt(data.year, 10),
      features: selectedFeatures
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Informations du véhicule
            </CardTitle>
            <CardDescription>Renseignez les détails de base du véhicule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du véhicule *</Label>
              <Input
                id="name"
                placeholder="Ex: Bus VIP 25 places"
                {...register('name', { required: 'Le nom est requis' })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Plaque d'immatriculation *</Label>
                <Input
                  id="licensePlate"
                  placeholder="Ex: CGO1234AB"
                  {...register('licensePlate', { 
                    required: 'La plaque est requise',
                    pattern: {
                      value: /^[A-Z0-9- ]+$/i,
                      message: 'Format de plaque invalide'
                    }
                  })}
                />
                {errors.licensePlate && <p className="text-sm text-red-500">{errors.licensePlate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de véhicule *</Label>
                <Select 
                  value={watch('type')} 
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Nombre de places *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="Ex: 25"
                  {...register('capacity', { 
                    required: 'La capacité est requise',
                    min: { value: 1, message: 'La capacité doit être supérieure à 0' }
                  })}
                />
                {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Année de fabrication *</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder="Ex: 2020"
                    className="pl-10"
                    {...register('year', { 
                      required: "L'année est requise",
                      min: { value: 1900, message: 'Année invalide' },
                      max: { 
                        value: new Date().getFullYear() + 1, 
                        message: 'Année dans le futur' 
                      }
                    })}
                  />
                </div>
                {errors.year && <p className="text-sm text-red-500">{errors.year.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="operatorId">Opérateur *</Label>
              <Select 
                value={watch('operatorId')} 
                onValueChange={(value) => setValue('operatorId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.operatorId && <p className="text-sm text-red-500">Veuillez sélectionner un opérateur</p>}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Équipements et statut
              </CardTitle>
              <CardDescription>Sélectionnez les équipements disponibles dans ce véhicule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {VEHICLE_FEATURES.map((feature) => (
                    <div 
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-colors ${
                        selectedFeatures.includes(feature.id) 
                          ? 'border-primary bg-primary/10' 
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <div className={`p-1.5 rounded-full ${
                        selectedFeatures.includes(feature.id) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        {feature.icon || <span className="h-4 w-4 block" />}
                      </div>
                      <span className="text-sm">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isActive" className="flex flex-col space-y-1">
                  <span>Véhicule actif</span>
                  <span className="font-normal text-sm text-muted-foreground">
                    {watch('isActive') ? 'Visible et disponible' : 'Masqué et indisponible'}
                  </span>
                </Label>
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="notes">Notes internes</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Informations supplémentaires sur le véhicule..."
                  {...register('notes')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          disabled={isSubmitting}
          onClick={() => window.history.back()}
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
              Enregistrer le véhicule
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;
