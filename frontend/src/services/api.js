import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // À adapter à votre backend
  timeout: 10000,
});

// Intercepteur pour les erreurs globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;