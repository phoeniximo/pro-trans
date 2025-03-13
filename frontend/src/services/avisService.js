import apiClient from '../api/client';

/**
 * Service pour la gestion des avis
 */
const avisService = {
  /**
   * Crée un nouvel avis
   * @param {Object} avisData - Données de l'avis (note, commentaire, destinataireId, annonceId)
   * @returns {Promise<Object>} Résultat de la création
   */
  createAvis: async (avisData) => {
    try {
      console.log('Envoi des données d\'avis:', avisData);
      
      const response = await apiClient.post('/avis', avisData);
      
      console.log('Réponse création avis:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur createAvis:', error);
      throw error.response?.data || { message: 'Erreur lors de la création de l\'avis' };
    }
  },

  /**
   * Récupère les avis d'un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {number} page - Numéro de page (pagination)
   * @param {number} limit - Nombre d'éléments par page
   * @returns {Promise<Object>} Avis de l'utilisateur avec pagination
   */
  getAvisUtilisateur: async (userId, page = 1, limit = 10) => {
    try {
      console.log('Requête avis utilisateur pour:', userId);
      
      const response = await apiClient.get(`/avis/utilisateur/${userId}`, {
        params: { 
          page, 
          limit,
          _t: new Date().getTime() // Pour éviter le cache
        }
      });
      
      console.log('Réponse getAvisUtilisateur:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur getAvisUtilisateur:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des avis' };
    }
  },

  /**
   * Récupère les avis donnés par l'utilisateur connecté
   * @param {number} page - Numéro de page (pagination)
   * @param {number} limit - Nombre d'éléments par page
   * @param {boolean} forceRefresh - Forcer l'actualisation des données
   * @returns {Promise<Object>} Avis donnés avec pagination
   */
  getAvisDonnes: async (page = 1, limit = 10, forceRefresh = false) => {
    try {
      console.log('Requête getAvisDonnes - Page:', page, 'Limit:', limit);
      
      // Ajout d'un timestamp pour forcer le non-cache
      const params = {
        page,
        limit
      };
      
      if (forceRefresh) {
        params._t = new Date().getTime();
      }
      
      const response = await apiClient.get('/avis/donnes', { 
        params,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('Réponse brute getAvisDonnes:', response);
      
      // Si la réponse est directement un tableau (format inattendu)
      if (Array.isArray(response)) {
        return {
          success: true,
          total: response.length,
          pages: 1,
          currentPage: 1,
          data: response
        };
      }
      
      // Si la réponse est au format attendu
      if (response.data) {
        // Si data.data existe et est un tableau
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data;
        }
        
        // Si data est directement un tableau
        if (Array.isArray(response.data)) {
          return {
            success: true,
            total: response.data.length,
            pages: 1,
            currentPage: 1,
            data: response.data
          };
        }
      }
      
      // Format fallback (vide)
      return {
        success: false,
        total: 0,
        pages: 0,
        currentPage: 1,
        data: []
      };
    } catch (error) {
      console.error('Erreur getAvisDonnes:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des avis donnés' };
    }
  },

  /**
   * Récupère les avis reçus par l'utilisateur connecté
   * @param {number} page - Numéro de page (pagination)
   * @param {number} limit - Nombre d'éléments par page
   * @param {boolean} forceRefresh - Forcer l'actualisation des données
   * @returns {Promise<Object>} Avis reçus avec pagination
   */
  getAvisRecus: async (page = 1, limit = 10, forceRefresh = false) => {
    try {
      console.log('Requête getAvisRecus - Page:', page, 'Limit:', limit);
      
      // Ajout d'un timestamp pour forcer le non-cache
      const params = {
        page,
        limit
      };
      
      if (forceRefresh) {
        params._t = new Date().getTime();
      }
      
      const response = await apiClient.get('/avis/recus', { 
        params,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('Réponse brute getAvisRecus:', response);
      
      // Si la réponse est directement un tableau (format inattendu)
      if (Array.isArray(response)) {
        return {
          success: true,
          total: response.length,
          pages: 1,
          currentPage: 1,
          data: response
        };
      }
      
      // Si la réponse est au format attendu
      if (response.data) {
        // Si data.data existe et est un tableau
        if (response.data.data && Array.isArray(response.data.data)) {
          return response.data;
        }
        
        // Si data est directement un tableau
        if (Array.isArray(response.data)) {
          return {
            success: true,
            total: response.data.length,
            pages: 1,
            currentPage: 1,
            data: response.data
          };
        }
      }
      
      // Format fallback (vide)
      return {
        success: false,
        total: 0,
        pages: 0,
        currentPage: 1,
        data: []
      };
    } catch (error) {
      console.error('Erreur getAvisRecus:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération des avis reçus' };
    }
  },

  /**
   * Vérifie si un avis existe déjà pour un destinataire et une annonce
   * @param {string} destinataireId - ID du destinataire de l'avis
   * @param {string} annonceId - ID de l'annonce concernée
   * @returns {Promise<Object>} Résultat de la vérification {exists: boolean}
   */
  checkAvisExists: async (destinataireId, annonceId) => {
    try {
      console.log('Vérification existence avis pour:', destinataireId, annonceId);
      
      const response = await apiClient.get(`/avis/check/${destinataireId}/${annonceId}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('Réponse check avis:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Erreur checkAvisExists:', error);
      throw error.response?.data || { message: 'Erreur lors de la vérification de l\'avis' };
    }
  },

  /**
   * Récupère les détails d'un avis spécifique
   * @param {string} avisId - ID de l'avis
   * @returns {Promise<Object>} Détails de l'avis
   */
  getAvisById: async (avisId) => {
    try {
      const response = await apiClient.get(`/avis/${avisId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getAvisById:', error);
      throw error.response?.data || { message: 'Erreur lors de la récupération de l\'avis' };
    }
  },

  /**
   * Supprime un avis
   * @param {string} avisId - ID de l'avis à supprimer
   * @returns {Promise<Object>} Résultat de la suppression
   */
  deleteAvis: async (avisId) => {
    try {
      const response = await apiClient.delete(`/avis/${avisId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deleteAvis:', error);
      throw error.response?.data || { message: 'Erreur lors de la suppression de l\'avis' };
    }
  }
};

export default avisService;