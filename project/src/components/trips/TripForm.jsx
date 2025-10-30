import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
// Local helpers to avoid external date-fns dependency
const addDays = (date, days) => {
  const d = new Date(date instanceof Date ? date : new Date(date));
  d.setDate(d.getDate() + Number(days || 0));
  return d;
};
const formatDateInput = (date) => {
  const d = new Date(date instanceof Date ? date : new Date(date));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
import { CalendarIcon, Clock, MapPin, Bus, User, CreditCard, Info } from 'lucide-react';

const TripForm = ({ onSubmit, initialData = {}, isSubmitting = false, operators = [], vehicles = [] }) => {
  const [departureDate, setDepartureDate] = useState(initialData.departureDate || new Date());
  const [departureTime, setDepartureTime] = useState(initialData.departureTime || '08:00');
  const [arrivalDate, setArrivalDate] = useState(initialData.arrivalDate || addDays(new Date(), 1));
  const [arrivalTime, setArrivalTime] = useState(initialData.arrivalTime || '10:00');
  const [selectedOperator, setSelectedOperator] = useState(initialData.operatorId || '');
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      routeId: initialData.routeId || '',
      vehicleId: initialData.vehicleId || '',
      operatorId: initialData.operatorId || '',
      departureDate: initialData.departureDate || new Date(),
      departureTime: initialData.departureTime || '08:00',
      arrivalDate: initialData.arrivalDate || addDays(new Date(), 1),
      arrivalTime: initialData.arrivalTime || '10:00',
      price: initialData.price || '',
      availableSeats: initialData.availableSeats || '',
      status: initialData.status || 'scheduled',
      notes: initialData.notes || ''
    }
  });

  // Mise à jour des valeurs du formulaire lorsque les états locaux changent
  useEffect(() => {
    setValue('departureDate', departureDate);
    setValue('arrivalDate', arrivalDate);
    setValue('departureTime', departureTime);
    setValue('arrivalTime', arrivalTime);
    setValue('operatorId', selectedOperator);
  }, [departureDate, arrivalDate, departureTime, arrivalTime, selectedOperator, setValue]);

  // Filtrer les véhicules par opérateur sélectionné
  const filteredVehicles = selectedOperator 
    ? vehicles.filter(vehicle => vehicle.operatorId === selectedOperator)
    : [];

  // Gestion de la soumission du formulaire
  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      departureDateTime: `${formatDateInput(new Date(data.departureDate))}T${data.departureTime}:00`,
      arrivalDateTime: `${formatDateInput(new Date(data.arrivalDate))}T${data.arrivalTime}:00`,
      price: parseFloat(data.price),
      availableSeats: parseInt(data.availableSeats, 10)
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Opérateur et Véhicule */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations de l'opérateur
          </h3>
          
          <div className="space-y-2">
            <label htmlFor="operatorId" className="block text-sm font-medium">Opérateur *</label>
            <select
              id="operatorId"
              className="w-full px-3 py-2 border rounded"
              value={selectedOperator}
              onChange={(e) => {
                setSelectedOperator(e.target.value);
                setValue('vehicleId', '');
              }}
            >
              <option value="" disabled>Sélectionner un opérateur</option>
              {operators.map((operator) => (
                <option key={operator.id} value={operator.id}>{operator.name}</option>
              ))}
            </select>
            {errors.operatorId && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="vehicleId" className="block text-sm font-medium">Véhicule *</label>
            <select
              id="vehicleId"
              className="w-full px-3 py-2 border rounded"
              value={watch('vehicleId')}
              onChange={(e) => setValue('vehicleId', e.target.value)}
              disabled={!selectedOperator}
            >
              <option value="" disabled>{selectedOperator ? 'Sélectionner un véhicule' : "Sélectionnez d'abord un opérateur"}</option>
              {filteredVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} - {vehicle.licensePlate} ({vehicle.type})
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>
        </div>

        {/* Section Itinéraire */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Itinéraire
          </h3>
          
          <div className="space-y-2">
            <label htmlFor="routeId" className="block text-sm font-medium">Itinéraire *</label>
            <select
              id="routeId"
              className="w-full px-3 py-2 border rounded"
              value={watch('routeId')}
              onChange={(e) => setValue('routeId', e.target.value)}
            >
              <option value="" disabled>Sélectionner un itinéraire</option>
              <option value="route-1">Kinshasa - Matadi</option>
              <option value="route-2">Kinshasa - Kikwit</option>
              <option value="route-3">Kinshasa - Mbuji-Mayi</option>
            </select>
            {errors.routeId && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>
        </div>

        {/* Section Dates et Heures */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dates et heures
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Date de départ *</label>
              <input type="date" className="w-full px-3 py-2 border rounded" value={formatDateInput(departureDate)} onChange={(e) => setDepartureDate(new Date(e.target.value))} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Heure de départ *</label>
              <input type="time" className="w-full px-3 py-2 border rounded" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Date d'arrivée *</label>
              <input type="date" className="w-full px-3 py-2 border rounded" value={formatDateInput(arrivalDate)} onChange={(e) => setArrivalDate(new Date(e.target.value))} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Heure d'arrivée *</label>
              <input type="time" className="w-full px-3 py-2 border rounded" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section Tarifs et Places */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Tarifs et places
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-medium">Prix (CDF) *</label>
              <input id="price" type="number" min="0" step="0.01" className="w-full px-3 py-2 border rounded" {...register('price', { required: 'Le prix est requis' })} />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="availableSeats" className="block text-sm font-medium">Places disponibles *</label>
              <input id="availableSeats" type="number" min="1" className="w-full px-3 py-2 border rounded" {...register('availableSeats', { required: 'Le nombre de places est requis', min: { value: 1, message: 'Minimum 1 place' } })} />
              {errors.availableSeats && <p className="text-sm text-red-500">{errors.availableSeats.message}</p>}
            </div>
          </div>
        </div>

        {/* Statut et Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations supplémentaires
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium">Statut *</label>
              <select id="status" className="w-full px-3 py-2 border rounded" value={watch('status')} onChange={(e) => setValue('status', e.target.value)}>
                <option value="scheduled">Planifié</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
                <option value="delayed">Retardé</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('notes')}
                placeholder="Informations supplémentaires sur le trajet..."
                rows="3"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" className="px-4 py-2 border rounded" disabled={isSubmitting}>Annuler</button>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le trajet'}
        </button>
      </div>
    </form>
  );
};

export default TripForm;
