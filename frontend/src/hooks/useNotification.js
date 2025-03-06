import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook personnalisé pour gérer les notifications
 * @returns {Object} Fonctions pour afficher différents types de notifications
 */
export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Affiche une notification de succès
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showSuccess = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    toast.success(message, options);
    setNotifications(prev => [...prev, { id, type: 'success', message }]);
    return id;
  }, []);

  /**
   * Affiche une notification d'erreur
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showError = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    toast.error(message, options);
    setNotifications(prev => [...prev, { id, type: 'error', message }]);
    return id;
  }, []);

  /**
   * Affiche une notification d'information
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showInfo = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    toast(message, {
      ...options,
      icon: '📝',
    });
    setNotifications(prev => [...prev, { id, type: 'info', message }]);
    return id;
  }, []);

  /**
   * Affiche une notification d'avertissement
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showWarning = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    toast(message, {
      ...options,
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
    });
    setNotifications(prev => [...prev, { id, type: 'warning', message }]);
    return id;
  }, []);

  /**
   * Affiche une notification de chargement
   * @param {string} message - Message à afficher
   * @returns {Function} Fonction pour mettre à jour la notification
   */
  const showLoading = useCallback((message) => {
    const id = toast.loading(message);
    setNotifications(prev => [...prev, { id, type: 'loading', message }]);
    
    // Retourne une fonction pour mettre à jour la notification
    return {
      updateMessage: (newMessage) => {
        toast.loading(newMessage, { id });
      },
      success: (successMessage) => {
        toast.success(successMessage, { id });
      },
      error: (errorMessage) => {
        toast.error(errorMessage, { id });
      },
      dismiss: () => {
        toast.dismiss(id);
      }
    };
  }, []);

  /**
   * Supprime une notification par son ID
   * @param {string} id - ID de la notification à supprimer
   */
  const dismissNotification = useCallback((id) => {
    toast.dismiss(id);
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  /**
   * Supprime toutes les notifications
   */
  const dismissAll = useCallback(() => {
    toast.dismiss();
    setNotifications([]);
  }, []);

  return {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismissNotification,
    dismissAll,
  };
};