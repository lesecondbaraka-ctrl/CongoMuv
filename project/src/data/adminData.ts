// Types d'administrateurs
export type AdminRole = 'ONATRA' | 'TRANSCO' | 'PRIVATE' | 'CONGOMUV_HQ';

export interface AdminStats {
  totalBookings: number;
  totalRevenue: number;
  activeTrips: number;
  totalPassengers: number;
  onTimeRate: number;
  satisfactionRate: number;
  incidentReports: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  organization: string;
  permissions: string[];
}

// Données statiques pour la démo
export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Jean Mukendi',
    email: 'admin@onatra.cd',
    role: 'ONATRA',
    organization: 'ONATRA',
    permissions: ['manage_trains', 'manage_ships', 'view_stats', 'manage_staff']
  },
  {
    id: 'admin-2',
    name: 'Marie Kabongo',
    email: 'admin@transco.cd',
    role: 'TRANSCO',
    organization: 'TRANSCO',
    permissions: ['manage_buses', 'view_stats', 'manage_staff']
  },
  {
    id: 'admin-3',
    name: 'Paul Tshibamba',
    email: 'admin@express.cd',
    role: 'PRIVATE',
    organization: 'Express Transport',
    permissions: ['manage_buses', 'view_stats', 'manage_staff']
  },
  {
    id: 'admin-4',
    name: 'Estimé SUMBA',
    email: 'sumbaestime@gmail.com',
    role: 'CONGOMUV_HQ',
    organization: 'CongoMuv',
    permissions: ['manage_all', 'audit', 'security', 'api_management']
  }
];

export const adminStats: Record<AdminRole, AdminStats> = {
  ONATRA: {
    totalBookings: 1250,
    totalRevenue: 62500000,
    activeTrips: 8,
    totalPassengers: 3750,
    onTimeRate: 85,
    satisfactionRate: 88,
    incidentReports: 3
  },
  TRANSCO: {
    totalBookings: 2800,
    totalRevenue: 7000000,
    activeTrips: 15,
    totalPassengers: 5600,
    onTimeRate: 78,
    satisfactionRate: 82,
    incidentReports: 5
  },
  PRIVATE: {
    totalBookings: 950,
    totalRevenue: 142500000,
    activeTrips: 6,
    totalPassengers: 1900,
    onTimeRate: 92,
    satisfactionRate: 90,
    incidentReports: 1
  },
  CONGOMUV_HQ: {
    totalBookings: 5000,
    totalRevenue: 212000000,
    activeTrips: 29,
    totalPassengers: 11250,
    onTimeRate: 85,
    satisfactionRate: 87,
    incidentReports: 9
  }
};

export interface IncidentReport {
  id: string;
  date: string;
  type: 'mechanical' | 'delay' | 'security' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high';
  operator: string;
  location: string;
}

export const incidentReports: IncidentReport[] = [
  {
    id: 'INC-001',
    date: '2025-10-14T08:30:00',
    type: 'mechanical',
    description: 'Panne moteur sur le train Kinshasa-Matadi',
    status: 'resolved',
    severity: 'high',
    operator: 'ONATRA',
    location: 'KM 120 ligne Kinshasa-Matadi'
  },
  {
    id: 'INC-002',
    date: '2025-10-14T10:15:00',
    type: 'delay',
    description: 'Retard dû aux conditions météorologiques',
    status: 'open',
    severity: 'medium',
    operator: 'TRANSCO',
    location: 'Kinshasa Centre'
  }
];