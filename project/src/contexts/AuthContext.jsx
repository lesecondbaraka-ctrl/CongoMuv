import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authApi } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDashboardByRole, hasRole as checkRole, checkPermission as verifyPermission } from '../utils/roleUtils';

// Création du contexte
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Charger les informations de l'utilisateur
  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('app_jwt');
      if (!token) {
        setIsLoading(false);
        return null;
      }

      // Récupérer le rôle depuis le localStorage s'il existe
      const storedRole = localStorage.getItem('app_role') || 'user';
      const userRole = storedRole.toLowerCase().trim();
      
      // Récupérer les données utilisateur depuis l'API
      let userData = {};
      try {
        userData = await authApi.getProfile();
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        // Continuer avec les données stockées en cas d'erreur
      }
      
      // Créer un utilisateur normalisé
      const normalizedUser = {
        ...userData,
        role: userRole,
        id: userData.id || 'temp-id',
        email: userData.email || localStorage.getItem('user_email') || ''
      };
      
      setUser(normalizedUser);
      setIsAuthenticated(true);
      setCurrentOrganization(normalizedUser.organization || null);
      
      // Définir les redirections par rôle
      const roleRedirects = {
        'superadmin': '/admin/dashboard',
        'super_admin': '/admin/dashboard',
        'admin': '/admin/dashboard',
        'congomuv_hq': '/admin/hq',
        'onatra': '/operator/dashboard',
        'transco': '/operator/dashboard',
        'private': '/operator/dashboard',
        'operator': '/operator/dashboard',
        'driver': '/driver/dashboard',
        'passenger': '/dashboard',
        'user': '/dashboard'
      };
      
      // Rediriger si nécessaire
      const currentPath = window.location.pathname + window.location.hash;
      const shouldRedirect = [
        '/login',
        '/',
        '#/login',
        '#/'
      ].some(path => currentPath.endsWith(path));
      
      if (shouldRedirect) {
        const redirectPath = roleRedirects[userRole] || '/';
        console.log(`Redirection de l'utilisateur (${userRole}) vers:`, redirectPath);
        window.location.hash = redirectPath;
      }
      
      return normalizedUser;
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      localStorage.removeItem('token');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      const userData = await loadUser();
      
      // Rediriger vers le tableau de bord si l'utilisateur est connecté et sur la page de connexion
      if (userData && (location.pathname === '/login' || location.pathname === '/register')) {
        const dashboard = getDashboardByRole(userData.role);
        navigate(dashboard.path);
      }
    };

    checkAuth();
  }, [loadUser, location.pathname, navigate]);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Tentative de connexion avec:', email);
      
      const response = await authApi.login(email, password);
      console.log('Réponse de l\'API de connexion:', response);

      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        
        // Normalisation du rôle
        let userRole = response.user?.role || 'user';
        userRole = userRole.toLowerCase().trim();
        
        // Mise à jour de l'utilisateur avec le rôle normalisé
        const normalizedUser = {
          ...response.user,
          role: userRole === 'user' ? 'passenger' : userRole
        };
        
        // Mise à jour de l'état avant la redirection
        setUser(normalizedUser);
        setIsAuthenticated(true);
        setCurrentOrganization(normalizedUser.organization || null);
        
        // Obtenir le tableau de bord approprié
        const dashboard = getDashboardByRole(normalizedUser.role);
        console.log('Redirection après connexion vers:', dashboard.path);
        
        // Utiliser navigate pour la redirection avec remplacement pour éviter les problèmes de navigation
        navigate(dashboard.path, { replace: true });
        
        // Forcer un rechargement si nécessaire (décommentez si nécessaire)
        // window.location.href = dashboard.path;
        
        return { 
          success: true, 
          redirect: dashboard.path,
          user: normalizedUser
        };
      }

      const errorMessage = response.message || 'Erreur lors de la connexion';
      console.error('Échec de la connexion:', errorMessage);
      setError(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la connexion';
      console.error('Erreur lors de la connexion:', error);
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      setError(null);
      const { success, token, user: userDataResponse, message } = await authApi.register(userData);

      if (success && token) {
        localStorage.setItem('token', token);
        
        // Mettre à jour l'état avec les données utilisateur
        setUser(userDataResponse);
        setIsAuthenticated(true);
        setCurrentOrganization(userDataResponse.organization || null);
        
        // Rediriger vers le tableau de bord approprié
        const dashboard = getDashboardByRole(userDataResponse.role);
        navigate(dashboard.path);
        
        return { 
          success: true, 
          redirect: dashboard.path 
        };
      }

      return { 
        success: false, 
        message: message || 'Erreur lors de l\'inscription' 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentOrganization(null);
    navigate('/login');
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const updatedUser = await authApi.updateProfile(userData);
      setUser(prev => ({ ...prev, ...updatedUser }));
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  // Vérifie si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user) return false;
    
    // Le superadmin a automatiquement tous les rôles
    if (user.role === ROLES.SUPER_ADMIN) {
      return true;
    }
    
    // Vérification normale pour les autres rôles
    return user.role === role;
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    // Le superadmin a automatiquement toutes les permissions
    if (user.role === ROLES.SUPER_ADMIN) {
      console.log(`SuperAdmin - Accès accordé à la permission: ${permission}`);
      return true;
    }
    
    // Vérification normale pour les autres rôles
    const hasPerm = verifyPermission(user.role, permission);
    console.log(`Vérification permission [${permission}] pour ${user.role}: ${hasPerm}`);
    return hasPerm;
  };

  // Fonction pour définir l'entité active
  const setOrganization = (organization) => {
    setCurrentOrganization(organization);
  };

  // Recharger les informations utilisateur
  const refreshUser = async () => {
    return await loadUser();
  };

  // Valeur du contexte
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    hasPermission,
    currentOrganization,
    setOrganization,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext;
