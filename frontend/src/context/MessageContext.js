import React, { createContext, useState, useEffect, useCallback } from 'react';
import messageService from '../services/messageService';
import { useAuth } from '../hooks/useAuth';

// Vérifier si le service de socket est disponible
let socketService;
try {
  socketService = require('../services/socketService').default;
} catch (error) {
  console.warn('Service de socket non disponible:', error.message);
  // Créer un service factice pour éviter les erreurs
  socketService = {
    init: () => null,
    isInitialized: false,
    emit: () => {},
    disconnect: () => {},
  };
}

// Création du contexte de messages
export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { isAuthenticated, user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les conversations - DÉPLACÉE EN PREMIER
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      
      if (response?.data) {
        setConversations(response.data);
        
        // Calcul du nombre total de messages non lus
        const totalUnread = response.data.reduce((total, conv) => total + (conv.nonLus || 0), 0);
        setUnreadCount(totalUnread);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des conversations:', err);
      setError(err.message || 'Erreur lors de la récupération des conversations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Initialiser la connexion socket quand l'utilisateur est authentifié
  useEffect(() => {
    // Vérifier que tous les éléments nécessaires sont disponibles
    if (isAuthenticated && user?.id && token && socketService.init) {
      try {
        const socket = socketService.init(token);
        
        if (socket) {
          // Écouter les nouveaux messages
          socket.on('new_message', async (data) => {
            console.log('Nouveau message reçu:', data);
            // Rafraîchir les conversations
            await fetchConversations();
            // Notification sonore et/ou visuelle
            if (data.expediteur !== user.id) {
              try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(e => console.log('Impossible de jouer le son:', e));
              } catch (error) {
                console.warn('Notification sonore non disponible:', error.message);
              }
            }
          });
          
          // Écouter les mises à jour de statut de lecture
          socket.on('message_read', async (data) => {
            console.log('Message lu:', data);
            // Rafraîchir les conversations
            await fetchConversations();
          });
          
          return () => {
            // Nettoyer les écouteurs socket lors du démontage
            if (socket.off) {
              socket.off('new_message');
              socket.off('message_read');
            }
            if (socketService.disconnect) {
              socketService.disconnect();
            }
          };
        }
      } catch (error) {
        console.error('Erreur d\'initialisation du socket:', error);
      }
    }
  }, [isAuthenticated, token, user?.id, fetchConversations]);

  // Récupérer les conversations au chargement et quand l'authentification change
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      
      // Rafraîchir les conversations périodiquement
      // Toujours configurer un intervalle pour plus de fiabilité, même avec le socket
      const intervalId = setInterval(fetchConversations, 30000);
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, fetchConversations]);

  // Fonction pour envoyer un message
  const sendMessage = async (messageData) => {
    try {
      setError(null);
      const response = await messageService.sendMessage(messageData);
      
      // Mettre à jour les conversations après l'envoi
      await fetchConversations();
      
      return response;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du message');
      throw err;
    }
  };

  // Fonction pour envoyer un message avec pièce jointe
  const sendMessageWithAttachments = async (formData) => {
    try {
      setError(null);
      const response = await messageService.sendMessageWithAttachments(formData);
      
      // Mettre à jour les conversations après l'envoi
      await fetchConversations();
      
      return response;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du message avec pièce jointe');
      throw err;
    }
  };

  // Fonction pour marquer les messages comme lus
  const markAsRead = async (annonceId, userId) => {
    if (!annonceId || !userId) {
      console.error('markAsRead: identifiants manquants', { annonceId, userId });
      return;
    }
    
    try {
      setError(null);
      await messageService.markMessagesAsRead(annonceId, userId);
      
      // Émettre un événement socket pour informer l'autre utilisateur
      if (socketService.isInitialized && socketService.emit && user?.id) {
        socketService.emit('mark_messages_read', {
          annonceId,
          userId: user.id,
          recipientId: userId
        });
      }
      
      // Mettre à jour les conversations après le marquage
      await fetchConversations();
    } catch (err) {
      console.error('Erreur lors du marquage des messages comme lus:', err);
      setError(err.message || 'Erreur lors du marquage des messages comme lus');
      throw err;
    }
  };

  // Fonction pour obtenir le nombre de messages non lus
  const getUnreadCount = async () => {
    try {
      setError(null);
      const response = await messageService.getUnreadCount();
      if (response?.count !== undefined) {
        setUnreadCount(response.count);
        return response.count;
      }
      return unreadCount;
    } catch (err) {
      console.error('Erreur lors du comptage des messages non lus:', err);
      setError(err.message || 'Erreur lors du comptage des messages non lus');
      return unreadCount;
    }
  };

  // Valeurs fournies par le contexte
  const value = {
    conversations,
    unreadCount,
    loading,
    error,
    fetchConversations,
    sendMessage,
    sendMessageWithAttachments,
    markAsRead,
    getUnreadCount
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};

export default MessageProvider;