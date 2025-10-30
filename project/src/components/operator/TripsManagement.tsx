import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Calendar, MapPin, Clock, Users } from 'lucide-react';
import TripForm from '../trips/TripForm';

interface Trip {
  id: string;
  route: {
    departure_city: string;
    arrival_city: string;
  };
  departure_time: string;
  arrival_time: string;
  vehicle_number: string;
  total_seats: number;
  available_seats: number;
  status: string;
}

export function TripsManagement() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
      const resp = await fetch('http://localhost:3002/api/operator/trips', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!resp.ok) throw new Error('failed');
      const json = await resp.json();
      const items = Array.isArray(json?.data) ? json.data : [];
      setTrips(items as any);
    } catch (error) {
      console.error('Erreur chargement trajets:', error);
      // fallback doux si API indisponible
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setShowModal(true);
  };

  const handleDelete = async (tripId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce trajet ?')) return;
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
      await fetch(`http://localhost:3002/api/operator/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setTrips(trips.filter(t => t.id !== tripId));
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programmé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Trajets</h2>
          <p className="text-sm text-slate-600">Ajout, modification et suppression des lignes</p>
        </div>
        <button
          onClick={() => {
            setEditingTrip(null);
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Trajet</span>
        </button>
      </div>

      {/* Trips List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {trip.route.departure_city} → {trip.route.arrival_city}
                      </h3>
                      <p className="text-sm text-slate-600">Véhicule: {trip.vehicle_number}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {getStatusLabel(trip.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Départ</p>
                        <p className="text-sm font-medium">{formatDateTime(trip.departure_time)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Arrivée</p>
                        <p className="text-sm font-medium">{formatDateTime(trip.arrival_time)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-600">Places</p>
                        <p className="text-sm font-medium">
                          {trip.available_seats}/{trip.total_seats} disponibles
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(trip)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    aria-label="Modifier le trajet"
                    title="Modifier"
                  >
                    <span>✏️</span>
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    aria-label="Supprimer le trajet"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {editingTrip ? 'Modifier le Trajet' : 'Nouveau Trajet'}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Fermer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TripForm
                initialData={editingTrip ? {
                  routeId: String((editingTrip as any).route_id || ''),
                  vehicleId: String((editingTrip as any).vehicle_number || ''),
                  departureDate: new Date(editingTrip.departure_time),
                  departureTime: new Date(editingTrip.departure_time).toISOString().slice(11,16),
                  arrivalDate: new Date(editingTrip.arrival_time),
                  arrivalTime: new Date(editingTrip.arrival_time).toISOString().slice(11,16),
                  price: (editingTrip as any).price || '',
                  availableSeats: editingTrip.total_seats || '',
                  status: editingTrip.status || 'scheduled',
                  notes: (editingTrip as any).notes || ''
                } : {}}
                operators={[]}
                vehicles={[]}
                onSubmit={async (data: any) => {
                  const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
                  const headers: any = {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  };
                  try {
                    if (editingTrip) {
                      const resp = await fetch(`http://localhost:3002/api/operator/trips/${editingTrip.id}`, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify({
                          departure_datetime: data.departureDateTime,
                          arrival_datetime: data.arrivalDateTime,
                          vehicle_number: String(data.vehicleId || ''),
                          total_seats: Number(data.availableSeats || 0),
                          status: data.status,
                        }),
                      });
                      if (!resp.ok) throw new Error('update_failed');
                    } else {
                      const resp = await fetch('http://localhost:3002/api/operator/trips', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                          route_id: String(data.routeId || ''),
                          departure_datetime: data.departureDateTime,
                          arrival_datetime: data.arrivalDateTime,
                          vehicle_number: String(data.vehicleId || ''),
                          total_seats: Number(data.availableSeats || 0),
                        }),
                      });
                      if (!resp.ok) throw new Error('create_failed');
                    }
                    setShowModal(false);
                    setEditingTrip(null);
                    await loadTrips();
                  } catch (e) {
                    console.error('Erreur enregistrement trajet:', e);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
