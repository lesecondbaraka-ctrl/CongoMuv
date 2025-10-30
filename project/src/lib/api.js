import axios from 'axios';

// Configuration de base de l'API
const API_URL = 'http://localhost:3002/api'; // Forçage de l'URL de l'API

// Création d'une instance axios avec les configurations par défaut
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des erreurs
const handleApiError = (error) => {
  if (error.response) {
    // La requête a été faite et le serveur a répondu avec un code d'erreur
    console.error('Erreur API:', error.response.data);
    return Promise.reject({
      message: error.response.data.message || 'Une erreur est survenue',
      status: error.response.status,
      data: error.response.data,
    });
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    console.error('Pas de réponse du serveur:', error.request);
    return Promise.reject({
      message: 'Pas de réponse du serveur. Veuillez vérifier votre connexion internet.',
    });
  } else {
    // Une erreur s'est produite lors de la configuration de la requête
    console.error('Erreur de configuration de la requête:', error.message);
    return Promise.reject({
      message: 'Erreur de configuration de la requête',
    });
  }
};

// Fonctions pour les utilisateurs
export const authApi = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/me', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Fonctions pour les réservations
export const bookingApi = {
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getBookings: async (filters = {}) => {
    try {
      const response = await api.get('/bookings', { params: filters });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateBooking: async (id, updates) => {
    try {
      const response = await api.put(`/bookings/${id}`, updates);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  cancelBooking: async (id) => {
    try {
      const response = await api.post(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Fonctions pour les itinéraires
export const routeApi = {
  createRoute: async (routeData) => {
    try {
      const response = await api.post('/admin-crud/routes', routeData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getRoutes: async (filters = {}) => {
    try {
      const response = await api.get('/admin-crud/routes', { params: filters });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getRouteById: async (id) => {
    try {
      // Backend ne fournit pas /admin-crud/routes/:id -> récupérer la liste et filtrer côté client
      const response = await api.get('/admin-crud/routes', { params: { id } });
      const items = response.data?.items || response.data?.routes || response.data || [];
      const found = Array.isArray(items) ? items.find((r) => String(r.id) === String(id)) : null;
      return found || null;
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateRoute: async (id, updates) => {
    try {
      const response = await api.put(`/admin-crud/routes/${id}`, updates);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteRoute: async (id) => {
    try {
      const response = await api.delete(`/admin-crud/routes/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getRouteSchedule: async (id) => {
    try {
      // Pas d'endpoint planning dédié côté backend -> retourner un format sûr
      const route = await routeApi.getRouteById(id);
      return { routeId: id, schedule: [], route };
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Fonctions pour les trajets
export const tripApi = {
  createTrip: async (tripData) => {
    try {
      const response = await api.post('/trips', tripData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getTrips: async (filters = {}) => {
    try {
      const response = await api.get('/trips', { params: filters });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getTripById: async (id) => {
    try {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateTrip: async (id, updates) => {
    try {
      const response = await api.put(`/trips/${id}`, updates);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteTrip: async (id) => {
    try {
      const response = await api.delete(`/trips/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getAvailableSeats: async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/seats`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Fonctions pour les véhicules
export const vehicleApi = {
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getVehicles: async (filters = {}) => {
    try {
      // Utiliser l'endpoint existant pour véhicules actifs côté opérateur
      const response = await api.get('/operator/vehicles/active', { params: filters });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getVehicleById: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateVehicle: async (id, updates) => {
    try {
      const response = await api.put(`/vehicles/${id}`, updates);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Fonctions pour les utilisateurs (admin)
export const userApi = {
  getUsers: async (filters = {}) => {
    try {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateUser: async (id, updates) => {
    try {
      const response = await api.put(`/admin/users/${id}`, updates);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default {
  auth: authApi,
  booking: bookingApi,
  route: routeApi,
  trip: tripApi,
  vehicle: vehicleApi,
  user: userApi,
};
