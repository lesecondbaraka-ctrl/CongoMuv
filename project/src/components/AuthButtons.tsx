import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/authContext';

export default function AuthButtons() {
  const { profile, loading } = useAuth();
  // Removed unused local states

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <span className="text-slate-500 text-sm">Chargement...</span>;
  }

  if (profile) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-slate-700 text-sm hidden sm:inline">
          {profile.name || 'Compte'} {profile.organizationName ? `· ${profile.organizationName}` : ''}
        </span>
        <button onClick={signOut} className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600 font-medium transition">
          <span>Déconnexion</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => { window.location.hash = '#/login'; }}
        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition text-sm"
      >
        <span>Connexion</span>
      </button>
    </div>
  );
}
