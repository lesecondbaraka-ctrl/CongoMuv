import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../utils/roleUtils';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-200' : 'hover:bg-gray-100';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Administration</h1>
          <p className="text-sm text-gray-500">Bienvenue, {user?.name || 'Admin'}</p>
        </div>
        
        <nav className="mt-4">
          <ul>
            <li className="mb-1">
              <Link 
                to="/admin/dashboard" 
                className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/admin/dashboard')}`}
              >
                <span>Tableau de bord</span>
              </Link>
            </li>
            
            {user?.role === ROLES.SUPER_ADMIN && (
              <li className="mb-1">
                <Link 
                  to="/admin/users" 
                  className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/admin/users')}`}
                >
                  <span>Utilisateurs</span>
                </Link>
              </li>
            )}
            
            <li className="mb-1">
              <Link 
                to="/admin/routes" 
                className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/admin/routes')}`}
              >
                <span>Itinéraires</span>
              </Link>
            </li>
            
            <li className="mb-1">
              <Link 
                to="/admin/vehicles" 
                className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/admin/vehicles')}`}
              >
                <span>Véhicules</span>
              </Link>
            </li>
            
            <li className="mb-1">
              <Link 
                to="/admin/reports" 
                className={`flex items-center px-4 py-2 text-gray-700 ${isActive('/admin/reports')}`}
              >
                <span>Rapports</span>
              </Link>
            </li>
            
            <li className="mt-6 border-t pt-2">
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center"
              >
                <span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {location.pathname === '/admin/dashboard' && 'Tableau de bord'}
              {location.pathname === '/admin/users' && 'Gestion des utilisateurs'}
              {location.pathname === '/admin/routes' && 'Gestion des itinéraires'}
              {location.pathname === '/admin/vehicles' && 'Gestion des véhicules'}
              {location.pathname === '/admin/reports' && 'Rapports et statistiques'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
