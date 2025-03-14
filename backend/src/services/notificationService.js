// backend/src/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Service pour la gestion des notifications
 */
class NotificationService {
  /**
   * Crée une notification pour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} type - Type de notification (annonce, devis, message, avis, etc.)
   * @param {string} referenceId - ID de référence de l'objet associé
   * @param {string} referenceModel - Nom du modèle de référence
   * @returns {Promise<Object>} - La notification créée
   */
  static async create(userId, title, message, type, referenceId = null, referenceModel = null) {
    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(`Utilisateur non trouvé avec l'ID: ${userId}`);
      }

      const notification = await Notification.create({
        user: userId,
        title,
        message,
        type,
        referenceId,
        referenceModel,
        read: false
      });

      return notification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  /**
   * Crée des notifications pour plusieurs utilisateurs
   * @param {Array<string>} userIds - Tableau d'IDs d'utilisateurs
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} type - Type de notification
   * @param {string} referenceId - ID de référence de l'objet associé
   * @param {string} referenceModel - Nom du modèle de référence
   * @returns {Promise<Array<Object>>} - Les notifications créées
   */
  static async notifyMany(userIds, title, message, type, referenceId = null, referenceModel = null) {
    try {
      const notifications = await Promise.all(
        userIds.map(userId => 
          this.create(userId, title, message, type, referenceId, referenceModel)
        )
      );
      
      return notifications.filter(n => n !== null);
    } catch (error) {
      console.error('Erreur lors de la création de notifications multiples:', error);
      throw error;
    }
  }

  /**
   * Crée une notification pour un nouveau devis
   * @param {string} clientId - ID du client
   * @param {string} title - Titre de la notification (par défaut en français)
   * @param {string} message - Message de la notification (par défaut en français)
   * @param {string} devisId - ID du devis
   * @returns {Promise<Object>} - La notification créée
   */
  static async createDevisNotification(clientId, title, message, devisId) {
    return this.create(clientId, title, message, 'devis', devisId, 'Devis');
  }

  /**
   * Crée une notification pour un nouveau message
   * @param {string} destinataireId - ID du destinataire
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} messageId - ID du message ou de la conversation
   * @returns {Promise<Object>} - La notification créée
   */
  static async createMessageNotification(destinataireId, title, message, messageId) {
    return this.create(destinataireId, title, message, 'message', messageId, 'Message');
  }

  /**
   * Crée une notification pour un nouvel avis
   * @param {string} destinataireId - ID du destinataire
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} avisId - ID de l'avis
   * @returns {Promise<Object>} - La notification créée
   */
  static async createAvisNotification(destinataireId, title, message, avisId) {
    return this.create(destinataireId, title, message, 'avis', avisId, 'Avis');
  }

  /**
   * Crée une notification pour une mise à jour de statut d'annonce
   * @param {string} userId - ID de l'utilisateur
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} annonceId - ID de l'annonce
   * @returns {Promise<Object>} - La notification créée
   */
  static async createAnnonceStatusNotification(userId, title, message, annonceId) {
    return this.create(userId, title, message, 'statut_annonce', annonceId, 'Annonce');
  }

  /**
   * Crée une notification pour un paiement
   * @param {string} userId - ID de l'utilisateur
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} paiementId - ID du paiement
   * @returns {Promise<Object>} - La notification créée
   */
  static async createPaiementNotification(userId, title, message, paiementId) {
    return this.create(userId, title, message, 'paiement', paiementId, 'Paiement');
  }

  /**
   * Crée une notification pour une dispute/litige
   * @param {string} userId - ID de l'utilisateur
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} disputeId - ID de la dispute
   * @returns {Promise<Object>} - La notification créée
   */
  static async createDisputeNotification(userId, title, message, disputeId) {
    return this.create(userId, title, message, 'dispute', disputeId, 'Dispute');
  }
}

module.exports = NotificationService;