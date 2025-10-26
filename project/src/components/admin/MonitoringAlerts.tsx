import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Incident {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: string;
  operator_name: string;
  created_at: string;
  resolved_at: string | null;
}

export function MonitoringAlerts() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  useEffect(() => {
    loadIncidents();
  }, [filter]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      // TODO: Appel API
      setIncidents([
        {
          id: '1',
          type: 'technical',
          description: 'Panne GPS véhicule TRAIN-001 sur ligne Kinshasa-Lubumbashi',
          severity: 'high',
          status: 'investigating',
          operator_name: 'ONATRA',
          created_at: '2025-01-25T08:30:00',
          resolved_at: null
        },
        {
          id: '2',
          type: 'payment',
          description: 'Anomalie paiement: 5 transactions échouées en 10 minutes',
          severity: 'medium',
          status: 'investigating',
          operator_name: 'System',
          created_at: '2025-01-25T10:15:00',
          resolved_at: null
        },
        {
          id: '3',
          type: 'delay',
          description: 'Retard massif: 12 trajets en retard de plus de 2h',
          severity: 'high',
          status: 'acknowledged',
          operator_name: 'Multiple',
          created_at: '2025-01-25T12:00:00',
          resolved_at: null
        },
        {
          id: '4',
          type: 'technical',
          description: 'Erreur serveur API externe',
          severity: 'low',
          status: 'resolved',
          operator_name: 'System',
          created_at: '2025-01-24T14:20:00',
          resolved_at: '2025-01-24T15:45:00'
        }
      ]);
    } catch (error) {
      console.error('Erreur chargement incidents:', error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'acknowledged': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'technical': return 'Incident Technique';
      case 'payment': return 'Anomalie Paiement';
      case 'delay': return 'Retard Massif';
      default: return type;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    if (filter === 'pending') return incident.status !== 'resolved';
    if (filter === 'resolved') return incident.status === 'resolved';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Monitoring & Alertes</h2>
          <p className="text-sm text-slate-600">Suivi des incidents techniques, anomalies et retards</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-xs text-slate-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{incidents.length}</p>
          <p className="text-xs text-slate-600">Incidents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔴</span>
            <span className="text-xs text-red-600">Critique</span>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {incidents.filter(i => i.severity === 'high' && i.status !== 'resolved').length}
          </p>
          <p className="text-xs text-slate-600">Haute Priorité</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🟡</span>
            <span className="text-xs text-yellow-600">Moyen</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {incidents.filter(i => i.severity === 'medium' && i.status !== 'resolved').length}
          </p>
          <p className="text-xs text-slate-600">Priorité Moyenne</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-xs text-green-600">Résolus</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {incidents.filter(i => i.status === 'resolved').length}
          </p>
          <p className="text-xs text-slate-600">Cette semaine</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'pending', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En cours' : 'Résolus'}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.map((incident) => (
          <div key={incident.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                incident.severity === 'high' ? 'bg-red-100' :
                incident.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <span className="text-2xl">
                  {incident.severity === 'high' ? '🔴' :
                   incident.severity === 'medium' ? '🟡' : '🔵'}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{getTypeLabel(incident.type)}</h3>
                    <p className="text-sm text-slate-600">
                      {new Date(incident.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity === 'low' ? 'Faible' : incident.severity === 'medium' ? 'Moyen' : 'Élevé'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status === 'investigating' ? 'Enquête' :
                       incident.status === 'acknowledged' ? 'Reconnu' : 'Résolu'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 mb-3">{incident.description}</p>

                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-slate-600">
                    <strong>Opérateur:</strong> {incident.operator_name}
                  </span>
                  {incident.resolved_at && (
                    <span className="flex items-center space-x-1 text-green-600">
                      <Clock className="w-4 h-4" />
                      <span>Résolu: {new Date(incident.resolved_at).toLocaleString('fr-FR')}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
