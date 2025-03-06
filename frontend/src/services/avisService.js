import apiClient from '../api/client';

const avisService = {
  // Créer un nouvel avis
  createAvis: async (avisData) => {
    try {
      const response = await apiClient.post('/avis', avisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de l\'avis' };
    }
  },

  // Récupérer les avis d'un utilisateur spécifique
  getAvisUtilisateur: async (userId, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/avis/utilisateur/${userId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des avis' };
    }
  },

  // Récupérer les avis donnés par l'utilisateur connecté
  getAvisDonnes: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/avis/donnes', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des avis donnés' };
    }
  },

  // Récupérer les avis reçus par l'utilisateur connecté
  getAvisRecus: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/avis/recus', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des avis reçus' };
    }
  }
};

export default avisService;