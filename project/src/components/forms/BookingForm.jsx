import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

const BookingForm = ({ onSubmit, initialData = {}, isSubmitting = false }) => {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      trip_id: initialData.trip_id || '',
      passengers: initialData.passengers || [{ full_name: '', age: '', phone: '', id_card: '' }],
      payment_method: initialData.payment_method || 'mobile_money',
    }
  });

  const [availableTrips, setAvailableTrips] = useState([]);
  const [date, setDate] = useState(initialData.date || new Date());

  // Charger les trajets disponibles
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips/available');
        const data = await response.json();
        setAvailableTrips(data);
      } catch (error) {
        console.error('Erreur lors du chargement des trajets:', error);
      }
    };
    fetchTrips();
  }, []);

  const addPassenger = () => {
    setValue('passengers', [...watch('passengers'), { full_name: '', age: '', phone: '', id_card: '' }]);
  };

  const removePassenger = (index) => {
    const passengers = [...watch('passengers')];
    passengers.splice(index, 1);
    setValue('passengers', passengers);
  };

  const processSubmit = (data) => {
    onSubmit({
      ...data,
      date: date.toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Détails du trajet</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trip_id">Sélectionner un trajet</Label>
            <Select 
              onValueChange={(value) => setValue('trip_id', value)}
              defaultValue={initialData.trip_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un trajet" />
              </SelectTrigger>
              <SelectContent>
                {availableTrips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {`${trip.departure_city} → ${trip.arrival_city} - ${format(new Date(trip.departure_time), 'PPpp')}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.trip_id && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>

          <div>
            <Label>Date du voyage</Label>
            <div className="flex items-center gap-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
              <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Choisir une date</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Informations des passagers</h2>
          <Button type="button" onClick={addPassenger} variant="outline" size="sm">
            Ajouter un passager
          </Button>
        </div>

        {watch('passengers').map((passenger, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-4 relative">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removePassenger(index)}
              disabled={watch('passengers').length <= 1}
            >
              ×
            </Button>
            <h3 className="font-medium">Passager {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`passengers.${index}.full_name`}>Nom complet</Label>
                <Input
                  id={`passengers.${index}.full_name`}
                  {...register(`passengers.${index}.full_name`, { required: true })}
                  placeholder="Jean Dupont"
                />
                {errors.passengers?.[index]?.full_name && (
                  <p className="text-sm text-red-500">Ce champ est requis</p>
                )}
              </div>
              <div>
                <Label htmlFor={`passengers.${index}.age`}>Âge</Label>
                <Input
                  id={`passengers.${index}.age`}
                  type="number"
                  min="1"
                  max="120"
                  {...register(`passengers.${index}.age`, { required: true, min: 1, max: 120 })}
                  placeholder="30"
                />
                {errors.passengers?.[index]?.age && (
                  <p className="text-sm text-red-500">Âge invalide</p>
                )}
              </div>
              <div>
                <Label htmlFor={`passengers.${index}.phone`}>Téléphone</Label>
                <Input
                  id={`passengers.${index}.phone`}
                  {...register(`passengers.${index}.phone`, { required: true })}
                  placeholder="+243 00 000 0000"
                />
                {errors.passengers?.[index]?.phone && (
                  <p className="text-sm text-red-500">Ce champ est requis</p>
                )}
              </div>
              <div>
                <Label htmlFor={`passengers.${index}.id_card`}>N° Carte d'identité</Label>
                <Input
                  id={`passengers.${index}.id_card`}
                  {...register(`passengers.${index}.id_card`, { required: true })}
                  placeholder="N° de carte d'identité"
                />
                {errors.passengers?.[index]?.id_card && (
                  <p className="text-sm text-red-500">Ce champ est requis</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Paiement</h2>
        <div className="space-y-2">
          <Label>Méthode de paiement</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="radio"
                id="mobile_money"
                value="mobile_money"
                className="peer hidden"
                {...register('payment_method')}
              />
              <label
                htmlFor="mobile_money"
                className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500"
              >
                <span className="text-sm font-medium">Mobile Money</span>
                <span className="text-xs text-gray-500">Airtel Money, M-Pesa, Orange Money</span>
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="credit_card"
                value="credit_card"
                className="peer hidden"
                {...register('payment_method')}
              />
              <label
                htmlFor="credit_card"
                className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500"
              >
                <span className="text-sm font-medium">Carte bancaire</span>
                <span className="text-xs text-gray-500">Visa, Mastercard</span>
              </label>
            </div>
            <div>
              <input
                type="radio"
                id="cash"
                value="cash"
                className="peer hidden"
                {...register('payment_method')}
              />
              <label
                htmlFor="cash"
                className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-blue-500 peer-checked:ring-1 peer-checked:ring-blue-500"
              >
                <span className="text-sm font-medium">Espèces</span>
                <span className="text-xs text-gray-500">Paiement au guichet</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Traitement...' : 'Confirmer la réservation'}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
