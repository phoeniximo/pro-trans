const Notification = require('../models/Notification');

/**
 * Service pour créer et gérer les notifications
 */
class NotificationService {
  /**
   * Créer une nouvelle notification
   * @param {ObjectId} userId - ID de l'utilisateur
   * @param {String} title - Titre de la notification
   * @param {String} message - Message de la notification
   * @param {String} type - Type de notification (annonce, devis, message, avis, system)
   * @param {ObjectId} referenceId - ID de l'élément référencé (optionnel)
   * @param {String} referenceModel - Modèle de l'élément référencé (optionnel)
   * @returns {Promise<Object>} La notification créée
   */
  static async createNotification(userId, title, message, type, referenceId = null, referenceModel = null) {
    try {
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
      return null;
    }
  }

  /**
   * Créer une notification d'annonce
   * @param {ObjectId} userId - ID de l'utilisateur
   * @param {String} title - Titre de la notification
   * @param {String} message - Message de la notification
   * @param {ObjectId} annonceId - ID de l'annonce
   * @returns {Promise<Object>} La notification créée
   */
  static async createAnnonceNotification(userId, title, message, annonceId) {
    return this.createNotification(userId, title, message, 'annonce', annonceId, 'Annonce');
  }

  /**
   * Créer une notification de devis
   * @param {ObjectId} userId - ID de l'utilisateur
   * @param {String} title - Titre de la notification
   * @param {String} message - Message de la notification
   * @param {ObjectId} devisId - ID du devis
   * @returns {Promise<Object>} La notification créée
   */
  static async createDevisNotification(userId, title, message, devisId) {
    return this.createNotification(userId, title, message, 'devis', devisId, 'Devis');
  }

  /**
   * Créer une notification de message
   * @param {ObjectId} userId - ID de l'utilisateur
   * @param {String} title - Titre de la notification
   * @param {String} message - Message de la notification
   * @param {ObjectId} conversationId - ID de la conversation
   * @returns {Promise<Object>} La notification créée
   */
  static async createMessageNotification(userId, title, message, conversationId) {
    return this.createNotification(userId, title, message, 'message', conversationId, 'Conversation');
  }

  /**
   * Créer une notification d'avis
   * @param {ObjectId} userId - ID de l'utilisateur
   * @param {String} title - Titre de la notification
   * @param {String} message - Message de la notification
   * @param {ObjectId} avisId - ID de l'avis
   * @returns {Promise<Object>} La notification créée
   */
  static async createAvisNotification(userId, title, message, avisId) {
    return this.createNotification(userId, title, message, 'avis', avisId, 'Avis');
  }

  /**
   * Créer une notification système
   * @param {ObjectId} userId - ID de l'utilisateur
   * @param {String} title - Titre de la notification
   * @param {String} message - Message de la notification
   * @returns {Promise<Object>} La notification créée
   */
  static async createSystemNotification(userId, title, message) {
    return this.createNotification(userId, title, message, 'system');
  }

  /**
   * Notifier plusieurs utilisateurs
   * @param {Array<ObjectId>} userIds - Liste des IDs d'utilisateurs
   * @param {String} title - Titre de la notification
   * @param {String} message - Message de la notification
   * @param {String} type - Type de notification
   * @param {ObjectId} referenceId - ID de l'élément référencé (optionnel)
   * @param {String} referenceModel - Modèle de l'élément référencé (optionnel)
   * @returns {Promise<Array<Object>>} Liste des notifications créées
   */
  static async notifyMany(userIds, title, message, type, referenceId = null, referenceModel = null) {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = await this.createNotification(
          userId, title, message, type, referenceId, referenceModel
        );
        
        if (notification) {
          notifications.push(notification);
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Erreur lors de la notification de plusieurs utilisateurs:', error);
      return [];
    }
  }

  /**
   * Supprimer les anciennes notifications
   * @param {Number} days - Nombre de jours à conserver (défaut: 30)
   * @returns {Promise<Number>} Nombre de notifications supprimées
   */
  static async cleanupOldNotifications(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate }
      });
      
      return result.deletedCount;
    } catch (error) {
      console.error('Erreur lors du nettoyage des anciennes notifications:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;