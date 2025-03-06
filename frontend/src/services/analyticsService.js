// frontend/src/services/analyticsService.js
import apiClient from '../api/client';

const analyticsService = {
  // Obtenir les statistiques pour le tableau de bord client
  getClientAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/client');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques client' };
    }
  },

  // Obtenir les statistiques pour le tableau de bord transporteur
  getTransporteurAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/transporteur');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques transporteur' };
    }
  },

  // Obtenir les statistiques des annonces
  getAnnoncesAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/annonces');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques des annonces' };
    }
  },

  // Obtenir les statistiques des paiements
  getPaiementsAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/paiements');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques des paiements' };
    }
  },

  // Obtenir les statistiques de performance
  getPerformanceAnalytics: async () => {
    try {
      const response = await apiClient.get('/analytics/performance');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques de performance' };
    }
  },

  // Obtenir l'historique des transports
  getHistoriqueTransports: async () => {
    try {
      const response = await apiClient.get('/analytics/historique');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'historique des transports' };
    }
  }
};

export default analyticsService;