import { useState, useEffect } from 'react';
import { X, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface TripTrackingModalProps {
  bookingId: string;
  onClose: () => void;
}

interface TrackingStep {
  id: string;
  status: 'completed' | 'current' | 'pending';
  title: string;
  description: string;
  time?: string;
  location?: string;
}

interface TripTracking {
  booking_reference: string;
  trip_info: {
    departure_city: string;
    arrival_city: string;
    departure_time: string;
    estimated_arrival: string;
    vehicle_number: string;
    driver_name: string;
  };
  current_status: string;
  current_location: string;
  progress_percentage: number;
  steps: TrackingStep[];
  last_update: string;
}

export function TripTrackingModal({ bookingId, onClose }: TripTrackingModalProps) {
  const [tracking, setTracking] = useState<TripTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrackingData();
    // Simuler des mises à jour en temps réel
    const interval = setInterval(loadTrackingData, 30000); // Mise à jour toutes les 30 secondes
    return () => clearInterval(interval);
  }, [bookingId]);

  const loadTrackingData = async () => {
    try {
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Données de démonstration pour le tracking
      const demoTracking: { [key: string]: TripTracking } = {
        'booking-demo-1': {
          booking_reference: 'CM-2024-001',
          trip_info: {
            departure_city: 'Kinshasa',
            arrival_city: 'Lubumbashi',
            departure_time: new Date(Date.now() + 2*60*60*1000).toISOString(),
            estimated_arrival: new Date(Date.now() + 8*60*60*1000).toISOString(),
            vehicle_number: 'TC-001',
            driver_name: 'Jean-Baptiste Mukendi'
          },
          current_status: 'En route vers Kikwit',
          current_location: 'Kikwit, Bandundu',
          progress_percentage: 35,
          steps: [
            {
              id: '1',
              status: 'completed',
              title: 'Départ confirmé',
              description: 'Le véhicule a quitté la gare de Kinshasa',
              time: new Date(Date.now() - 2*60*60*1000).toLocaleTimeString('fr-FR'),
              location: 'Gare Centrale, Kinshasa'
            },
            {
              id: '2',
              status: 'completed',
              title: 'Première escale',
              description: 'Arrêt technique et contrôle passagers',
              time: new Date(Date.now() - 1*60*60*1000).toLocaleTimeString('fr-FR'),
              location: 'Checkpoint Matadi Mayo'
            },
            {
              id: '3',
              status: 'current',
              title: 'En transit',
              description: 'Voyage en cours vers la prochaine destination',
              time: new Date().toLocaleTimeString('fr-FR'),
              location: 'Route Kikwit-Kananga'
            },
            {
              id: '4',
              status: 'pending',
              title: 'Escale Kananga',
              description: 'Arrêt prévu pour ravitaillement',
              location: 'Gare de Kananga'
            },
            {
              id: '5',
              status: 'pending',
              title: 'Arrivée prévue',
              description: 'Arrivée à la destination finale',
              location: 'Gare Centrale, Lubumbashi'
            }
          ],
          last_update: new Date().toISOString()
        },
        'booking-demo-2': {
          booking_reference: 'CM-2024-002',
          trip_info: {
            departure_city: 'Kinshasa',
            arrival_city: 'Matadi',
            departure_time: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
            estimated_arrival: new Date(Date.now() + 7*24*60*60*1000 + 5*60*60*1000).toISOString(),
            vehicle_number: 'KT-205',
            driver_name: 'Marie Nsimba'
          },
          current_status: 'Voyage programmé',
          current_location: 'Gare Centrale, Kinshasa',
          progress_percentage: 0,
          steps: [
            {
              id: '1',
              status: 'pending',
              title: 'Embarquement',
              description: 'Présentation des billets et embarquement',
              location: 'Gare Centrale, Kinshasa'
            },
            {
              id: '2',
              status: 'pending',
              title: 'Départ',
              description: 'Départ vers Matadi',
              location: 'Kinshasa'
            },
            {
              id: '3',
              status: 'pending',
              title: 'Arrivée',
              description: 'Arrivée à destination',
              location: 'Gare de Matadi'
            }
          ],
          last_update: new Date().toISOString()
        }
      };

      const trackingData = demoTracking[bookingId];
      if (trackingData) {
        setTracking(trackingData);
      } else {
        setError('Informations de suivi non disponibles');
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current':
        return <Clock className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement du suivi...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <p className="text-red-600 mb-4">❌ {error || 'Données de suivi introuvables'}</p>
          <button onClick={onClose} className="w-full px-4 py-2 bg-slate-200 rounded-lg">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Suivi du Voyage</h2>
                <p className="text-blue-50 text-sm">{tracking.booking_reference}</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Fermer" title="Fermer" className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Trip Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">🚌 Informations du voyage</h3>
                <div className="space-y-2">
                  <p><span className="text-slate-600">Trajet:</span> <strong>{tracking.trip_info.departure_city} → {tracking.trip_info.arrival_city}</strong></p>
                  <p><span className="text-slate-600">Véhicule:</span> <strong>{tracking.trip_info.vehicle_number}</strong></p>
                  <p><span className="text-slate-600">Chauffeur:</span> <strong>{tracking.trip_info.driver_name}</strong></p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">⏰ Horaires</h3>
                <div className="space-y-2">
                  <p><span className="text-slate-600">Départ:</span> <strong>{new Date(tracking.trip_info.departure_time).toLocaleString('fr-FR')}</strong></p>
                  <p><span className="text-slate-600">Arrivée prévue:</span> <strong>{new Date(tracking.trip_info.estimated_arrival).toLocaleString('fr-FR')}</strong></p>
                  <p><span className="text-slate-600">Dernière mise à jour:</span> <strong>{new Date(tracking.last_update).toLocaleTimeString('fr-FR')}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-8 h-8 text-blue-600 flex items-center justify-center text-2xl">🚌</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{tracking.current_status}</h3>
                <p className="text-slate-600">📍 {tracking.current_location}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Progression du voyage</span>
                <span>{tracking.progress_percentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${tracking.progress_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">📍 Étapes du voyage</h3>
            <div className="space-y-6">
              {tracking.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-semibold ${
                        step.status === 'completed' ? 'text-green-700' :
                        step.status === 'current' ? 'text-blue-700' :
                        'text-slate-500'
                      }`}>
                        {step.title}
                      </h4>
                      {step.time && (
                        <span className="text-sm text-slate-500">• {step.time}</span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-1">{step.description}</p>
                    {step.location && (
                      <p className="text-sm text-slate-500">📍 {step.location}</p>
                    )}
                  </div>
                  {index < tracking.steps.length - 1 && (
                    <div className="absolute left-[35px] mt-8 w-0.5 h-6 bg-slate-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={loadTrackingData}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Clock className="w-5 h-5" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              <X className="w-5 h-5" />
              <span>Fermer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
