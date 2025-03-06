import apiClient from '../api/client';

const devisService = {
  // Créer un nouveau devis
  createDevis: async (devisData) => {
    try {
      const response = await apiClient.post('/devis', devisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du devis' };
    }
  },

  // Récupérer les devis pour une annonce spécifique
  getDevisForAnnonce: async (annonceId) => {
    try {
      const response = await apiClient.get(`/devis/annonce/${annonceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des devis' };
    }
  },

  // Récupérer les devis envoyés par le transporteur
  getMesDevisEnvoyes: async (filters = {}) => {
    try {
      const response = await apiClient.get('/devis/mes-devis', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de vos devis' };
    }
  },

  // Récupérer les devis reçus par le client
  getMesDevisRecus: async (filters = {}) => {
    try {
      const response = await apiClient.get('/devis/recus', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des devis reçus' };
    }
  },

  // Récupérer un devis par son ID
  getDevisById: async (id) => {
    try {
      const response = await apiClient.get(`/devis/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du devis' };
    }
  },

  // Accepter un devis
  accepterDevis: async (devisId) => {
    try {
      const response = await apiClient.put(`/devis/${devisId}/accepter`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'acceptation du devis' };
    }
  },

  // Refuser un devis
  refuserDevis: async (devisId, raison) => {
    try {
      const response = await apiClient.put(`/devis/${devisId}/refuser`, { raison });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du refus du devis' };
    }
  },

  // Annuler un devis (transporteur)
  annulerDevis: async (devisId, raison) => {
    try {
      const response = await apiClient.put(`/devis/${devisId}/annuler`, { raison });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'annulation du devis' };
    }
  },

  // Mettre à jour le statut d'un transport en cours
  updateStatutTransport: async (devisId, statut, commentaire, localisation) => {
    try {
      const response = await apiClient.put(`/devis/${devisId}/statut`, {
        statut,
        commentaire,
        localisation
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du statut' };
    }
  },

  // Modifier un devis
  updateDevis: async (devisId, devisData) => {
    try {
      const response = await apiClient.put(`/devis/${devisId}`, devisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification du devis' };
    }
  }
};

export default devisService;