import { format, parseISO, formatDistanceToNow, addDays, isAfter, isBefore, isEqual } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date selon le format spécifié
 * @param {Date|string} date - Date à formater
 * @param {string} formatStr - Format de date (défaut: dd/MM/yyyy)
 * @param {Object} options - Options additionnelles pour format
 * @returns {string} Date formatée
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy', options = {}) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: fr, ...options });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return '';
  }
};

/**
 * Calcule la différence relative entre une date et maintenant
 * @param {Date|string} date - Date à comparer
 * @param {Object} options - Options additionnelles
 * @returns {string} Différence relative (ex: "il y a 2 jours")
 */
export const timeAgo = (date, options = {}) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: fr,
      ...options 
    });
  } catch (error) {
    console.error('Erreur de calcul de temps relatif:', error);
    return '';
  }
};

/**
 * Vérifie si une date est dans le futur
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} true si la date est dans le futur
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isAfter(dateObj, new Date());
  } catch (error) {
    console.error('Erreur de vérification de date future:', error);
    return false;
  }
};

/**
 * Ajoute un nombre de jours à une date
 * @param {Date|string} date - Date de base
 * @param {number} days - Nombre de jours à ajouter
 * @returns {Date} Nouvelle date
 */
export const addDaysToDate = (date, days) => {
  if (!date) return new Date();
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return addDays(dateObj, days);
  } catch (error) {
    console.error('Erreur d\'ajout de jours à une date:', error);
    return new Date();
  }
};

/**
 * Compare deux dates (égalité)
 * @param {Date|string} date1 - Première date
 * @param {Date|string} date2 - Deuxième date
 * @returns {boolean} true si les dates sont égales
 */
export const areDatesEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  try {
    const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return isEqual(dateObj1, dateObj2);
  } catch (error) {
    console.error('Erreur de comparaison de dates:', error);
    return false;
  }
};

/**
 * Convertit une chaîne de date en objet Date
 * @param {string} dateStr - Chaîne de date à convertir
 * @returns {Date|null} Objet Date ou null en cas d'erreur
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    return parseISO(dateStr);
  } catch (error) {
    console.error('Erreur de conversion de chaîne en date:', error);
    return null;
  }
};

/**
 * Calcule la différence en jours entre deux dates
 * @param {Date|string} startDate - Date de début
 * @param {Date|string} endDate - Date de fin
 * @returns {number} Différence en jours
 */
export const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    // Différence en millisecondes
    const diffTime = Math.abs(end.getTime() - start.getTime());
    // Conversion en jours
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Erreur de calcul de jours entre dates:', error);
    return 0;
  }
};