import { useState, useEffect, useRef } from 'react';
import { X, Navigation, Clock, MapPin } from 'lucide-react';

interface TrackingMapModalProps {
  bookingId: string;
  onClose: () => void;
}

interface VehicleLocation {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  last_update: string;
  estimated_arrival: string;
}

export function TrackingMapModal({ bookingId, onClose }: TrackingMapModalProps) {
  const [location, setLocation] = useState<VehicleLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadInitialLocation();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [bookingId]);

  const loadInitialLocation = async () => {
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';
      const token = localStorage.getItem('app_jwt');

      const response = await fetch(`${API_BASE}/api/tracking/${bookingId}/location`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Impossible de charger la position');

      const data = await response.json();
      setLocation(data.location);
      
      // Initialize map (in production, use Google Maps API)
      if (mapRef.current) {
        initializeMap(data.location);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:3002';
    const ws = new WebSocket(`${WS_URL}/tracking/${bookingId}`);

    ws.onopen = () => {
      console.log('WebSocket connecté pour le tracking GPS');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLocation(data.location);
      updateMapMarker(data.location);
    };

    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket déconnecté');
      // Reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    wsRef.current = ws;
  };

  const initializeMap = (loc: VehicleLocation) => {
    // In production, initialize Google Maps here
    // For now, we'll use a simple visual representation
    console.log('Initializing map at:', loc);
  };

  const updateMapMarker = (loc: VehicleLocation) => {
    // In production, update marker position on Google Maps
    console.log('Updating marker to:', loc);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_route': return 'bg-green-100 text-green-700 border-green-300';
      case 'delayed': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'arrived': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'idle': return 'bg-slate-100 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_route': return '🚂 En route';
      case 'delayed': return '⏰ Retardé';
      case 'arrived': return '✅ Arrivé';
      case 'idle': return '⏸️ En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement de la position GPS...</p>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md">
          <p className="text-red-600 mb-4">❌ {error || 'Position GPS indisponible'}</p>
          <button onClick={onClose} className="w-full px-4 py-2 bg-slate-200 rounded-lg">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Navigation className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Suivi GPS en Temps Réel</h2>
                <p className="text-blue-50 text-sm">Position mise à jour automatiquement</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Fermer" title="Fermer" className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Stats Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${getStatusColor(location.status)}`}>
                {getStatusLabel(location.status)}
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-slate-600">
                <span className="text-lg">💨</span>
                <span className="text-sm">Vitesse</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{location.speed} km/h</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Position</span>
              </div>
              <p className="text-xs font-mono text-slate-900">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-slate-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Arrivée estimée</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {new Date(location.estimated_arrival).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Map Container */}
          <div ref={mapRef} className="flex-1 bg-slate-100 relative overflow-hidden">
            {/* Placeholder map - In production, use Google Maps API */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <Navigation className="w-16 h-16 text-white" style={{ transform: `rotate(${location.heading}deg)` }} />
                  </div>
                  <div className="absolute inset-0 w-32 h-32 border-4 border-blue-300 rounded-full animate-ping"></div>
                </div>
                <p className="text-slate-600 font-medium">Position actuelle du véhicule</p>
                <p className="text-sm text-slate-500 mt-1">
                  Direction: {location.heading}° | Vitesse: {location.speed} km/h
                </p>
              </div>
            </div>

            {/* In production, replace with: */}
            {/* <GoogleMap
              center={{ lat: location.latitude, lng: location.longitude }}
              zoom={14}
              mapContainerStyle={{ width: '100%', height: '100%' }}
            >
              <Marker
                position={{ lat: location.latitude, lng: location.longitude }}
                icon={{
                  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  rotation: location.heading,
                  scale: 5,
                  fillColor: '#3B82F6',
                  fillOpacity: 1
                }}
              />
            </GoogleMap> */}
          </div>

          {/* Info Footer */}
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Mis à jour il y a {Math.floor((Date.now() - new Date(location.last_update).getTime()) / 1000)}s</span>
              </div>
              <div className="text-slate-500">
                🗺️ Carte interactive avec Google Maps
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
