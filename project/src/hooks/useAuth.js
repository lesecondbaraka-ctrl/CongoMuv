import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../components/ui/use-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Configuration d'Axios pour inclure le token dans les requêtes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Vérifier la validité du token avec le backend
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: authToken, user: userData } = response.data;
      
      setToken(authToken);
      setUser(userData);
      
      toast({
        title: 'Connexion réussie',
        description: `Bienvenue, ${userData.first_name || userData.email}!`,
      });
      
      return userData;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw new Error(
        error.response?.data?.message || 'Échec de la connexion. Veuillez réessayer.'
      );
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: authToken, user: newUser } = response.data;
      
      setToken(authToken);
      setUser(newUser);
      
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès!',
      });
      
      return newUser;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw new Error(
        error.response?.data?.message || "Échec de l'inscription. Veuillez réessayer."
      );
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
    
    toast({
      title: 'Déconnexion réussie',
      description: 'Vous avez été déconnecté avec succès.',
    });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/auth/me', userData);
      setUser(response.data.user);
      
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été mises à jour avec succès.',
      });
      
      return response.data.user;
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      throw new Error(
        error.response?.data?.message || 'Échec de la mise à jour du profil.'
      );
    }
  };

  const resetPassword = async (email) => {
    try {
      await axios.post('/api/auth/forgot-password', { email });
      
      toast({
        title: 'Email envoyé',
        description: 'Un email de réinitialisation a été envoyé à votre adresse.',
      });
      
      return true;
    } catch (error) {
      console.error('Erreur de réinitialisation du mot de passe:', error);
      throw new Error(
        error.response?.data?.message || 'Échec de la réinitialisation du mot de passe.'
      );
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export default AuthContext;
