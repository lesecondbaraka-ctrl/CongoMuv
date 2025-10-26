import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, User, Users, MapPin, Clock, ArrowRight, X, Save, Loader2, Info, Ticket, UserPlus } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { cn } from '../../lib/utils';

const PASSENGER_TYPES = [
  { id: 'adult', name: 'Adulte', priceMultiplier: 1 },
  { id: 'child', name: 'Enfant (4-12 ans)', priceMultiplier: 0.7 },
  { id: 'infant', name: 'Bébé (0-3 ans)', priceMultiplier: 0.2 },
  { id: 'student', name: 'Étudiant', priceMultiplier: 0.8 },
  { id: 'senior', name: 'Sénior (+65 ans)', priceMultiplier: 0.85 },
];

const PAYMENT_STATUSES = [
  { id: 'pending', name: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'paid', name: 'Payé', color: 'bg-green-100 text-green-800' },
  { id: 'failed', name: 'Échoué', color: 'bg-red-100 text-red-800' },
  { id: 'refunded', name: 'Remboursé', color: 'bg-blue-100 text-blue-800' },
  { id: 'cancelled', name: 'Annulé', color: 'bg-gray-100 text-gray-800' },
];

const BookingForm = ({ 
  onSubmit, 
  initialData = {}, 
  isSubmitting = false,
  onCancel,
  trips = [],
  users = [],
  vehicles = []
}) => {
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(initialData.seats || []);
  
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    control,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      tripId: initialData.tripId || '',
      userId: initialData.userId || '',
      passengerCount: initialData.passengers?.length || 1,
      passengers: initialData.passengers || [
        { type: 'adult', firstName: '', lastName: '', documentType: 'id', documentNumber: '' }
      ],
      seats: initialData.seats || [],
      contactEmail: initialData.contactEmail || '',
      contactPhone: initialData.contactPhone || '',
      specialRequests: initialData.specialRequests || '',
      paymentStatus: initialData.paymentStatus || 'pending',
      paymentMethod: initialData.paymentMethod || 'cash',
      totalAmount: initialData.totalAmount || 0,
      notes: initialData.notes || ''
    }
  });

  // Mettre à jour les informations du voyage sélectionné
  useEffect(() => {
    if (watch('tripId')) {
      const trip = trips.find(t => t._id === watch('tripId'));
      setSelectedTrip(trip);
      
      if (trip) {
        // Réinitialiser les sièges sélectionnés lors du changement de voyage
        setSelectedSeats([]);
        setValue('seats', []);
        
        // Mettre à jour le montant total basé sur le prix du voyage
        const passengerCount = watch('passengerCount') || 1;
        setValue('totalAmount', trip.price * passengerCount);
      }
    }
  }, [watch('tripId'), trips, setValue, watch('passengerCount')]);

  // Mettre à jour le montant total lorsque le nombre de passagers change
  useEffect(() => {
    if (selectedTrip) {
      const passengerCount = watch('passengerCount') || 1;
      setValue('totalAmount', selectedTrip.price * passengerCount);
    }
  }, [watch('passengerCount'), selectedTrip, setValue]);

  // Gérer l'ajout d'un passager
  const addPassenger = () => {
    const currentPassengers = watch('passengers') || [];
    setValue('passengers', [
      ...currentPassengers,
      { type: 'adult', firstName: '', lastName: '', documentType: 'id', documentNumber: '' }
    ]);
    setValue('passengerCount', currentPassengers.length + 1);
  };

  // Gérer la suppression d'un passager
  const removePassenger = (index) => {
    const currentPassengers = [...(watch('passengers') || [])];
    currentPassengers.splice(index, 1);
    setValue('passengers', currentPassengers);
    setValue('passengerCount', currentPassengers.length);
    
    // Désélectionner le siège si nécessaire
    if (currentPassengers.length < selectedSeats.length) {
      const updatedSeats = [...selectedSeats];
      updatedSeats.splice(index, 1);
      setSelectedSeats(updatedSeats);
      setValue('seats', updatedSeats);
    }
  };

  // Mettre à jour les informations d'un passager
  const updatePassenger = (index, field, value) => {
    const currentPassengers = [...(watch('passengers') || [])];
    currentPassengers[index] = {
      ...currentPassengers[index],
      [field]: value
    };
    setValue('passengers', currentPassengers);
  };

  // Gérer la sélection d'un siège
  const handleSeatSelect = (seatNumber) => {
    const seatIndex = selectedSeats.indexOf(seatNumber);
    let updatedSeats;
    
    if (seatIndex === -1) {
      // Si le nombre maximum de sièges est atteint, ne rien faire
      if (selectedSeats.length >= watch('passengerCount')) {
        toast({
          title: 'Nombre maximum de sièges atteint',
          description: `Vous ne pouvez sélectionner que ${watch('passengerCount')} siège(s).`,
          variant: 'destructive'
        });
        return;
      }
      
      updatedSeats = [...selectedSeats, seatNumber];
    } else {
      updatedSeats = selectedSeats.filter((_, i) => i !== seatIndex);
    }
    
    setSelectedSeats(updatedSeats);
    setValue('seats', updatedSeats);
  };

  // Soumettre le formulaire
  const processSubmit = (data) => {
    // Vérifier que le nombre de sièges sélectionnés correspond au nombre de passagers
    if (data.seats.length !== data.passengerCount) {
      toast({
        title: 'Erreur de sélection',
        description: `Veuillez sélectionner exactement ${data.passengerCount} siège(s).`,
        variant: 'destructive'
      });
      return;
    }
    
    // Vérifier que tous les champs obligatoires des passagers sont remplis
    const incompletePassenger = data.passengers.find(
      (p, index) => !p.firstName || !p.lastName || (p.type !== 'infant' && !p.documentNumber)
    );
    
    if (incompletePassenger) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir tous les champs obligatoires pour chaque passager.',
        variant: 'destructive'
      });
      return;
    }
    
    // Préparer les données pour la soumission
    const bookingData = {
      ...data,
      totalAmount: parseFloat(data.totalAmount),
      passengerCount: parseInt(data.passengerCount, 10),
      ...(initialData._id && { _id: initialData._id })
    };
    
    // Appeler la fonction de soumission fournie par le parent
    onSubmit(bookingData);
  };

  // Générer la disposition des sièges du véhicule
  const renderSeatLayout = () => {
    if (!selectedTrip?.vehicleId) return null;
    
    const vehicle = vehicles.find(v => v._id === selectedTrip.vehicleId);
    if (!vehicle) return null;
    
    const totalSeats = vehicle.capacity || 30;
    const seatsPerRow = 4; // Nombre de sièges par rangée (2x2)
    const totalRows = Math.ceil(totalSeats / seatsPerRow);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Sélection des sièges</h4>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-green-100 border border-green-400 mr-1"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-primary text-primary-foreground flex items-center justify-center mr-1">
                <Check className="h-3 w-3" />
              </div>
              <span>Sélectionné</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-sm bg-gray-200 border border-gray-300 mr-1"></div>
              <span>Occupé</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-center mb-6">
            <div className="w-1/2 h-2 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: totalSeats }).map((_, index) => {
              const seatNumber = index + 1;
              const isSelected = selectedSeats.includes(seatNumber);
              const isBooked = selectedTrip.bookedSeats?.includes(seatNumber);
              
              return (
                <button
                  key={seatNumber}
                  type="button"
                  onClick={() => !isBooked && handleSeatSelect(seatNumber)}
                  disabled={isBooked}
                  className={cn(
                    'flex items-center justify-center h-10 rounded-md border font-medium',
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : isBooked
                        ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50 border-gray-300'
                  )}
                >
                  {seatNumber}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Sièges sélectionnés: {selectedSeats.length} / {watch('passengerCount')}
            </div>
            <div className="font-medium">
              Total: {watch('totalAmount')?.toLocaleString()} CDF
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Détails de la réservation
              </CardTitle>
              <CardDescription>
                Sélectionnez le voyage et les passagers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tripId">Sélectionner un voyage *</Label>
                  <Select
                    value={watch('tripId')}
                    onValueChange={(value) => {
                      setValue('tripId', value);
                      setSelectedTrip(trips.find(t => t._id === value));
                    }}
                    disabled={!!initialData._id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un voyage" />
                    </SelectTrigger>
                    <SelectContent>
                      {trips.map((trip) => (
                        <SelectItem key={trip._id} value={trip._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {trip.origin} <ArrowRight className="inline h-3 w-3 mx-1" /> {trip.destination}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(trip.departureTime), 'PPp', { locale: fr })} • {trip.vehicle?.name || 'Véhicule non spécifié'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tripId && (
                    <p className="text-sm text-destructive">Veuillez sélectionner un voyage</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userId">Client (optionnel)</Label>
                  <Select
                    value={watch('userId')}
                    onValueChange={(value) => setValue('userId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client existant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nouveau client</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTrip && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Itinéraire</p>
                      <p className="font-medium">
                        {selectedTrip.origin} <ArrowRight className="inline h-3 w-3 mx-1" /> {selectedTrip.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date et heure</p>
                      <p className="font-medium">
                        {format(new Date(selectedTrip.departureTime), 'PPp', { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prix par personne</p>
                      <p className="font-medium">{selectedTrip.price?.toLocaleString()} CDF</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Passagers ({watch('passengerCount')})</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addPassenger}
                    disabled={watch('passengers')?.length >= 10}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Ajouter un passager
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {(watch('passengers') || []).map((passenger, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="pt-6">
                        <div className="absolute right-4 top-4">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removePassenger(index)}
                            disabled={watch('passengers')?.length <= 1}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`passenger-${index}-type`}>Type de passager *</Label>
                            <Select
                              value={passenger.type}
                              onValueChange={(value) => updatePassenger(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                                {PASSENGER_TYPES.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name} ({Math.round(selectedTrip?.price * type.priceMultiplier)?.toLocaleString()} CDF)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`passenger-${index}-documentType`}>Type de pièce *</Label>
                            <Select
                              value={passenger.documentType || 'id'}
                              onValueChange={(value) => updatePassenger(index, 'documentType', value)}
                              disabled={passenger.type === 'infant'}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="id">Carte d'identité</SelectItem>
                                <SelectItem value="passport">Passeport</SelectItem>
                                <SelectItem value="driver_license">Permis de conduire</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`passenger-${index}-firstName`}>Prénom *</Label>
                            <Input
                              id={`passenger-${index}-firstName`}
                              placeholder="Prénom"
                              value={passenger.firstName || ''}
                              onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`passenger-${index}-lastName`}>Nom *</Label>
                            <Input
                              id={`passenger-${index}-lastName`}
                              placeholder="Nom"
                              value={passenger.lastName || ''}
                              onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`passenger-${index}-documentNumber`}>
                              {passenger.type === 'infant' ? 'Date de naissance (optionnel)' : 'Numéro de pièce *'}
                            </Label>
                            <Input
                              id={`passenger-${index}-documentNumber`}
                              placeholder={passenger.type === 'infant' ? 'JJ/MM/AAAA' : 'Numéro de pièce'}
                              value={passenger.documentNumber || ''}
                              onChange={(e) => updatePassenger(index, 'documentNumber', e.target.value)}
                              disabled={passenger.type === 'infant'}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {selectedTrip && renderSeatLayout()}
              
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Demandes spéciales</Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Demandes particulières (régime alimentaire, accessibilité, etc.)"
                  {...register('specialRequests')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTrip ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Voyage</p>
                    <div className="font-medium">
                      {selectedTrip.origin} → {selectedTrip.destination}
                    </div>
                    <div className="text-sm">
                      {format(new Date(selectedTrip.departureTime), 'PPPPp', { locale: fr })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Passagers</p>
                    <ul className="space-y-1">
                      {(watch('passengers') || []).map((p, i) => (
                        <li key={i} className="flex justify-between">
                          <span>
                            {p.firstName} {p.lastName}
                            <span className="text-muted-foreground text-xs ml-2">
                              ({PASSENGER_TYPES.find(t => t.id === p.type)?.name || p.type})
                            </span>
                          </span>
                          <span>
                            {Math.round(selectedTrip.price * (PASSENGER_TYPES.find(t => t.id === p.type)?.priceMultiplier || 1)).toLocaleString()} CDF
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>{watch('totalAmount')?.toLocaleString()} CDF</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Taxes et frais inclus
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sélectionnez un voyage pour voir le résumé
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Statut du paiement *</Label>
                <Select
                  value={watch('paymentStatus')}
                  onValueChange={(value) => setValue('paymentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
                            {status.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Méthode de paiement *</Label>
                <Select
                  value={watch('paymentMethod')}
                  onValueChange={(value) => setValue('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="credit_card">Carte bancaire</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes internes</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes concernant cette réservation..."
                  {...register('notes')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Conseil</h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Vérifiez attentivement toutes les informations avant de confirmer la réservation.
                  Assurez-vous que les coordonnées des passagers sont exactes pour éviter tout problème d'embarquement.
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
        <Button type="submit" disabled={isSubmitting || !selectedTrip}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {initialData._id ? 'Mettre à jour' : 'Créer la réservation'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BookingForm;
