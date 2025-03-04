import axios from 'axios';

// Crée une instance Axios avec l'URL de base de l'API
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
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

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion spécifique des erreurs 401 (non autorisé)
    if (error.response && error.response.status === 401) {
      // Supprime le token si la session est expirée
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirige vers la page de connexion
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;