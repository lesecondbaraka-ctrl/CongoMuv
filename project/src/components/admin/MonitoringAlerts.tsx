import { useState } from 'react';
import { incidentReports, IncidentReport } from '../../data/adminData';

export function MonitoringAlerts() {
  // Use local demo data (no hooks, no network)
  const [incidents, setIncidents] = useState<IncidentReport[]>(() => [...incidentReports]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [newType, setNewType] = useState<'mechanical' | 'delay' | 'security' | 'other'>('mechanical');
  const [newSeverity, setNewSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [newDescription, setNewDescription] = useState('');

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    if (filter === 'open') return incident.status !== 'resolved';
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

      {/* Create Incident */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Signaler un incident</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as 'mechanical' | 'delay' | 'security' | 'other')}
            className="px-3 py-2 border border-slate-300 rounded-lg"
            aria-label="Type"
          >
            <option value="mechanical">Mécanique</option>
            <option value="delay">Retard</option>
            <option value="security">Sécurité</option>
            <option value="other">Autre</option>
          </select>
          <select
            value={newSeverity}
            onChange={(e) => setNewSeverity(e.target.value as 'low' | 'medium' | 'high')}
            className="px-3 py-2 border border-slate-300 rounded-lg"
            aria-label="Priorité"
          >
            <option value="low">Faible</option>
            <option value="medium">Moyen</option>
            <option value="high">Élevé</option>
          </select>
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description"
            className="px-3 py-2 border border-slate-300 rounded-lg md:col-span-2"
          />
        </div>
        <div className="text-right mt-3">
          <button
            disabled={!newDescription}
            onClick={() => {
              // Local demo create
              const newIncident: IncidentReport = {
                id: `i-${Date.now()}`,
                date: new Date().toISOString(),
                type: newType,
                description: newDescription,
                status: 'open',
                severity: newSeverity,
                operator: 'DEMO',
                location: 'DEMO'
              };
              setIncidents(prev => [newIncident, ...prev]);
              setNewDescription('');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            Signaler
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {['all', 'open', 'resolved'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as 'all' | 'open' | 'resolved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'open' ? 'En cours' : 'Résolus'}
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
                    <h3 className="font-bold text-slate-900">{incident.type}</h3>
                    <p className="text-sm text-slate-600">
                      {new Date(incident.date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      incident.severity === 'low' ? 'bg-blue-100 text-blue-800' :
                      incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {incident.severity === 'low' ? 'Faible' : incident.severity === 'medium' ? 'Moyen' : 'Élevé'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {incident.status === 'resolved' ? 'Résolu' : 'En cours'}
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 mb-3">{incident.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
