import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../lib/api';
import { getDashboardByRole, hasRole as checkRole, checkPermission as verifyPermission } from '../utils/roleUtils';

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
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return null;
      }

      const userData = await authApi.getProfile();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        setCurrentOrganization(userData.organization || null);
        return userData;
      }
      return null;
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
      setIsLoading(true);
      
      const { success, token, user: userData, message } = await authApi.login(email, password);

      if (success && token) {
        localStorage.setItem('token', token);
        
        // Mettre à jour l'état avec les données utilisateur
        setUser(userData);
        setIsAuthenticated(true);
        setCurrentOrganization(userData.organization || null);
        
        // Rediriger vers le tableau de bord approprié
        const dashboard = getDashboardByRole(userData.role);
        navigate(dashboard.path);
        
        return { success: true, redirect: dashboard.path };
      }

      return { 
        success: false, 
        message: message || 'Erreur lors de la connexion' 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user || !user.role) return false;
    return checkRole(user.role, role);
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    return verifyPermission(user.role, permission);
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
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext;
