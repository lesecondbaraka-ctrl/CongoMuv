import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages publiques
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import SearchRoutesPage from '../pages/SearchRoutesPage';
import RouteDetailsPage from '../pages/RouteDetailsPage';
import TripDetailsPage from '../pages/TripDetailsPage';

// Pages d'authentification
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Pages utilisateur
import UserDashboardPage from '../pages/user/DashboardPage';
import UserBookingsPage from '../pages/user/BookingsPage';
import UserProfilePage from '../pages/user/ProfilePage';
import BookingDetailsPage from '../pages/user/BookingDetailsPage';
import PaymentPage from '../pages/user/PaymentPage';

// Pages administrateur
import AdminDashboardPage from '../pages/admin/DashboardPage';
import AdminUsersPage from '../pages/admin/UsersPage';
import AdminRoutesPage from '../pages/admin/RoutesPage';
import AdminTripsPage from '../pages/admin/TripsPage';
import AdminVehiclesPage from '../pages/admin/VehiclesPage';
import AdminBookingsPage from '../pages/admin/BookingsPage';
import AdminReportsPage from '../pages/admin/ReportsPage';

// Pages d'erreur
import NotFoundPage from '../pages/errors/NotFoundPage';
import UnauthorizedPage from '../pages/errors/UnauthorizedPage';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Routes publiques */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="search" element={<SearchRoutesPage />} />
          <Route path="routes/:id" element={<RouteDetailsPage />} />
          <Route path="trips/:id" element={<TripDetailsPage />} />
          
          {/* Redirection basée sur l'état d'authentification */}
          <Route 
            path="dashboard" 
            element={
              isAuthenticated ? 
                <Navigate to="/user/dashboard" replace /> : 
                <Navigate to="/login" state={{ from: '/dashboard' }} replace />
            } 
          />
        </Route>

        {/* Routes d'authentification */}
        <Route path="/" element={<AuthLayout />}>
          <Route 
            path="login" 
            element={
              isAuthenticated ? 
                <Navigate to="/user/dashboard" replace /> : 
                <LoginPage />
            } 
          />
          <Route 
            path="register" 
            element={
              isAuthenticated ? 
                <Navigate to="/user/dashboard" replace /> : 
                <RegisterPage />
            } 
          />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Routes utilisateur protégées */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboardPage />} />
          <Route path="bookings" element={<UserBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="bookings/:id/payment" element={<PaymentPage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Routes administrateur protégées */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          
          {/* Gestion des utilisateurs (uniquement pour superadmin) */}
          <Route 
            path="users" 
            element={
              <ProtectedRoute roles={['superadmin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="routes" element={<AdminRoutesPage />} />
          <Route path="routes/:id" element={<AdminRoutesPage />} />
          <Route path="trips" element={<AdminTripsPage />} />
          <Route path="vehicles" element={<AdminVehiclesPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
        </Route>

        {/* Routes d'erreur */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
