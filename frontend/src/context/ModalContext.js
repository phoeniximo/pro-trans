import React, { createContext, useState, useCallback } from 'react';

// Création du contexte pour les modales
export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  // État pour stocker les modales ouvertes
  const [modals, setModals] = useState({});

  /**
   * Ouvre une modale avec des données optionnelles
   * @param {string} id - Identifiant unique de la modale
   * @param {Object} data - Données à passer à la modale
   */
  const openModal = useCallback((id, data = {}) => {
    setModals(prev => ({
      ...prev,
      [id]: { isOpen: true, data }
    }));
  }, []);

  /**
   * Ferme une modale
   * @param {string} id - Identifiant unique de la modale
   */
  const closeModal = useCallback((id) => {
    setModals(prev => ({
      ...prev,
      [id]: { isOpen: false, data: prev[id]?.data || {} }
    }));
  }, []);

  /**
   * Met à jour les données d'une modale
   * @param {string} id - Identifiant unique de la modale
   * @param {Object} data - Nouvelles données
   */
  const updateModalData = useCallback((id, data) => {
    setModals(prev => ({
      ...prev,
      [id]: { 
        isOpen: prev[id]?.isOpen || false, 
        data: { ...prev[id]?.data, ...data } 
      }
    }));
  }, []);

  /**
   * Vérifie si une modale est ouverte
   * @param {string} id - Identifiant unique de la modale
   * @returns {boolean} - True si la modale est ouverte
   */
  const isModalOpen = useCallback((id) => {
    return !!modals[id]?.isOpen;
  }, [modals]);

  /**
   * Récupère les données d'une modale
   * @param {string} id - Identifiant unique de la modale
   * @returns {Object} - Données de la modale
   */
  const getModalData = useCallback((id) => {
    return modals[id]?.data || {};
  }, [modals]);

  // Valeurs fournies par le contexte
  const value = {
    openModal,
    closeModal,
    updateModalData,
    isModalOpen,
    getModalData
  };

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export default ModalProvider;