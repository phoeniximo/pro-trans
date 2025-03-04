import apiClient from '../api/client';

// Service pour la gestion des annonces
const annonceService = {
  // Récupérer toutes les annonces avec filtres optionnels
  getAnnonces: async (filters = {}) => {
    try {
      const response = await apiClient.get('/annonces', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des annonces' };
    }
  },

  // Récupérer une annonce par son ID
  getAnnonceById: async (id) => {
    try {
      const response = await apiClient.get(`/annonces/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'annonce' };
    }
  },

  // Créer une nouvelle annonce
  createAnnonce: async (annonceData) => {
    try {
      const response = await apiClient.post('/annonces', annonceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de l\'annonce' };
    }
  },

  // Mettre à jour une annonce existante
  updateAnnonce: async (id, annonceData) => {
    try {
      const response = await apiClient.put(`/annonces/${id}`, annonceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'annonce' };
    }
  },

  // Supprimer une annonce
  deleteAnnonce: async (id) => {
    try {
      const response = await apiClient.delete(`/annonces/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'annonce' };
    }
  },

  // Récupérer les annonces de l'utilisateur connecté
  getMesAnnonces: async (filters = {}) => {
    try {
      const response = await apiClient.get('/annonces/user/mes-annonces', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de vos annonces' };
    }
  },

  // Uploader des images pour une annonce
  uploadImages: async (id, formData) => {
    try {
      const response = await apiClient.post(`/annonces/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du téléchargement des images' };
    }
  },
};

export default annonceService;