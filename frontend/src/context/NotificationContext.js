import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import { useAuth } from '../hooks/useAuth';

// Création du contexte de notifications
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * Récupère les notifications depuis l'API
   */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications');
      
      if (response.data && response.data.data) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.data.filter(notif => !notif.read).length);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Marque une notification comme lue
   * @param {string} notificationId - ID de la notification
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      // Mettre à jour le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  }, []);

  /**
   * Marque toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put('/notifications/read-all');
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  }, []);

  /**
   * Affiche une notification de succès
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showSuccess = useCallback((message, options = {}) => {
    toast.success(message, {
      duration: 5000,
      ...options
    });
  }, []);

  /**
   * Affiche une notification d'erreur
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showError = useCallback((message, options = {}) => {
    toast.error(message, {
      duration: 5000,
      ...options
    });
  }, []);

  /**
   * Affiche une notification d'information
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showInfo = useCallback((message, options = {}) => {
    toast(message, {
      duration: 5000,
      icon: '📝',
      ...options
    });
  }, []);

  /**
   * Affiche une notification d'avertissement
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showWarning = useCallback((message, options = {}) => {
    toast(message, {
      duration: 5000,
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
      ...options
    });
  }, []);

  /**
   * Affiche une notification de chargement
   * @param {string} message - Message à afficher
   * @returns {Object} Contrôleur de la notification
   */
  const showLoading = useCallback((message) => {
    const id = toast.loading(message);
    
    // Retourne un contrôleur pour la notification
    return {
      dismiss: () => {
        toast.dismiss(id);
      },
      update: (newMessage) => {
        toast.loading(newMessage, { id });
      },
      success: (successMessage) => {
        toast.success(successMessage, { id });
      },
      error: (errorMessage) => {
        toast.error(errorMessage, { id });
      }
    };
  }, []);
  
  /**
   * Affiche une notification en toast
   * @param {Object} notification - La notification à afficher
   */
  const showNotification = useCallback((notification) => {
    if (!notification) return;
    
    toast(
      ({ id }) => (
        <div className="flex items-start" onClick={() => markAsRead(notification._id)}>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
          </div>
        </div>
      ),
      {
        duration: 5000,
        icon: getNotificationIcon(notification.type),
      }
    );
  }, [markAsRead]);

  /**
   * Obtient l'icône appropriée selon le type de notification
   * @param {string} type - Type de notification
   * @returns {string} Emoji correspondant au type
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'annonce':
        return '📦';
      case 'devis':
        return '💼';
      case 'message':
        return '✉️';
      case 'avis':
        return '⭐';
      default:
        return '🔔';
    }
  };

  // Rafraîchir les notifications périodiquement
  useEffect(() => {
    // Charger les notifications au démarrage
    if (user) {
      fetchNotifications();
    }

    // Rafraîchir toutes les 30 secondes
    const intervalId = setInterval(() => {
      if (user) fetchNotifications();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, fetchNotifications]);

  // Valeurs fournies par le contexte
  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    showNotification
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;