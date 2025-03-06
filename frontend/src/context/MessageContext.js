import React, { createContext, useState, useEffect, useCallback } from 'react';
import messageService from '../services/messageService';
import { useAuth } from '../hooks/useAuth';

// Création du contexte de messages
export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data);
      
      // Calcul du nombre total de messages non lus
      const totalUnread = response.data.reduce((total, conv) => total + conv.nonLus, 0);
      setUnreadCount(totalUnread);
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des conversations:', err);
      setError(err.message || 'Erreur lors de la récupération des conversations');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Récupérer les conversations au chargement et quand l'authentification change
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
      
      // Rafraîchir les conversations toutes les 30 secondes
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
    try {
      setError(null);
      await messageService.markMessagesAsRead(annonceId, userId);
      
      // Mettre à jour les conversations après le marquage
      await fetchConversations();
    } catch (err) {
      setError(err.message || 'Erreur lors du marquage des messages comme lus');
      throw err;
    }
  };

  // Fonction pour obtenir le nombre de messages non lus
  const getUnreadCount = async () => {
    try {
      setError(null);
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.count);
      return response.count;
    } catch (err) {
      setError(err.message || 'Erreur lors du comptage des messages non lus');
      throw err;
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