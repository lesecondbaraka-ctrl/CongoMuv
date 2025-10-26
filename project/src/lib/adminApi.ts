import { supabase } from './supabase';

export type AdminRole = 'CONGOMUV_HQ' | 'OPERATOR' | string;

export type Operator = {
  id: string;
  name: string;
  type?: string;
  logo?: string;
  is_active?: boolean;
};

export type Route = {
  id: string;
  departure_city: string;
  arrival_city: string;
  base_price: number;
  operator?: Operator | null;
};

export type TripWithRelations = {
  id: string;
  departure_time: string;
  arrival_time: string | null;
  vehicle_number: string | null;
  total_seats: number;
  available_seats: number;
  status: string;
  route: Route | null;
};

export type IncidentItem = {
  id: string;
  type: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | string;
  status: string;
  date: string;
  operator: string;
};

export async function fetchActiveTrips(role: AdminRole, organizationName?: string, operatorId?: string): Promise<TripWithRelations[]> {
  const DEV_NO_AUTH = (import.meta as any).env?.VITE_DEV_NO_AUTH === 'true';
  if (DEV_NO_AUTH) {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString();
    return [
      {
        id: 't1',
        departure_time: fmt(new Date(now.getTime() + 30 * 60000)),
        arrival_time: null,
        vehicle_number: 'BUS-001',
        total_seats: 50,
        available_seats: 12,
        status: 'scheduled',
        route: {
          id: 'r1',
          departure_city: 'Kinshasa',
          arrival_city: 'Matadi',
          base_price: 15000,
          operator: { id: 'op1', name: organizationName || 'CongoMuv', is_active: true },
        },
      },
      {
        id: 't2',
        departure_time: fmt(new Date(now.getTime() + 120 * 60000)),
        arrival_time: null,
        vehicle_number: 'BUS-014',
        total_seats: 30,
        available_seats: 5,
        status: 'scheduled',
        route: {
          id: 'r2',
          departure_city: 'Goma',
          arrival_city: 'Bukavu',
          base_price: 20000,
          operator: { id: 'op1', name: organizationName || 'CongoMuv', is_active: true },
        },
      },
    ];
  }
  let routeIds: string[] | null = null;
  if (role !== 'CONGOMUV_HQ' && operatorId) {
    const { data: routesData, error: routesErr } = await supabase
      .from('routes')
      .select('id')
      .eq('operator_id', operatorId);
    if (routesErr) throw routesErr;
    routeIds = (routesData || []).map((r: any) => r.id);
  }
  const { data, error } = await supabase
    .from('trips')
    .select(`
      id,
      departure_time,
      arrival_time,
      vehicle_number,
      total_seats,
      available_seats,
      status,
      route:route_id (
        id,
        departure_city,
        arrival_city,
        base_price,
        operator:operator_id (
          id,
          name,
          type,
          logo,
          is_active
        )
      )
    `)
    .order('departure_time', { ascending: true });
  if (error) throw error;
  let trips: TripWithRelations[] = ((data || []) as unknown) as TripWithRelations[];
  if (role === 'CONGOMUV_HQ') return trips;
  if (routeIds && routeIds.length > 0) {
    trips = trips.filter((t) => routeIds!.includes((t as any).route?.id));
  }
  return trips.filter((t) => t.route?.operator?.name === organizationName);
}

export async function fetchRecentIncidents(role: AdminRole, organizationName?: string, limit = 10, operatorId?: string): Promise<IncidentItem[]> {
  const DEV_NO_AUTH = (import.meta as any).env?.VITE_DEV_NO_AUTH === 'true';
  if (DEV_NO_AUTH) {
    const now = new Date();
    const iso = now.toISOString();
    const org = organizationName || 'CongoMuv';
    return [
      { id: 'i1', type: 'Delay', description: 'Retard dû à la circulation', severity: 'low', status: 'investigating', date: iso, operator: org },
      { id: 'i2', type: 'Maintenance', description: 'Contrôle technique', severity: 'medium', status: 'resolved', date: iso, operator: org },
    ].slice(0, limit);
  }
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      id,
      type,
      description,
      severity,
      status,
      date,
      operator:operator_id (
        id,
        name
      )
    `)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data || []) as any[];
  const incidents: IncidentItem[] = rows.map((i: any) => ({
    id: i.id,
    type: i.type,
    description: i.description,
    severity: i.severity,
    status: i.status,
    date: i.date,
    operator: i.operator?.name ?? 'Unknown'
  }));
  if (role === 'CONGOMUV_HQ') return incidents;
  const filteredByName = incidents.filter((i) => i.operator === organizationName);
  if (operatorId) {
    // DB-side filter helper (prefer server-side when expanding):
    const byOperator = rows.filter((i: any) => i.operator?.id === operatorId).map((i: any) => i.id);
    return filteredByName.filter((i) => byOperator.includes(i.id));
  }
  return filteredByName;
}

export async function fetchAdminStats(_role: AdminRole, _organizationName?: string): Promise<{
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  totalPassengers: number;
  onTimeRate: number;
  satisfactionRate: number;
  incidentReports: number;
}> {
  // total bookings
  const { count: totalBookings, error: bookingsErr } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });
  if (bookingsErr) throw bookingsErr;

  // total revenue (successful payments)
  const { data: paymentsSumData, error: payErr } = await supabase
    .from('payments')
    .select('amount, status');
  if (payErr) throw payErr;
  const totalRevenue = (paymentsSumData || [])
    .filter((p: any) => p.status === 'success')
    .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

  // active trips (scheduled)
  const { count: activeTrips, error: tripsErr } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled');
  if (tripsErr) throw tripsErr;

  // total passengers (proxy: sum of seats in bookings)
  const { data: bookingsData, error: bookingsDataErr } = await supabase
    .from('bookings')
    .select('seats');
  if (bookingsDataErr) throw bookingsDataErr;
  const totalPassengers = (bookingsData || []).reduce((sum: number, b: any) => sum + Number(b.seats || 0), 0);

  // total incidents
  const { count: incidentReports, error: incidentsErr } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true });
  if (incidentsErr) throw incidentsErr;

  // Note: filtering by organizationName would require joins; keeping global KPIs for MVP.
  return {
    totalBookings: totalBookings || 0,
    totalRevenue,
    activeTrips: activeTrips || 0,
    totalPassengers,
    onTimeRate: 92, // placeholder KPI until real metric exists
    satisfactionRate: 88, // placeholder KPI until real metric exists
    incidentReports: incidentReports || 0,
  };
}
