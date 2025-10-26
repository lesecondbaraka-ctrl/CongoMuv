/**
 * Système d'authentification 2FA robuste
 * CongoMuv E-Ticket
 */

const API_BASE = 'http://localhost:3002'; // Forçage de l'URL de l'API

export type AuthStep = 'email' | 'password' | 'otp' | 'success';
export type AuthError = 'invalid_email' | 'invalid_password' | 'invalid_otp' | 'network_error' | 'server_error';

export interface AuthState {
  step: AuthStep;
  email: string;
  password: string;
  otpCode: string;
  loading: boolean;
  error: AuthError | null;
  message: string | null;
}

export interface AuthResult {
  success: boolean;
  session?: Session | string; // Peut être un objet Session ou un token string
  token?: string; // Token JWT
  user?: {
    id?: string;
    email?: string;
    role?: string;
    name?: string;
    organizationId?: string;
    [key: string]: any; // Pour les propriétés supplémentaires
  };
  role?: string;
  error?: AuthError;
  message?: string;
  redirectTo?: string;
  [key: string]: any; // Pour les propriétés supplémentaires
}

export interface Session {
  token: string;
  role?: string;
}

/**
 * Étape 1: Vérifier l'email et envoyer le code OTP
 */
export async function initiate2FA(): Promise<AuthResult> {
  // Non utilisé: nous exigeons le mot de passe côté backend avant d'envoyer l'OTP
  return { success: false, error: 'server_error', message: 'Utiliser la vérification de mot de passe' };
}

/**
 * Étape 2: Vérifier le mot de passe (si configuré)
 */
export async function verifyPassword(email: string, password: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      return { success: false, error: 'invalid_password', message: 'Email ou mot de passe invalide' };
    }
    return { success: true, message: 'Code OTP envoyé à votre email' };
  } catch (error) {
    console.error('[2FA] Backend login error:', error);
    return { success: false, error: 'network_error', message: 'Erreur de connexion au serveur' };
  }
}

/**
 * Étape 3: Vérifier le code OTP
 * @param email L'email de l'utilisateur
 * @param otpCode Le code OTP à vérifier
 * @returns Un objet AuthResult avec les informations de session et de redirection
 */
export async function verifyOTP(email: string, otpCode: string): Promise<AuthResult> {
  try {
    console.log(`[2FA] Vérification de l'OTP pour l'email: ${email}`);
    
    const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        code: otpCode.trim() 
      })
    });
    
    // Gestion des erreurs de parsing JSON
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('[2FA] Erreur de parsing de la réponse JSON:', jsonError);
      return {
        success: false,
        error: 'server_error',
        message: 'Erreur de traitement de la réponse du serveur.'
      };
    }
    
    // Journalisation pour le débogage
    console.log('[2FA] Réponse du serveur:', {
      status: response.status,
      data: {
        ...data,
        // Masquer le token dans les logs
        token: data?.token ? '***' : undefined,
        session: data?.session ? '***' : undefined
      }
    });
    
    // Gestion des erreurs HTTP
    if (!response.ok) {
      return { 
        success: false, 
        error: data?.error || 'invalid_otp', 
        message: data?.message || 'Code de vérification incorrect ou expiré',
        // Inclure le code d'erreur HTTP pour un meilleur débogage
        status: response.status,
        // Inclure les données supplémentaires si disponibles
        ...(data?.details && { details: data.details })
      };
    }
    
    // Vérifier que les données nécessaires sont présentes
    if (!data.token && !data.session) {
      console.error('[2FA] Aucun token dans la réponse:', data);
      return {
        success: false,
        error: 'server_error',
        message: 'Réponse du serveur incomplète. Veuillez réessayer.'
      };
    }
    
    // Préparer et normaliser l'objet utilisateur
    const userData = data.user || {};
    
    // Normaliser le rôle
    let userRole = (data.role || userData.role || 'user').toLowerCase().trim();
    
    // Normalisation des rôles
    if (userRole === 'super_admin') userRole = 'superadmin';
    if (userRole === 'user') userRole = 'passenger';
    
    console.log(`[2FA] Rôle normalisé: ${userRole}`);
    
    // Journalisation de la connexion réussie
    console.log(`[2FA] Connexion réussie pour: ${email}, rôle: ${userRole}`);
    
    // Retourner toutes les données pertinentes
    return {
      success: true,
      message: data.message || 'Connexion réussie',
      // Token d'authentification (priorité à data.token)
      token: data.token || data.session,
      // Pour la rétrocompatibilité
      session: data.token || data.session,
      // Informations utilisateur complètes
      user: {
        ...userData,
        id: userData.id || data.userId,
        email: userData.email || email,
        role: userRole,
        name: userData.name || userData.full_name || email.split('@')[0],
        organizationId: userData.organization_id || userData.organizationId
      },
      // Rôle de l'utilisateur
      role: userRole,
      // Redirection (priorité à data.redirectTo, puis data.redirect.path)
      redirectTo: data.redirectTo || (data.redirect && data.redirect.path),
      // Permissions (si disponibles)
      ...(data.permissions && { permissions: data.permissions }),
      // Autres données de réponse (pour une utilisation future)
      ...(data.metadata && { metadata: data.metadata })
    };
  } catch (error) {
    console.error('[2FA] Backend verify-otp error:', error);
    return { success: false, error: 'network_error', message: 'Erreur de connexion au serveur' };
  }
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<void> {
  try {
    localStorage.removeItem('app_jwt');
  } catch (error) {
    console.error('[2FA] Sign out error:', error);
  }
}

/**
 * Vérifier si l'utilisateur est connecté
 */
export async function getCurrentSession(): Promise<Session | null> {
  const token = localStorage.getItem('app_jwt');
  return token ? { token } : null;
}
