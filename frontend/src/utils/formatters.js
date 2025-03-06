// frontend/src/utils/formatters.js
import { format, parseISO, formatDistance, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formatage de date au format français
 * @param {string|Date} date - Date à formater
 * @param {string} formatStr - Format de date (ex: 'dd/MM/yyyy')
 * @returns {string} - Date formatée
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return '';
  }
};

/**
 * Convertit une date en formulation relative (ex: "il y a 2 jours")
 * @param {string|Date} date - Date à convertir
 * @param {Object} options - Options supplémentaires
 * @returns {string} - Date relative
 */
export const formatRelativeDate = (date, options = {}) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: fr,
      ...options
    });
  } catch (error) {
    console.error('Erreur de formatage de date relative:', error);
    return '';
  }
};

/**
 * Formate un montant en euros
 * @param {number} amount - Montant à formater
 * @param {Object} options - Options de formatage
 * @returns {string} - Montant formaté
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === undefined || amount === null) return '';
  
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  });
  
  return formatter.format(amount);
};

/**
 * Tronque un texte à une certaine longueur en ajoutant "..." si nécessaire
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} - Texte tronqué
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Formate un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone
 * @returns {string} - Numéro formaté
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Nettoyer le numéro (garder uniquement les chiffres)
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Format français: XX XX XX XX XX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  // Si le format n'est pas reconnu, retourner tel quel
  return phone;
};

/**
 * Formate une distance en kilomètres
 * @param {number} distance - Distance en kilomètres
 * @returns {string} - Distance formatée
 */
export const formatDistance = (distance) => {
  if (distance === undefined || distance === null) return '';
  
  if (distance < 1) {
    // Convertir en mètres
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  }
  
  if (distance >= 1000) {
    // Formater avec une décimale pour les grandes distances
    return `${(distance / 1000).toFixed(1)} km`;
  }
  
  // Formater avec une décimale pour les kilomètres
  return `${distance.toFixed(1)} km`;
};

/**
 * Formate un nom complet
 * @param {Object} user - Utilisateur
 * @param {string} user.nom - Nom
 * @param {string} user.prenom - Prénom
 * @returns {string} - Nom complet
 */
export const formatFullName = (user) => {
  if (!user) return '';
  
  const { nom, prenom } = user;
  if (!nom && !prenom) return '';
  
  if (!nom) return prenom;
  if (!prenom) return nom;
  
  return `${prenom} ${nom}`;
};