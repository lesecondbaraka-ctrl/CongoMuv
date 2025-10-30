import { useState, useEffect } from 'react';
import { Plus, Trash2, User, Phone, Calendar } from 'lucide-react';

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  status: string;
  total_trips: number;
  rating: number;
  created_at: string;
}

interface Incident {
  id: string;
  driver_id: string;
  driver_name: string;
  type: string;
  severity: string;
  description: string;
  occurred_at: string;
}

export function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'drivers' | 'incidents'>('drivers');

  useEffect(() => {
    loadDrivers();
    loadIncidents();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      // TODO: Appel API
      setDrivers([
        {
          id: '1',
          full_name: 'Jean Mukendi',
          phone: '+243 812 345 678',
          license_number: 'DRV-2024-001',
          license_expiry: '2026-12-31',
          status: 'active',
          total_trips: 145,
          rating: 4.8,
          created_at: '2024-01-15'
        },
        {
          id: '2',
          full_name: 'Marie Kabila',
          phone: '+243 823 456 789',
          license_number: 'DRV-2024-002',
          license_expiry: '2025-06-30',
          status: 'active',
          total_trips: 89,
          rating: 4.6,
          created_at: '2024-03-20'
        },
        {
          id: '3',
          full_name: 'Pierre Tshisekedi',
          phone: '+243 834 567 890',
          license_number: 'DRV-2023-045',
          license_expiry: '2025-03-15',
          status: 'unavailable',
          total_trips: 234,
          rating: 4.9,
          created_at: '2023-05-10'
        }
      ]);
    } catch (error) {
      console.error('Erreur chargement conducteurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIncidents = async () => {
    try {
      // TODO: Appel API
      setIncidents([
        {
          id: '1',
          driver_id: '1',
          driver_name: 'Jean Mukendi',
          type: 'mechanical',
          severity: 'medium',
          description: 'Panne moteur sur autoroute, réparé en 2 heures',
          occurred_at: '2025-01-20T14:30:00'
        },
        {
          id: '2',
          driver_id: '3',
          driver_name: 'Pierre Tshisekedi',
          type: 'delay',
          severity: 'low',
          description: 'Retard de 30 minutes dû à embouteillages',
          occurred_at: '2025-01-18T09:15:00'
        }
      ]);
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
    }
  };

  const handleDelete = async (driverId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce conducteur ?')) return;
    setDrivers(drivers.filter(d => d.id !== driverId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unavailable': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'unavailable': return 'Indisponible';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 90 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Conducteurs / Trains</h2>
          <p className="text-sm text-slate-600">Enregistrement, planification et disponibilité</p>
        </div>
        <button
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Conducteur</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'drivers'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Conducteurs
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'incidents'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Incidents
        </button>
      </div>

      {/* Drivers List */}
      {activeTab === 'drivers' && (
        <div className="grid gap-4">
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-600">Chargement...</div>
          )}

          {!loading && drivers.map((driver) => (
            <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <User className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{driver.full_name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="flex items-center space-x-1 text-sm text-slate-600">
                          <Phone className="w-3 h-3" />
                          <span>{driver.phone}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                          {getStatusLabel(driver.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-600">Permis</p>
                      <p className="font-semibold text-slate-900">{driver.license_number}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Expiration</span>
                      </p>
                      <p className={`font-semibold ${
                        isLicenseExpiringSoon(driver.license_expiry) 
                          ? 'text-yellow-600' 
                          : 'text-slate-900'
                      }`}>
                        {new Date(driver.license_expiry).toLocaleDateString('fr-FR')}
                      </p>
                      {isLicenseExpiringSoon(driver.license_expiry) && (
                        <p className="text-xs text-yellow-600">Expire bientôt!</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-slate-600">Trajets effectués</p>
                      <p className="font-semibold text-slate-900">{driver.total_trips}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600">Évaluation</p>
                      <p className="font-semibold text-emerald-600">⭐ {driver.rating}/5</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Modifier"
                  >
                    <span>✏️</span>
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

      {/* Incidents List */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  incident.severity === 'high' ? 'bg-red-100' : 
                  incident.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <span className="text-2xl">
                    {incident.severity === 'high' ? '⚠️' : 
                     incident.severity === 'medium' ? '⚠️' : 'ℹ️'}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{incident.driver_name}</h3>
                      <p className="text-sm text-slate-600">
                        {new Date(incident.occurred_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity === 'low' ? 'Faible' : incident.severity === 'medium' ? 'Moyen' : 'Grave'}
                    </span>
                  </div>

                  <p className="text-slate-700 mb-2">{incident.description}</p>

                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-slate-600">
                      Type: <span className="font-medium text-slate-900">
                        {incident.type === 'mechanical' ? 'Mécanique' : 
                         incident.type === 'delay' ? 'Retard' : incident.type}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {incidents.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <span className="text-5xl text-slate-300">⚠️</span>
              <p className="text-slate-600">Aucun incident enregistré</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
