import { useState, useEffect } from 'react';
import { MapPin, Clock, Activity, AlertCircle } from 'lucide-react';
import './vehicle-tracking.css';

interface VehiclePosition {
  vehicle_id: string;
  vehicle_number: string;
  trip: {
    departure_city: string;
    arrival_city: string;
  };
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  last_update: string;
  estimated_arrival: string;
}

export function VehicleTracking() {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePosition | null>(null);
  const [, setLoading] = useState(false); // Préfixé par une virgule pour ignorer la variable non utilisée

  useEffect(() => {
    loadVehicles();
    const interval = setInterval(loadVehicles, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      // TODO: Appel API
      // const response = await fetch('http://localhost:3002/api/operator/vehicles/active');
      
      // Données simulées avec positions GPS
      setVehicles([
        {
          vehicle_id: 'VEH-001',
          vehicle_number: 'TRAIN-001',
          trip: { departure_city: 'Kinshasa', arrival_city: 'Lubumbashi' },
          latitude: -4.3276,
          longitude: 15.3136,
          speed: 45,
          heading: 180,
          status: 'en_route',
          last_update: new Date().toISOString(),
          estimated_arrival: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
        },
        {
          vehicle_id: 'VEH-002',
          vehicle_number: 'BUS-012',
          trip: { departure_city: 'Matadi', arrival_city: 'Kinshasa' },
          latitude: -5.8125,
          longitude: 13.4590,
          speed: 60,
          heading: 90,
          status: 'en_route',
          last_update: new Date().toISOString(),
          estimated_arrival: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          vehicle_id: 'VEH-003',
          vehicle_number: 'BATEAU-005',
          trip: { departure_city: 'Kinshasa', arrival_city: 'Kisangani' },
          latitude: -4.2833,
          longitude: 15.2667,
          speed: 15,
          heading: 45,
          status: 'en_route',
          last_update: new Date().toISOString(),
          estimated_arrival: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Erreur chargement véhicules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_route': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      case 'arrived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_route': return 'En route';
      case 'delayed': return 'Retardé';
      case 'stopped': return 'Arrêté';
      case 'arrived': return 'Arrivé';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Suivi GPS en Temps Réel</h2>
          <p className="text-sm text-slate-600">Affichage sur carte du déplacement en direct</p>
        </div>
        <button
          onClick={loadVehicles}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <Activity className="w-4 h-4" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Map Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="map-container">
          {/* Carte simplifiée avec les positions des véhicules */}
          <div className="map-placeholder">
            <div>
              <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>Carte interactive des véhicules</p>
            </div>
          </div>
          
          {/* Marqueurs de véhicules */}
          <div className="absolute inset-0">
            {vehicles.map((vehicle) => {
              // Position aléatoire pour la démo
              const left = 20 + Math.random() * 60;
              const top = 20 + Math.random() * 60;
              
              const isSelected = selectedVehicle?.vehicle_id === vehicle.vehicle_id;
              return (
                <div
                  key={vehicle.vehicle_id}
                  className={`vehicle-marker ${
                    isSelected ? 'selected' : ''
                  } ${vehicle.status === 'delayed' ? 'delayed' : ''} ${
                    vehicle.status === 'arrived' ? 'arrived' : ''
                  }`}
                  style={{
                    // Styles dynamiques nécessaires pour le positionnement en temps réel
                    '--marker-left': `${left}%`,
                    '--marker-top': `${top}%`,
                    '--marker-zindex': isSelected ? '20' : '10',
                    '--vehicle-color': getStatusColor(vehicle.status).replace('bg-', '')
                  } as React.CSSProperties}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  {vehicle.vehicle_number.split('-')[1]}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.vehicle_id}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition ${
              selectedVehicle?.vehicle_id === vehicle.vehicle_id
                ? 'border-emerald-600'
                : 'border-slate-200 hover:border-emerald-300'
            }`}
            onClick={() => setSelectedVehicle(vehicle)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{vehicle.vehicle_number}</h3>
                  <p className="text-xs text-slate-600">
                    {vehicle.trip.departure_city} → {vehicle.trip.arrival_city}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                {getStatusLabel(vehicle.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Vitesse</span>
                <span className="font-semibold text-slate-900">{vehicle.speed} km/h</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Direction</span>
                <span className="font-semibold text-slate-900">{vehicle.heading}°</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>ETA</span>
                </span>
                <span className="font-semibold text-emerald-600">
                  {formatTime(vehicle.estimated_arrival)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Dernière mise à jour: {formatTime(vehicle.last_update)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Détails: {selectedVehicle.vehicle_number}
              </h3>
              <p className="text-sm text-slate-600">
                {selectedVehicle.trip.departure_city} → {selectedVehicle.trip.arrival_city}
              </p>
            </div>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Latitude</p>
              <p className="font-semibold text-slate-900">{selectedVehicle.latitude.toFixed(4)}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Longitude</p>
              <p className="font-semibold text-slate-900">{selectedVehicle.longitude.toFixed(4)}</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Vitesse</p>
              <p className="font-semibold text-emerald-600">{selectedVehicle.speed} km/h</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-slate-600 mb-1">Direction</p>
              <p className="font-semibold text-slate-900">{selectedVehicle.heading}°</p>
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2 text-sm text-emerald-800">
            <AlertCircle className="w-4 h-4" />
            <span>Position mise à jour en temps réel via WebSocket</span>
          </div>
        </div>
      )}
    </div>
  );
}
