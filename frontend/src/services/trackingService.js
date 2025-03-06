import apiClient from '../api/client';

const trackingService = {
  // Obtenir les informations de suivi d'une annonce
  getTracking: async (annonceId) => {
    try {
      const response = await apiClient.get(`/tracking/${annonceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des informations de suivi' };
    }
  },

  // Obtenir les informations de suivi avec un code public
  getTrackingPublic: async (codeTracking) => {
    try {
      const response = await apiClient.get(`/tracking/public/${codeTracking}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des informations de suivi' };
    }
  },

  // Créer ou mettre à jour le suivi d'une annonce
  createUpdateTracking: async (annonceId, trackingData) => {
    try {
      const response = await apiClient.post(`/tracking/${annonceId}`, trackingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du suivi' };
    }
  },

  // Mettre à jour le statut de suivi
  updateTrackingStatus: async (annonceId, statut, commentaire, localisation) => {
    try {
      const response = await apiClient.patch(`/tracking/${annonceId}/status`, {
        statut,
        commentaire,
        localisation
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du statut de suivi' };
    }
  },

  // Ajouter un événement dans l'historique de suivi
  addTrackingEvent: async (annonceId, commentaire, localisation, positionGPS) => {
    try {
      const response = await apiClient.post(`/tracking/${annonceId}/event`, {
        commentaire,
        localisation,
        positionGPS
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout d\'un événement de suivi' };
    }
  },

  // Obtenir ou générer un code de suivi
  getTrackingCode: async (annonceId) => {
    try {
      const response = await apiClient.get(`/tracking/${annonceId}/code`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du code de suivi' };
    }
  },

  // Mettre à jour la position GPS
  updateGpsPosition: async (annonceId, latitude, longitude) => {
    try {
      const response = await apiClient.post(`/tracking/${annonceId}/position`, {
        latitude,
        longitude
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de la position GPS' };
    }
  },

  // Marquer comme livré avec signature
  markAsDelivered: async (annonceId, deliveryData) => {
    try {
      const response = await apiClient.post(`/tracking/${annonceId}/delivered`, deliveryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du marquage comme livré' };
    }
  },

  // Confirmer la réception
  confirmReception: async (annonceId, commentaire) => {
    try {
      const response = await apiClient.post(`/tracking/${annonceId}/confirm-reception`, { commentaire });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la confirmation de réception' };
    }
  },

  // Signaler un problème lié à la livraison
  reportIssue: async (annonceId, issueData) => {
    try {
      const response = await apiClient.post(`/tracking/${annonceId}/report-issue`, issueData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du signalement du problème' };
    }
  }
};

export default trackingService;