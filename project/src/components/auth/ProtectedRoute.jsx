import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardByRole } from '../../utils/roleUtils';

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requiredPermission,
  redirectTo,
  ...rest 
}) => {
  const { 
    isAuthenticated, 
    hasRole, 
    hasPermission,
    user,
    isLoading 
  } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();

  // Rediriger vers le tableau de bord approprié si l'utilisateur est connecté
  // mais qu'il tente d'accéder à la page de connexion
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
      const dashboard = getDashboardByRole(user?.role);
      navigate(dashboard.path, { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, user?.role]);

  // Afficher un indicateur de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérifier les rôles requis
  if (requiredRole && !hasRole(requiredRole)) {
    // Si une redirection personnalisée est spécifiée, l'utiliser
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Sinon, rediriger vers le tableau de bord approprié ou la page non autorisée
    const dashboard = getDashboardByRole(user?.role);
    return <Navigate to={dashboard.path} replace />;
  }

  // Vérifier les permissions requises
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Si tout est bon, afficher les enfants
  return children;
};

export default ProtectedRoute;
