import axios from 'axios';

// Crée une instance Axios avec URL relative (fonctionne avec proxy)
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Envoi de requête: ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Réponse de ${response.config.url}: succès`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`Erreur ${error.response.status} pour ${error.config.url}:`, 
                    error.response.data);
      
      // Gestion des erreurs 401 (non autorisé)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired';
        }
      }
    } else if (error.request) {
      console.error('Pas de réponse du serveur:', error.request);
    } else {
      console.error('Erreur:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;