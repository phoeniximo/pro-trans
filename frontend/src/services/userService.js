import apiClient from '../api/client';

const userService = {
  // Récupérer les transporteurs avec filtres optionnels
  getTransporteurs: async (filters = {}) => {
    try {
      const response = await apiClient.get('/users/transporteurs', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des transporteurs' };
    }
  },

  // Récupérer le profil d'un utilisateur
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil utilisateur' };
    }
  },

  // Récupérer son propre profil
  getMyProfile: async () => {
    try {
      const response = await apiClient.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de votre profil' };
    }
  },

  // Mettre à jour son profil
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du profil' };
    }
  },

  // Télécharger une photo de profil
  uploadProfilePhoto: async (formData) => {
    try {
      const response = await apiClient.post('/users/profile/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du téléchargement de la photo' };
    }
  },

  // Télécharger des documents (pour les transporteurs)
  uploadDocuments: async (formData) => {
    try {
      const response = await apiClient.post('/users/profile/upload-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du téléchargement des documents' };
    }
  },

  // Mettre à jour le mot de passe
  updatePassword: async (passwordData) => {
    try {
      const response = await apiClient.put('/users/profile/update-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du mot de passe' };
    }
  }
};

export default userService;