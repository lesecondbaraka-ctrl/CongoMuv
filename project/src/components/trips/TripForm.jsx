import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format, addDays } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Clock, MapPin, Bus, User, CreditCard, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

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
      departureDateTime: `${format(new Date(data.departureDate), 'yyyy-MM-dd')}T${data.departureTime}:00`,
      arrivalDateTime: `${format(new Date(data.arrivalDate), 'yyyy-MM-dd')}T${data.arrivalTime}:00`,
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
            <Label htmlFor="operatorId">Opérateur *</Label>
            <Select 
              value={selectedOperator} 
              onValueChange={(value) => {
                setSelectedOperator(value);
                setValue('vehicleId', ''); // Réinitialiser la sélection du véhicule
              }}
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
            {errors.operatorId && <p className="text-sm text-red-500">Ce champ est requis</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleId">Véhicule *</Label>
            <Select 
              value={watch('vehicleId')} 
              onValueChange={(value) => setValue('vehicleId', value)}
              disabled={!selectedOperator}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedOperator ? "Sélectionner un véhicule" : "Sélectionnez d'abord un opérateur"} />
              </SelectTrigger>
              <SelectContent>
                {filteredVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.licensePlate} ({vehicle.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="routeId">Itinéraire *</Label>
            <Select 
              value={watch('routeId')} 
              onValueChange={(value) => setValue('routeId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un itinéraire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="route-1">Kinshasa - Matadi</SelectItem>
                <SelectItem value="route-2">Kinshasa - Kikwit</SelectItem>
                <SelectItem value="route-3">Kinshasa - Mbuji-Mayi</SelectItem>
              </SelectContent>
            </Select>
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
              <Label>Date de départ *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "PPP") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Heure de départ *</Label>
              <Input 
                type="time" 
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date d'arrivée *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !arrivalDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {arrivalDate ? format(arrivalDate, "PPP") : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={arrivalDate}
                    onSelect={setArrivalDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Heure d'arrivée *</Label>
              <Input 
                type="time" 
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
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
              <Label htmlFor="price">Prix (CDF) *</Label>
              <Input 
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price', { required: 'Le prix est requis' })}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableSeats">Places disponibles *</Label>
              <Input 
                id="availableSeats"
                type="number"
                min="1"
                {...register('availableSeats', { 
                  required: 'Le nombre de places est requis',
                  min: { value: 1, message: 'Minimum 1 place' }
                })}
              />
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
              <Label htmlFor="status">Statut *</Label>
              <Select 
                value={watch('status')} 
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Planifié</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="delayed">Retardé</SelectItem>
                </SelectContent>
              </Select>
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
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le trajet'}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
