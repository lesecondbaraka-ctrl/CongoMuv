import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';
// Local emoji-based icons to avoid external deps
const Icon = ({ children, className }: { children: string; className?: string }) => (
  <span className={className} aria-hidden>{children}</span>
);
const X = ({ className }: { className?: string }) => <Icon className={className}>✖</Icon>;
const CheckCircle = ({ className }: { className?: string }) => <Icon className={className}>✓</Icon>;
const Info = ({ className }: { className?: string }) => <Icon className={className}>ℹ️</Icon>;

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationSystemProps {
  className?: string;
}

export function NotificationSystem({ className = '' }: NotificationSystemProps) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filters, setFilters] = useState<{ type: 'all' | 'success' | 'error' | 'info' }>({ type: 'all' });
  const [prefs, setPrefs] = useState({
    email: { booking: true, delay: true, promo: false },
    sms: { booking: true, delay: true, promo: false },
    push: { booking: true, delay: true, promo: true }
  });

  // Fonction pour ajouter une notification (insère aussi en base)
  const persist = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      const items: Notification[] = (data || []).map((n: any) => ({
        id: String(n.id),
        type: (n.type === 'error' || n.type === 'success' || n.type === 'info') ? n.type : 'info',
        title: n.title || 'Notification',
        message: n.message || '',
        timestamp: new Date(n.created_at),
        read: n.read === true,
      }));
      setNotifications(items);
    } catch {
      setNotifications([]);
    }
  };

  const addNotification = async (type: 'success' | 'error' | 'info', title: string, message: string) => {
    try {
      await supabase.from('notifications').insert({
        user_id: session?.user?.id || null,
        type,
        title,
        message,
        status: 'pending',
        channel: 'app',
      });
      await persist();
    } catch {
      // fallback UI only
      const newNotification: Notification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  // Fonction pour supprimer une notification
  const removeNotification = async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);
      await persist();
    } catch {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Fonction pour marquer comme lue
  const markAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      await persist();
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  // Fonction pour marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      await supabase.from('notifications').update({ read: true }).neq('id', 0);
      await persist();
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // Charger les notifications depuis Supabase
  useEffect(() => {
    persist();
  }, []);

  // Exposer fonctions globalement (dépend de addNotification)
  useEffect(() => {
    (window as any).addNotification = addNotification;
  }, [addNotification]);

  // Exposer getUnreadNotificationsCount (recalcule quand notifications change)
  useEffect(() => {
    (window as any).getUnreadNotificationsCount = () => notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'error': return <X className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = notifications.filter(n => (filters.type === 'all' ? true : n.type === filters.type));

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
      >
        <Info className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notifications */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <div className="flex items-center gap-2">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ type: e.target.value as any })}
                  className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-700"
                  aria-label="Filtrer par type de notification"
                >
                  <option value="all">Tous</option>
                  <option value="success">Succès</option>
                  <option value="info">Info</option>
                  <option value="error">Erreur</option>
                </select>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="text-xs text-slate-600 hover:text-slate-900"
                >Préférences</button>
                <button
                  onClick={() => (window as any).openNotificationsCenter?.()}
                  className="text-xs text-emerald-600 hover:text-emerald-700"
                >Voir tout</button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    Tout lu
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                Aucune notification
              </div>
            ) : (
              filtered.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${getBgColor(notification.type)} ${!notification.read ? 'bg-opacity-75' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {notification.timestamp.toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="p-1 hover:bg-slate-200 rounded"
                      aria-label="Supprimer la notification"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Préférences de notification</h3>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Fermer les préférences de notification"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {(['email','sms','push'] as const).map((channel) => (
                <div key={channel} className="border border-slate-200 rounded-lg p-3">
                  <div className="font-semibold text-slate-900 mb-2 uppercase text-xs">{channel}</div>
                  {(['booking','delay','promo'] as const).map((cat) => (
                    <label key={cat} className="flex items-center justify-between text-sm py-1">
                      <span className="text-slate-700">{cat === 'booking' ? 'Réservations' : cat === 'delay' ? 'Retards' : 'Promotions'}</span>
                      <input
                        type="checkbox"
                        checked={(prefs as any)[channel][cat]}
                        onChange={(e) => setPrefs(prev => ({ ...prev, [channel]: { ...(prev as any)[channel], [cat]: e.target.checked } }))}
                      />
                    </label>
                  ))}
                </div>
              ))}
              <div className="text-right">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700"
                >Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
