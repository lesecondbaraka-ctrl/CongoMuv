import { useState } from 'react';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RouteData {
  id: number;
  operator_id: number;
  transport_type_id: number;
  departure_city: string;
  arrival_city: string;
  distance_km: number;
  estimated_duration_minutes: number;
  base_price: number;
  is_active: boolean;
  operator?: {
    id: number;
    name: string;
  };
  transport_type?: {
    id: number;
    name: string;
  };
}

interface TripData {
  id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  vehicle_number: string;
  total_seats: number;
  available_seats: number;
  status: 'scheduled' | 'in_transit' | 'completed' | 'cancelled';
  driver_name?: string;
  route?: RouteData;
}

export function RoutesManagement() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [routesRes, tripsRes] = await Promise.all([
          supabase
            .from('routes')
            .select(`
              id, operator_id, transport_type_id, departure_city, arrival_city, distance_km, estimated_duration_minutes, base_price, is_active,
              operator:operator_id ( id, name ),
              transport_type:transport_type_id ( id, name )
            `),
          supabase
            .from('trips')
            .select(`
              id, route_id, departure_time, arrival_time, vehicle_number, total_seats, available_seats, status, driver_name,
              route:route_id ( id, departure_city, arrival_city )
            `)
            .order('departure_time', { ascending: true })
        ]);

        if (routesRes.error) throw routesRes.error;
        if (tripsRes.error) throw tripsRes.error;

        const routesData = ((routesRes.data || []) as any[]).map((r) => ({
          id: Number(r.id),
          operator_id: Number(r.operator_id),
          transport_type_id: Number(r.transport_type_id),
          departure_city: r.departure_city,
          arrival_city: r.arrival_city,
          distance_km: Number(r.distance_km ?? 0),
          estimated_duration_minutes: Number(r.estimated_duration_minutes ?? 0),
          base_price: Number(r.base_price ?? 0),
          is_active: Boolean(r.is_active ?? true),
          operator: r.operator ? { id: Number(r.operator.id), name: r.operator.name } : undefined,
          transport_type: r.transport_type ? { id: Number(r.transport_type.id), name: r.transport_type.name } : undefined,
        })) as RouteData[];

        const tripsData = ((tripsRes.data || []) as any[]).map((t) => ({
          id: Number(t.id),
          route_id: Number(t.route_id),
          departure_time: t.departure_time,
          arrival_time: t.arrival_time,
          vehicle_number: t.vehicle_number,
          total_seats: Number(t.total_seats ?? 0),
          available_seats: Number(t.available_seats ?? 0),
          status: t.status,
          driver_name: t.driver_name ?? undefined,
          route: t.route ? { id: Number(t.route.id), operator_id: 0, transport_type_id: 0, departure_city: t.route.departure_city, arrival_city: t.route.arrival_city, distance_km: 0, estimated_duration_minutes: 0, base_price: 0, is_active: true } as any : undefined,
        })) as TripData[];

        setRoutes(routesData);
        setTrips(tripsData);
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const [activeTab, setActiveTab] = useState<'routes' | 'trips'>('routes');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion Routes & Trajets</h2>
          <p className="text-slate-600">Administration des routes et supervision des trajets</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      )}
      {loading && (
        <div className="p-3 rounded bg-slate-100 text-slate-600 text-sm">Chargement...</div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-md font-medium transition ${
            activeTab === 'routes'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Routes
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-2 rounded-md font-medium transition ${
            activeTab === 'trips'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Trajets Actifs
        </button>
      </div>

      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div key={route.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600" aria-hidden>🛣</div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {route.departure_city} → {route.arrival_city}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {route.operator?.name} • {route.transport_type?.name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    route.is_active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {route.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Distance:</span>
                    <span className="font-medium">{route.distance_km} km</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Durée:</span>
                    <span className="font-medium">{route.estimated_duration_minutes} min</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Prix de base:</span>
                    <span className="font-medium">{route.base_price.toLocaleString('fr-FR')} FC</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-slate-100 text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-200 transition flex items-center justify-center space-x-1">
                    <span aria-hidden>✎</span>
                    <span className="text-sm">Modifier</span>
                  </button>
                  <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition" aria-label="Supprimer la route" title="Supprimer la route">
                    <span aria-hidden>🗑</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600" aria-hidden>⏰</div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {trip.route?.departure_city} → {trip.route?.arrival_city}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(trip.departure_time).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trip.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    trip.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                    trip.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trip.status === 'scheduled' ? 'Programmé' :
                     trip.status === 'in_transit' ? 'En cours' :
                     trip.status === 'completed' ? 'Terminé' : 'Annulé'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Véhicule:</span>
                    <span className="font-medium">{trip.vehicle_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Places disponibles:</span>
                    <span className="font-medium">{trip.available_seats}/{trip.total_seats}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Conducteur:</span>
                    <span className="font-medium">{trip.driver_name || 'Non assigné'}</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-slate-100 text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-200 transition">
                    <span className="text-sm">Détails</span>
                  </button>
                  <button className="flex-1 bg-emerald-100 text-emerald-700 py-2 px-3 rounded-lg hover:bg-emerald-200 transition">
                    <span className="text-sm">Suivre</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
