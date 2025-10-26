import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react';
import { decryptString } from './crypto';
import { supabase } from './supabase';

export type AppProfile = {
  id: string;
  role: string;
  name: string | null;
  phone: string | null;
  organizationId: string | null;
  organizationName: string | null;
};

type AuthContextType = {
  session: import('@supabase/supabase-js').Session | null;
  profile: AppProfile | null;
  loading: boolean;
  currentOrganization: { id: string; name: string } | null;
  selectOrganization: (id: string | null, name?: string | null) => Promise<void>;
  canAccessOrganization: (id: string | null) => boolean;
  hasRole: (requiredRole: string) => boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  currentOrganization: null,
  // default no-op implementations
  selectOrganization: async () => {},
  canAccessOrganization: () => false,
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<import('@supabase/supabase-js').Session | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
    return data.session ?? null;
  };

  // Correction des types explicites pour éviter les `any`
  const loadProfile = async (userId: string): Promise<AppProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, name, phone, organization_id')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.error('Failed to load profile:', error);
        setProfile(null);
        return null;
      }
      if (!data) {
        setProfile(null);
        return null;
      }
      let phoneDecrypted: string | null = data.phone ?? null;
      if (phoneDecrypted) {
        try {
          phoneDecrypted = await decryptString(phoneDecrypted);
        } catch (error) {
          console.warn("Failed to decrypt phone number, using original value:", error);
        }
      }
      const p: AppProfile = {
        id: data.id,
        role: data.role,
        name: data.name ?? null,
        phone: phoneDecrypted,
        organizationId: data.organization_id ?? null,
        organizationName: null,
      };
      setProfile(p);
      return p;
    } catch (e) {
      console.error('Failed to load profile (unexpected):', e);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sess = await loadSession();
        if (mounted && sess?.user?.id) {
          await loadProfile(sess.user.id);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[Auth] Initial session load failed:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (
        event: import('@supabase/supabase-js').AuthChangeEvent,
        newSession: import('@supabase/supabase-js').Session | null,
      ) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        const p = await loadProfile(newSession.user.id);
        // Si le profil a une organisation affectée, récupérer son nom et sélectionner comme entité active
        if (p?.organizationId) {
          try {
            const { data: orgData, error: orgErr } = await supabase
              .from('operators')
              .select('id,name')
              .eq('id', p.organizationId)
              .maybeSingle();
            if (!orgErr && orgData) {
              setCurrentOrganization({ id: String(orgData.id), name: orgData.name });
            } else {
              // fallback: garder l'organizationId sans nom
              setCurrentOrganization({ id: String(p.organizationId), name: (p.organizationName ?? p.organizationId) || 'Organisation' });
            }
          } catch (e) {
            console.warn('Impossible de charger le nom de l\'organisation:', e);
            setCurrentOrganization({ id: String(p.organizationId), name: p.organizationId });
          }
        } else {
          // pas d'organisation liée -> clear
          setCurrentOrganization(null);
        }

        if (event === 'SIGNED_IN') {
          const target = (p?.role === 'admin' || p?.role === 'operator') ? '#/admin' : '#/';
          if (location.hash !== target) {
            location.hash = target;
          }
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Déplacement de `selectOrganization` dans un hook `useCallback`
  const selectOrganization = useCallback(async (id: string | null, name?: string | null) => {
    if (!id) {
      setCurrentOrganization(null);
      return;
    }
    const isSuper = profile?.role === 'superadmin';
    if (!isSuper && profile?.organizationId && profile.organizationId !== id) {
      console.warn('Tentative de sélection d\'organisation non autorisée', id);
      return;
    }
    if (name) {
      setCurrentOrganization({ id, name });
      return;
    }
    try {
      const { data: orgData, error: orgErr } = await supabase
        .from('operators')
        .select('id,name')
        .eq('id', id)
        .maybeSingle();
      if (!orgErr && orgData) {
        setCurrentOrganization({ id: String(orgData.id), name: orgData.name });
      } else {
        setCurrentOrganization({ id, name: id });
      }
    } catch (e) {
      console.warn('Erreur lors de la sélection de l\'organisation:', e);
      setCurrentOrganization({ id, name: id });
    }
  }, [profile]);

  // Déplacement de `canAccessOrganization` dans un hook `useCallback`
  const canAccessOrganization = useCallback((id: string | null) => {
    if (!id) return true;
    if (!profile) return false;
    if (profile.role === 'superadmin') return true;
    if (!profile.organizationId) return false;
    return profile.organizationId === id;
  }, [profile]);

  // Vérifie si l'utilisateur a un rôle spécifique en tenant compte de la hiérarchie
  const hasRole = useCallback((requiredRole: string) => {
    if (!profile?.role) return false;
    
    const roleHierarchy = {
      'super_admin': 1000,
      'admin': 100,
      'operator': 50,
      'user': 10
    };
    
    const userRole = profile.role.toLowerCase();
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    return userLevel >= requiredLevel;
  }, [profile]);

  // Mise à jour de `useMemo` pour inclure les hooks
  const value = useMemo(() => ({
    session,
    profile,
    loading,
    currentOrganization,
    selectOrganization,
    canAccessOrganization,
    hasRole
  }), [session, profile, loading, currentOrganization, selectOrganization, canAccessOrganization, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
