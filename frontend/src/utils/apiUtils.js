import apiClient from '../api/client';

/**
 * Envoie une requête API avec gestion d'erreurs
 * @param {Object} config - Configuration de la requête
 * @returns {Promise} Résultat de la requête
 */
export const apiRequest = async (config) => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue';
    throw new Error(errorMessage);
  }
};

/**
 * Récupère des données depuis l'API
 * @param {string} url - URL de la requête
 * @param {Object} params - Paramètres de la requête
 * @returns {Promise} Données de la réponse
 */
export const fetchData = async (url, params = {}) => {
  return apiRequest({
    method: 'GET',
    url,
    params
  });
};

/**
 * Envoie des données à l'API
 * @param {string} url - URL de la requête
 * @param {Object} data - Données à envoyer
 * @returns {Promise} Données de la réponse
 */
export const postData = async (url, data = {}) => {
  return apiRequest({
    method: 'POST',
    url,
    data
  });
};

/**
 * Met à jour des données via l'API
 * @param {string} url - URL de la requête
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise} Données de la réponse
 */
export const updateData = async (url, data = {}) => {
  return apiRequest({
    method: 'PUT',
    url,
    data
  });
};

/**
 * Met à jour partiellement des données via l'API
 * @param {string} url - URL de la requête
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise} Données de la réponse
 */
export const patchData = async (url, data = {}) => {
  return apiRequest({
    method: 'PATCH',
    url,
    data
  });
};

/**
 * Supprime des données via l'API
 * @param {string} url - URL de la requête
 * @returns {Promise} Données de la réponse
 */
export const deleteData = async (url) => {
  return apiRequest({
    method: 'DELETE',
    url
  });
};

/**
 * Gère les téléchargements de fichiers
 * @param {string} url - URL de téléchargement
 * @param {Object} params - Paramètres de la requête
 * @returns {Promise<Blob>} Blob du fichier
 */
export const downloadFile = async (url, params = {}) => {
  try {
    const response = await apiClient({
      method: 'GET',
      url,
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    const errorMessage = 'Erreur lors du téléchargement du fichier';
    throw new Error(errorMessage);
  }
};

/**
 * Télécharge un fichier et le propose au téléchargement
 * @param {string} url - URL de téléchargement
 * @param {string} filename - Nom du fichier
 * @param {Object} params - Paramètres de la requête
 */
export const downloadAndSaveFile = async (url, filename, params = {}) => {
  try {
    const blob = await downloadFile(url, params);
    
    // Créer un lien de téléchargement
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    
    // Nettoyer
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    throw error;
  }
};