import apiClient from '../api/client';

// Service d'authentification
const authService = {
  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
    }
  },

  // Connexion d'un utilisateur
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la connexion' };
    }
  },

  // Déconnexion d'un utilisateur
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Récupération des informations de l'utilisateur actuel
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  },

  // Demande de réinitialisation de mot de passe
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la demande de réinitialisation' };
    }
  },

  // Réinitialisation du mot de passe
  resetPassword: async (token, passwordData) => {
    try {
      const response = await apiClient.patch(`/auth/reset-password/${token}`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la réinitialisation du mot de passe' };
    }
  },

  // Vérification de l'email
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.get(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la vérification de l\'email' };
    }
  },

  // Vérification de la validité du token
  isTokenValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Vérification basique de l'expiration du token
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Conversion en millisecondes
      
      return Date.now() < expiration;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return false;
    }
  },
};

export default authService;