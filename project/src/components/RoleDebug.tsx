import { useState, useEffect } from 'react';

/**
 * Composant de débogage pour afficher le rôle actuel
 * À utiliser uniquement en développement
 * Supprimer ou désactiver en production
 */
export function RoleDebug() {
  const [role, setRole] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateRole = () => {
      const storedRole = localStorage.getItem('app_role') || 'NON CONNECTÉ';
      const storedEmail = localStorage.getItem('app_email') || '';
      setRole(storedRole);
      setEmail(storedEmail);
    };

    updateRole();
    
    // Écouter les changements du localStorage
    window.addEventListener('storage', updateRole);
    
    // Raccourci clavier : Ctrl+Shift+D pour afficher/masquer
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('storage', updateRole);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const setSuperAdmin = () => {
    localStorage.setItem('app_role', 'SUPER_ADMIN');
    localStorage.setItem('app_email', 'superadmin@congomuv.cd');
    localStorage.setItem('app_jwt', 'test-super-admin-token');
    window.location.reload();
  };

  const setAdmin = () => {
    localStorage.setItem('app_role', 'ADMIN');
    localStorage.setItem('app_email', 'admin@congomuv.cd');
    localStorage.setItem('app_jwt', 'test-admin-token');
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('app_role');
    localStorage.removeItem('app_email');
    localStorage.removeItem('app_jwt');
    window.location.reload();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs hover:bg-slate-700 z-50"
        title="Afficher le débogueur de rôle (ou Ctrl+Shift+D)"
      >
        🔧 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-slate-300 rounded-xl shadow-2xl p-4 z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900">🔧 Debug - Rôle actuel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Rôle:</span>
          <span className={`font-bold ${role === 'SUPER_ADMIN' ? 'text-purple-600' : 'text-slate-900'}`}>
            {role}
          </span>
        </div>
        {email && (
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Email:</span>
            <span className="text-xs text-slate-700">{email}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={setSuperAdmin}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-pink-700"
        >
          🛡️ Devenir SUPER_ADMIN
        </button>
        <button
          onClick={setAdmin}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          👤 Devenir ADMIN
        </button>
        <button
          onClick={logout}
          className="w-full bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300"
        >
          🚪 Déconnexion
        </button>
      </div>

      <p className="text-xs text-slate-500 mt-3 text-center">
        Raccourci: Ctrl+Shift+D
      </p>
    </div>
  );
}
