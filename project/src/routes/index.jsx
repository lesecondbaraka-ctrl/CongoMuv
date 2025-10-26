import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roleUtils';

// Layouts
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const OperatorLayout = lazy(() => import('../layouts/OperatorLayout'));
const DriverLayout = lazy(() => import('../layouts/DriverLayout'));

// Pages publiques
const HomePage = lazy(() => import('../pages/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Pages protégées
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

// Pages administrateur
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const UsersManagement = lazy(() => import('../pages/admin/UsersManagement'));
const RoutesManagement = lazy(() => import('../pages/admin/RoutesManagement'));
const VehiclesManagement = lazy(() => import('../pages/admin/VehiclesManagement'));
const ReportsPage = lazy(() => import('../pages/admin/Reports'));

// Pages opérateur
const OperatorDashboard = lazy(() => import('../pages/operator/Dashboard'));
const OperatorTrips = lazy(() => import('../pages/operator/Trips'));
const OperatorBookings = lazy(() => import('../pages/operator/Bookings'));

// Pages chauffeur
const DriverDashboard = lazy(() => import('../pages/driver/Dashboard'));
const DriverTrips = lazy(() => import('../pages/driver/Trips'));

// Composant de chargement
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Composant de protection de route personnalisé
const ProtectedRoute = ({ children, requiredRole, requiredPermission }) => {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Composant de routage principal
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="unauthorized" element={<UnauthorizedPage />} />
          
          {/* Routes protégées */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes administrateur */}
          <Route 
            path="admin" 
            element={
              <ProtectedRoute requiredRole={ROLES.ADMIN}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="routes" element={<RoutesManagement />} />
            <Route path="vehicles" element={<VehiclesManagement />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          
          {/* Routes opérateur */}
          <Route 
            path="operator" 
            element={
              <ProtectedRoute requiredRole={ROLES.OPERATOR}>
                <OperatorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OperatorDashboard />} />
            <Route path="trips" element={<OperatorTrips />} />
            <Route path="bookings" element={<OperatorBookings />} />
          </Route>
          
          {/* Routes chauffeur */}
          <Route 
            path="driver" 
            element={
              <ProtectedRoute requiredRole={ROLES.DRIVER}>
                <DriverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DriverDashboard />} />
            <Route path="trips" element={<DriverTrips />} />
          </Route>
          
          {/* Redirection par défaut pour les utilisateurs connectés */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Route>
        
        {/* Gestion des erreurs 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
