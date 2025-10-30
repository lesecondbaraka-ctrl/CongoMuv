import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
      operatorId: initialData.operatorId || '',
      basePrice: initialData.basePrice || 0,
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
      operatorId: data.operatorId,
      basePrice: parseFloat(data.basePrice) || 0,
      distance: parseFloat(data.distance) || 0,
      estimatedDuration: parseFloat(data.estimatedDuration) || 0,
      waypoints
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="border rounded-xl p-4 bg-white">
            <div className="mb-2 flex items-center gap-2 text-slate-900 font-semibold">
              <Route className="h-5 w-5" /> Détails de l'itinéraire
            </div>
            <p className="text-sm text-slate-600 mb-4">Définissez les points de départ, d'arrivée et les étapes intermédiaires</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="operatorId" className="block text-sm font-medium">Opérateur (ID) *</label>
                  <input id="operatorId" placeholder="ID opérateur" className="w-full px-3 py-2 border rounded"
                    {...register('operatorId', { required: 'L\'opérateur est requis' })}
                  />
                  {errors.operatorId && <p className="text-sm text-red-500">{errors.operatorId.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="basePrice" className="block text-sm font-medium">Prix de base (CDF) *</label>
                  <input id="basePrice" type="number" step="0.01" min="0" placeholder="Ex: 20000" className="w-full px-3 py-2 border rounded"
                    {...register('basePrice', { required: 'Le prix de base est requis', min: { value: 0, message: 'Doit être >= 0' } })}
                  />
                  {errors.basePrice && <p className="text-sm text-red-500">{errors.basePrice.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="origin" className="block text-sm font-medium">Ville de départ *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="origin" placeholder="Ex: Kinshasa" className="pl-10 w-full px-3 py-2 border rounded"
                      {...register('origin', { required: 'La ville de départ est requise' })}
                    />
                  </div>
                  {errors.origin && <p className="text-sm text-red-500">{errors.origin.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="destination" className="block text-sm font-medium">Ville d'arrivée *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="destination" placeholder="Ex: Goma" className="pl-10 w-full px-3 py-2 border rounded"
                      {...register('destination', { required: 'La ville d\'arrivée est requise' })}
                    />
                  </div>
                  {errors.destination && <p className="text-sm text-red-500">{errors.destination.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Points d'arrêt intermédiaires</label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Ajouter un point d'arrêt" value={newWaypoint} onChange={(e) => setNewWaypoint(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addWaypoint(e)} className="pl-10 w-full px-3 py-2 border rounded" />
                  </div>
                  <button type="button" onClick={addWaypoint} className="px-3 py-2 border rounded">Ajouter</button>
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
                  <label htmlFor="distance" className="block text-sm font-medium">Distance (km) *</label>
                  <div className="relative">
                    <input id="distance" type="number" step="0.1" min="0" placeholder="Ex: 150.5" className="w-full px-3 py-2 border rounded"
                      {...register('distance', { required: 'La distance est requise', min: { value: 0, message: 'La distance doit être positive' } })}
                    />
                  </div>
                  {errors.distance && <p className="text-sm text-red-500">{errors.distance.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="estimatedDuration" className="block text-sm font-medium">Durée estimée (heures) *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input id="estimatedDuration" type="number" step="0.5" min="0" placeholder="Ex: 3.5" className="pl-10 w-full px-3 py-2 border rounded"
                      {...register('estimatedDuration', { required: 'La durée estimée est requise', min: { value: 0.1, message: 'La durée doit être supérieure à 0' } })}
                    />
                  </div>
                  {errors.estimatedDuration && <p className="text-sm text-red-500">{errors.estimatedDuration.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-white">
            <div className="mb-2 text-slate-900 font-semibold">Description et détails</div>
            <div className="text-sm text-slate-600 mb-4">Fournissez des informations supplémentaires sur cet itinéraire</div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">Description de l'itinéraire</label>
                <textarea id="description" className="min-h-[120px] w-full px-3 py-2 border rounded"
                  placeholder="Décrivez l'itinéraire, les points d'intérêt, les arrêts principaux, etc."
                  {...register('description')}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <label htmlFor="isActive" className="block text-sm font-medium">Itinéraire actif</label>
                  <p className="text-sm text-muted-foreground">
                    {watch('isActive') ? 'Visible pour les réservations' : 'Masqué des réservations'}
                  </p>
                </div>
                <input id="isActive" type="checkbox" className="h-5 w-5"
                  checked={watch('isActive')}
                  onChange={(e) => setValue('isActive', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-xl p-4 bg-white">
            <div className="mb-2 text-slate-900 font-semibold">Configuration</div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-medium">Code d'itinéraire *</label>
                <input id="code" className="w-full px-3 py-2 border rounded" placeholder="Ex: KIN-GOM"
                  {...register('code', { required: 'Le code est requis', pattern: { value: /^[A-Z0-9-]+$/, message: 'Utilisez uniquement des lettres majuscules, chiffres et tirets' } })}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
                <p className="text-xs text-muted-foreground">Code unique pour identifier facilement cet itinéraire</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">Nom d'affichage *</label>
                <input id="name" className="w-full px-3 py-2 border rounded" placeholder="Ex: Kinshasa - Goma"
                  {...register('name', { required: 'Le nom est requis' })}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                <p className="text-xs text-muted-foreground">Nom complet de l'itinéraire tel qu'il apparaîtra aux utilisateurs</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium">Type d'itinéraire *</label>
                <select id="type" className="w-full px-3 py-2 border rounded" value={watch('type')} onChange={(e) => setValue('type', e.target.value)}>
                  {ROUTE_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Catégorisez cet itinéraire pour faciliter la recherche</p>
              </div>
            </div>
          </div>

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
        <button type="button" className="px-4 py-2 border rounded" disabled={isSubmitting} onClick={onCancel}>
          <span className="mr-2">✖</span>
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="mr-2 animate-spin">⏳</span>
              Enregistrement...
            </>
          ) : (
            <>
              <span className="mr-2">💾</span>
              Enregistrer l'itinéraire
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RouteForm;
