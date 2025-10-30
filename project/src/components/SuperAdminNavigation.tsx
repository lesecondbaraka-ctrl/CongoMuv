import { useState } from 'react';
import { 
  FaHome as Home,
  FaUsers as Users,
  FaBuilding as Building,
  FaTruck as Truck,
  FaChartBar as BarChart,
  FaCog as Settings
} from 'react-icons/fa';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  path: string;
}

interface SuperAdminNavigationProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

const DASHBOARD_ITEMS: NavigationItem[] = [
  {
    id: 'admin',
    label: 'Administration',
    icon: Settings,
    description: 'Gestion complète du système',
    path: '/admin/dashboard'
  },
  {
    id: 'operator',
    label: 'Opérateurs',
    icon: Building,
    description: 'Interface opérateur de transport',
    path: '/operator/dashboard'
  },
  {
    id: 'driver',
    label: 'Chauffeurs',
    icon: Truck,
    description: 'Interface chauffeur',
    path: '/driver/dashboard'
  },
  {
    id: 'passenger',
    label: 'Passagers',
    icon: Users,
    description: 'Interface passager',
    path: '/dashboard'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart,
    description: 'Analyses et rapports',
    path: '/analytics/dashboard'
  }
];

export function SuperAdminNavigation({ onNavigate, currentPath }: SuperAdminNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        title="Navigation SUPER_ADMIN"
      >
        <Home className="w-6 h-6" />
      </button>

      {/* Navigation Panel */}
      {isExpanded && (
        <div className="absolute top-16 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 mb-1">🛡️ SUPER ADMIN</h3>
            <p className="text-sm text-slate-600">Accès à tous les dashboards</p>
          </div>

          <div className="space-y-2">
            {DASHBOARD_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.path);
                    setIsExpanded(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-left ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300' 
                      : 'hover:bg-slate-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isActive ? 'text-purple-900' : 'text-slate-900'}`}>
                      {item.label}
                    </h4>
                    <p className={`text-sm ${isActive ? 'text-purple-700' : 'text-slate-600'}`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Navigation réservée aux SUPER_ADMIN
            </p>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}
