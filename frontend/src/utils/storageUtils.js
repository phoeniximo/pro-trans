/**
 * Enregistre une valeur dans le localStorage
 * @param {string} key - Clé de stockage
 * @param {any} value - Valeur à stocker
 */
export const setLocalStorage = (key, value) => {
  try {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement dans localStorage (${key}):`, error);
  }
};

/**
 * Récupère une valeur depuis le localStorage
 * @param {string} key - Clé à récupérer
 * @param {any} defaultValue - Valeur par défaut si la clé n'existe pas
 * @returns {any} - Valeur récupérée ou valeur par défaut
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    
    // Essayer de parser comme JSON, sinon retourner la valeur brute
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération depuis localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Supprime une valeur du localStorage
 * @param {string} key - Clé à supprimer
 */
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression depuis localStorage (${key}):`, error);
  }
};

/**
 * Vide le localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les données localStorage:', error);
  }
};

/**
 * Enregistre une valeur dans le sessionStorage
 * @param {string} key - Clé de stockage
 * @param {any} value - Valeur à stocker
 */
export const setSessionStorage = (key, value) => {
  try {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement dans sessionStorage (${key}):`, error);
  }
};

/**
 * Récupère une valeur depuis le sessionStorage
 * @param {string} key - Clé à récupérer
 * @param {any} defaultValue - Valeur par défaut si la clé n'existe pas
 * @returns {any} - Valeur récupérée ou valeur par défaut
 */
export const getSessionStorage = (key, defaultValue = null) => {
  try {
    const value = sessionStorage.getItem(key);
    if (value === null) return defaultValue;
    
    // Essayer de parser comme JSON, sinon retourner la valeur brute
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération depuis sessionStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Supprime une valeur du sessionStorage
 * @param {string} key - Clé à supprimer
 */
export const removeSessionStorage = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression depuis sessionStorage (${key}):`, error);
  }
};

/**
 * Vide le sessionStorage
 */
export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les données sessionStorage:', error);
  }
};