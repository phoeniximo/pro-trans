import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Création du contexte de notifications
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Affiche une notification de succès
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showSuccess = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    
    toast.success(message, {
      duration: 5000,
      ...options
    });
    
    const newNotification = { id, type: 'success', message, date: new Date() };
    setNotifications(prev => [...prev, newNotification]);
    
    return newNotification;
  }, []);

  /**
   * Affiche une notification d'erreur
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showError = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    
    toast.error(message, {
      duration: 5000,
      ...options
    });
    
    const newNotification = { id, type: 'error', message, date: new Date() };
    setNotifications(prev => [...prev, newNotification]);
    
    return newNotification;
  }, []);

  /**
   * Affiche une notification d'information
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showInfo = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    
    toast(message, {
      duration: 5000,
      icon: '📝',
      ...options
    });
    
    const newNotification = { id, type: 'info', message, date: new Date() };
    setNotifications(prev => [...prev, newNotification]);
    
    return newNotification;
  }, []);

  /**
   * Affiche une notification d'avertissement
   * @param {string} message - Message à afficher
   * @param {Object} options - Options supplémentaires pour la notification
   */
  const showWarning = useCallback((message, options = {}) => {
    const id = Date.now().toString();
    
    toast(message, {
      duration: 5000,
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
      ...options
    });
    
    const newNotification = { id, type: 'warning', message, date: new Date() };
    setNotifications(prev => [...prev, newNotification]);
    
    return newNotification;
  }, []);

  /**
   * Affiche une notification de chargement
   * @param {string} message - Message à afficher
   * @returns {Object} Contrôleur de la notification
   */
  const showLoading = useCallback((message) => {
    const id = toast.loading(message);
    
    const newNotification = { id, type: 'loading', message, date: new Date() };
    setNotifications(prev => [...prev, newNotification]);
    
    // Retourne un contrôleur pour la notification
    return {
      dismiss: () => {
        toast.dismiss(id);
        setNotifications(prev => prev.filter(n => n.id !== id));
      },
      update: (newMessage) => {
        toast.loading(newMessage, { id });
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, message: newMessage } : n)
        );
      },
      success: (successMessage) => {
        toast.success(successMessage, { id });
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, type: 'success', message: successMessage } : n)
        );
      },
      error: (errorMessage) => {
        toast.error(errorMessage, { id });
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, type: 'error', message: errorMessage } : n)
        );
      }
    };
  }, []);

  /**
   * Supprime une notification
   * @param {string} id - ID de la notification à supprimer
   */
  const dismissNotification = useCallback((id) => {
    toast.dismiss(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Supprime toutes les notifications
   */
  const dismissAll = useCallback(() => {
    toast.dismiss();
    setNotifications([]);
  }, []);

  // Nettoyer les anciennes notifications (plus de 24h)
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      setNotifications(prev => prev.filter(n => new Date(n.date) > twentyFourHoursAgo));
    }, 3600000); // Nettoyage toutes les heures
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Valeurs fournies par le contexte
  const value = {
    notifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismissNotification,
    dismissAll
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationProvider;