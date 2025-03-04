import { useState, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * Hook personnalisé pour effectuer des requêtes HTTP
 * @returns {Object} Fonctions et états pour gérer les requêtes HTTP
 */
export const useHttp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Fonction pour effectuer une requête HTTP
   * @param {string} url - URL de la requête
   * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
   * @param {Object} body - Corps de la requête (pour POST et PUT)
   * @param {Object} params - Paramètres de requête
   * @param {Object} headers - En-têtes personnalisés
   * @returns {Promise} - Promesse avec les données de la réponse
   */
  const sendRequest = useCallback(async ({ 
    url, 
    method = 'GET', 
    body = null, 
    params = {}, 
    headers = {} 
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method,
        url,
        headers,
        params
      };
      
      // Ajouter le corps de la requête pour les méthodes POST, PUT et PATCH
      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        // Si body est un FormData, ne pas définir Content-Type (le navigateur le fait)
        if (body instanceof FormData) {
          config.data = body;
        } else {
          config.data = body;
          config.headers = {
            'Content-Type': 'application/json',
            ...headers
          };
        }
      }
      
      const response = await apiClient(config);
      setData(response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      
      // Extraire le message d'erreur de la réponse API
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Une erreur s\'est produite';
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Fonction pour réinitialiser l'état
  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    sendRequest,
    resetState
  };
};