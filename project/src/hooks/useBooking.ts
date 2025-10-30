// Hook pour la gestion de la réservation
import { useState } from 'react';
import { Trip as ImportedTrip } from '../types';

export function useBooking() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ImportedTrip | null>(null);

  const handleBookNow = (trip: ImportedTrip) => {
    setSelectedTrip(trip);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedTrip(null);
    // Optionnel: afficher une notification de succès
  };

  return {
    showBookingModal,
    setShowBookingModal,
    selectedTrip,
    setSelectedTrip,
    handleBookNow,
    handleBookingSuccess,
  };
}
