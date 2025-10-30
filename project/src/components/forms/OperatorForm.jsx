import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

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
            <label htmlFor="name" className="block text-sm font-medium">Nom de l'opérateur *</label>
            <input id="name" className="w-full px-3 py-2 border rounded"
              {...register('name', { required: true })}
              placeholder="Ex: Transco" />
            {errors.name && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="block text-sm font-medium">Type d'opérateur *</label>
            <select id="type" className="w-full px-3 py-2 border rounded"
              value={watch('type')}
              onChange={(e) => setValue('type', e.target.value)}
            >
              {OPERATOR_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.type && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea id="description" rows={3}
            className="w-full px-3 py-2 border rounded"
            {...register('description')}
            placeholder="Description de l'opérateur et de ses services" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Coordonnées</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="contact_email" className="block text-sm font-medium">Email de contact *</label>
            <input id="contact_email" type="email" className="w-full px-3 py-2 border rounded"
              {...register('contact_email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
              placeholder="contact@example.com" />
            {errors.contact_email && (
              <p className="text-sm text-red-500">Veuillez entrer une adresse email valide</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contact_phone" className="block text-sm font-medium">Téléphone *</label>
            <input id="contact_phone" className="w-full px-3 py-2 border rounded"
              {...register('contact_phone', { required: true })}
              placeholder="+243 00 000 0000" />
            {errors.contact_phone && (
              <p className="text-sm text-red-500">Ce champ est requis</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="address" className="block text-sm font-medium">Adresse</label>
            <input id="address" className="w-full px-3 py-2 border rounded"
              {...register('address')}
              placeholder="Adresse physique" />
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium">Ville</label>
            <input id="city" className="w-full px-3 py-2 border rounded"
              {...register('city')}
              placeholder="Ville" />
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium">Pays</label>
            <input id="country" className="w-full px-3 py-2 border rounded"
              {...register('country')}
              placeholder="Pays" />
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
              <label htmlFor={`service-${service.id}`} className="text-sm font-medium">{service.name}</label>
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
          <input type="checkbox" className="h-5 w-5"
            checked={watch('is_active')}
            onChange={(e) => setValue('is_active', e.target.checked)} />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" className="px-4 py-2 border rounded" disabled={isSubmitting}>Annuler</button>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
};

export default OperatorForm;
