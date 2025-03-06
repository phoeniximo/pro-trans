import apiClient from '../api/client';

const paymentService = {
  // Créer un paiement
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du paiement' };
    }
  },

  // Obtenir les méthodes de paiement sauvegardées
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/payments/payment-methods');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des méthodes de paiement' };
    }
  },

  // Ajouter une nouvelle méthode de paiement
  addPaymentMethod: async (cardData) => {
    try {
      const response = await apiClient.post('/payments/payment-methods', cardData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout de la méthode de paiement' };
    }
  },

  // Supprimer une méthode de paiement
  deletePaymentMethod: async (id) => {
    try {
      const response = await apiClient.delete(`/payments/payment-methods/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la méthode de paiement' };
    }
  },

  // Vérifier le statut d'un paiement
  getPaymentStatus: async (id) => {
    try {
      const response = await apiClient.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la vérification du statut du paiement' };
    }
  },

  // Obtenir les factures de l'utilisateur
  getUserInvoices: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/payments/factures', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des factures' };
    }
  },

  // Obtenir une facture spécifique
  getInvoice: async (id) => {
    try {
      const response = await apiClient.get(`/payments/factures/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de la facture' };
    }
  },

  // Télécharger une facture au format PDF
  downloadInvoice: async (id) => {
    try {
      const response = await apiClient.get(`/payments/factures/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du téléchargement de la facture' };
    }
  },

  // Obtenir les statistiques de paiement
  getPaymentStatistics: async () => {
    try {
      const response = await apiClient.get('/payments/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des statistiques de paiement' };
    }
  }
};

export default paymentService;