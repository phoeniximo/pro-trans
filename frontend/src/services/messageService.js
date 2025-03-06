import apiClient from '../api/client';

const messageService = {
  // Envoyer un nouveau message
  sendMessage: async (messageData) => {
    try {
      const response = await apiClient.post('/messages', messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'envoi du message' };
    }
  },

  // Envoyer un message avec pièce jointe
  sendMessageWithAttachments: async (formData) => {
    try {
      const response = await apiClient.post('/messages/with-attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'envoi du message avec pièce jointe' };
    }
  },

  // Récupérer toutes les conversations de l'utilisateur
  getConversations: async () => {
    try {
      const response = await apiClient.get('/messages/conversations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des conversations' };
    }
  },

  // Récupérer les messages d'une conversation
  getConversation: async (annonceId, userId) => {
    try {
      const response = await apiClient.get(`/messages/conversation/${annonceId}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des messages' };
    }
  },

  // Marquer les messages d'une conversation comme lus
  markMessagesAsRead: async (annonceId, userId) => {
    try {
      const response = await apiClient.put(`/messages/mark-read/${annonceId}/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du marquage des messages comme lus' };
    }
  },

  // Obtenir le nombre de messages non lus
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/messages/unread-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du comptage des messages non lus' };
    }
  }
};

export default messageService;