import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

const OPERATOR_TYPES = [
  { value: 'bus', label: 'Compagnie de bus' },
  { value: 'agency', label: 'Agence de voyage' },
  { value: 'taxi', label: 'Service de taxi' },
  { value: 'other', label: 'Autre' },
];

const OperatorForm = ({ onSubmit, initialData = {}, isSubmitting = false }) => {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: initialData.name || '',
      type: initialData.type || 'bus',
      description: initialData.description || '',
      logo_url: initialData.logo_url || '',
      contact_email: initialData.contact_email || '',
      contact_phone: initialData.contact_phone || '',
      address: initialData.address || '',
      city: initialData.city || '',
      country: initialData.country || 'RDC',
      is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      services: initialData.services || [],
    }
  });

  const [availableServices, setAvailableServices] = useState([
    { id: 'wifi', name: 'Wi-Fi' },
    { id: 'ac', name: 'Climatisation' },
    { id: 'toilet', name: 'Toilettes' },
    { id: 'tv', name: 'Télévision' },
    { id: 'usb', name: 'Ports USB' },
    { id: 'snacks', name: 'Collations' },
  ]);

  const toggleService = (serviceId) => {
    const currentServices = [...watch('services')];
    if (currentServices.includes(serviceId)) {
      setValue('services', currentServices.filter(id => id !== serviceId));
    } else {
      setValue('services', [...currentServices, serviceId]);
    }
  };

  const processSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Informations de base</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'opérateur *</Label>
            <Input
              id="name"
              {...register('name', { required: true })}
              placeholder="Ex: Transco"
            />
            {errors.name && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type d'opérateur *</Label>
            <Select 
              onValueChange={(value) => setValue('type', value)}
              defaultValue={watch('type')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {OPERATOR_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Description de l'opérateur et de ses services"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Coordonnées</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email de contact *</Label>
            <Input
              id="contact_email"
              type="email"
              {...register('contact_email', { 
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              })}
              placeholder="contact@example.com"
            />
            {errors.contact_email && (
              <p className="text-sm text-red-500">Veuillez entrer une adresse email valide</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Téléphone *</Label>
            <Input
              id="contact_phone"
              {...register('contact_phone', { required: true })}
              placeholder="+243 00 000 0000"
            />
            {errors.contact_phone && (
              <p className="text-sm text-red-500">Ce champ est requis</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="Adresse physique"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              {...register('city')}
              placeholder="Ville"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Input
              id="country"
              {...register('country')}
              placeholder="Pays"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Services proposés</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableServices.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`service-${service.id}`}
                checked={watch('services').includes(service.id)}
                onChange={() => toggleService(service.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor={`service-${service.id}`} className="text-sm font-medium">
                {service.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Paramètres</h2>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Activer l'opérateur</h3>
            <p className="text-sm text-gray-500">Les opérateurs désactivés ne sont pas visibles sur la plateforme</p>
          </div>
          <Switch
            checked={watch('is_active')}
            onCheckedChange={(checked) => setValue('is_active', checked)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};

export default OperatorForm;
