import { useEffect, useRef, useState } from 'react';
import App from './App';
import LoginPage2FA from './pages/LoginPage2FA';
import Signup from './pages/Signup.tsx';
import AdminDashboard from './pages/AdminDashboard';
import { AdminHQ } from './pages/AdminHQ';
import { PassengerApp } from './pages/PassengerApp';
import { OperatorDashboard } from './pages/OperatorDashboard';
import { useAuth } from './lib/authContext';

export default function Root() {
  const { session, loading } = useAuth();
  const [hash, setHash] = useState<string>(window.location.hash || '');
  const hasJwt = typeof window !== 'undefined' && !!localStorage.getItem('app_jwt');
  const rawRole = typeof window !== 'undefined' ? (localStorage.getItem('app_role') || 'USER') : 'USER';
  const role = rawRole.toUpperCase();
  const [idleWarnVisible, setIdleWarnVisible] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(15);
  const timerRef = useRef<number | null>(null);
  const warnTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success'|'error'|'info'; title: string; desc?: string }>>([]);

  // Fonction utilitaire pour normaliser les rôles
  const normalizeRole = (r: string | undefined): string => {
    if (!r) return '';
    return r.toLowerCase().trim();
  };

  // Vérifier si un rôle est admin
  const isAdminRole = (r: string | undefined): boolean => {
    const role = normalizeRole(r);
    return ['congomuv_hq', 'onatra', 'transco', 'private', 'admin', 'superadmin', 'super_admin'].includes(role);
  };

  // Vérifier si un rôle est superadmin
  const isSuperAdmin = (r: string | undefined): boolean => {
    const role = normalizeRole(r);
    return role === 'superadmin' || role === 'super_admin';
  };

  // Déterminer la cible de redirection en fonction du rôle
  const getTargetForRole = (r: string | undefined): string => {
    const role = normalizeRole(r);
    
    if (isSuperAdmin(role)) {
      console.log('Détection du rôle: superadmin - redirection vers /admin/dashboard');
      return '#/admin/dashboard';
    }
    
    if (isAdminRole(role)) {
      console.log('Détection du rôle: admin - redirection vers /admin');
      return '#/admin';
    }
    
    console.log('Aucun rôle admin détecté - redirection vers /');
    return '#';
  };

  const targetForRole = getTargetForRole(role);

  // Effet pour gérer la redirection des superadmins
  useEffect(() => {
    if (session || hasJwt) {
      const currentRole = normalizeRole(session?.user?.role || role);
      const currentPath = window.location.hash.toLowerCase();
      
      // Si l'utilisateur est un superadmin et qu'il est sur une page admin sans /dashboard
      if (isSuperAdmin(currentRole) && currentPath.startsWith('#/admin') && !currentPath.includes('/dashboard')) {
        console.log('Redirection du superadmin vers le tableau de bord');
        window.location.hash = '#/admin/dashboard';
      }
    }
  }, [session, hasJwt, role]);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Idle timeout: 2 minutes of inactivity -> logout and redirect to login (with 15s warning)
  useEffect(() => {
    const IDLE_MS = 2 * 60 * 1000; // 2 minutes
    const WARN_MS = 15 * 1000; // 15 seconds warning

    const clearAuth = () => {
      try {
        localStorage.removeItem('app_jwt');
        localStorage.removeItem('app_role');
      } catch {}
    };

    const triggerLogout = () => {
      clearAuth();
      window.location.hash = '#/login';
      window.location.reload();
    };

    const schedule = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (warnTimerRef.current) window.clearTimeout(warnTimerRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      setIdleWarnVisible(false);
      setIdleSecondsLeft(15);
      // Warning before expiration
      warnTimerRef.current = window.setTimeout(() => {
        const hasToken = !!localStorage.getItem('app_jwt');
        if (!hasToken) return;
        setIdleWarnVisible(true);
        setIdleSecondsLeft(15);
        countdownRef.current = window.setInterval(() => {
          setIdleSecondsLeft(prev => {
            const next = prev - 1;
            if (next <= 0) {
              if (countdownRef.current) window.clearInterval(countdownRef.current);
              triggerLogout();
              return 0;
            }
            return next;
          });
        }, 1000);
      }, IDLE_MS - WARN_MS);

      // Fail-safe auto logout
      timerRef.current = window.setTimeout(() => {
        const hasToken = !!localStorage.getItem('app_jwt');
        if (hasToken) triggerLogout();
      }, IDLE_MS + 1000);
    };

    const resetIdle = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (warnTimerRef.current) window.clearTimeout(warnTimerRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      setIdleWarnVisible(false);
      setIdleSecondsLeft(15);
      schedule();
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll', 'visibilitychange'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetIdle, { passive: true } as any));
    schedule();

    // Expose reset to window for modal button scope
    (window as any).__resetIdle = resetIdle;

    // Global notification/toast system
    (window as any).addNotification = (type: 'success'|'error'|'info', title: string, desc?: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [...prev, { id, type, title, desc }]);
      window.setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (warnTimerRef.current) window.clearTimeout(warnTimerRef.current);
      if (countdownRef.current) window.clearInterval(countdownRef.current);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetIdle as any));
      delete (window as any).__resetIdle;
      delete (window as any).addNotification;
    };
  }, []);

  // Afficher le loader uniquement pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // 1. Si l'URL est vide ou contient juste #, gérer la redirection appropriée
  if (hash === '#' || hash === '') {
    if (session || hasJwt) {
      // Si l'utilisateur est connecté, rediriger vers la page appropriée selon le rôle
      console.log('Redirection depuis la racine vers:', targetForRole);
      // Vérifier qu'on ne redirige pas vers la même page pour éviter les boucles
      if (hash !== targetForRole) {
        window.location.hash = targetForRole;
      }
    } else {
      // Si l'utilisateur n'est pas connecté, afficher la page d'accueil (App)
      // Ne pas rediriger vers login, laisser l'utilisateur voir la page d'accueil
      console.log('Utilisateur non connecté - Affichage de la page d\'accueil');
    }
    // Si l'utilisateur est connecté, retourner le loader pendant la redirection
    if (session || hasJwt) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      );
    }
    // Si l'utilisateur n'est pas connecté, continuer vers le rendu de la page d'accueil
  }
  
  // 2. Gestion des redirections après connexion
  if (session || hasJwt) {
    // Si l'utilisateur est sur la page d'accueil, le laisser y rester s'il le souhaite
    // La redirection automatique n'est plus forcée
    if (hash === '#/') {
      console.log('Utilisateur connecté sur la page d\'accueil - Affichage autorisé');
    }
    
    // Empêcher l'accès aux pages d'authentification si déjà connecté
    const authPages = ['#/login', '#/register', '#/forgot-password'];
    if (authPages.some(page => hash.startsWith(page))) {
      if (hash !== targetForRole) {
        window.location.hash = targetForRole;
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        );
      }
    }
  } else {
    // Si l'utilisateur n'est pas connecté mais essaie d'accéder à une page protégée
    const protectedPaths = ['#/admin', '#/dashboard', '#/profile', '#/operator'];
    if (protectedPaths.some(path => hash.startsWith(path))) {
      window.location.hash = '/';
      return null;
    }
  }

  // Prevent access to login when already authenticated -> send to role target
  if (hash.startsWith('#/login') && (session || hasJwt)) {
    console.log('Utilisateur déjà connecté, redirection vers:', targetForRole);
    window.location.hash = targetForRole;
    return null;
  }
  
  // Forcer la redirection vers le tableau de bord admin pour les superadmins
  if ((session?.user?.role === 'superadmin' || role === 'SUPERADMIN' || role === 'SUPER_ADMIN') && 
      hash.startsWith('#/admin') && !hash.includes('/dashboard')) {
    console.log('Redirection du superadmin vers le tableau de bord');
    window.location.hash = '#/admin/dashboard';
    return null;
  }

  // Routing
  if (hash.startsWith('#/login')) {
    return <LoginPage2FA />;
  }

  if (hash.startsWith('#/signup')) {
    return <Signup />;
  }

  if (hash.startsWith('#/admin')) {
    if (!session && !hasJwt) {
      location.hash = '#/login';
      return null;
    }
    return <AdminDashboard />;
  }

  if (hash.startsWith('#/passenger')) {
    return <PassengerApp />;
  }

  if (hash.startsWith('#/operator')) {
    if (!session && !hasJwt) {
      location.hash = '#/login';
      return null;
    }
    return <OperatorDashboard />;
  }

  if (hash.startsWith('#/admin-hq')) {
    if (!session && !hasJwt) {
      location.hash = '#/login';
      return null;
    }
    return <AdminHQ />;
  }

  // Default route: allow anonymous users to view landing (#/)

  // Warning modal rendered outside? We return above. Keep modal portal at root level using a fragment.
  return (
    <>
      {/* Global Toaster */}
      <div className="fixed top-4 right-4 z-[10000] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-xl shadow-lg px-4 py-3 border text-sm ${t.type==='success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : t.type==='error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
            <div className="font-semibold">{t.title}</div>
            {t.desc && <div className="text-xs mt-0.5">{t.desc}</div>}
          </div>
        ))}
      </div>
      {idleWarnVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md shadow-md">
            <h2 className="text-lg font-bold mb-2">Inactivité détectée</h2>
            <p className="text-gray-600 mb-4">Vous serez déconnecté dans {idleSecondsLeft} secondes pour cause d'inactivité.</p>
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                if ((window as any).__resetIdle) (window as any).__resetIdle();
              }}
            >
              Rester connecté
            </button>
          </div>
        </div>
      )}
      <App />
    </>
  );
}
