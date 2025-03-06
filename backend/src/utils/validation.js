// backend/src/utils/validation.js
/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 * @param {string} telephone - Numéro de téléphone à valider
 * @returns {boolean} True si le numéro est valide
 */
const isValidPhoneNumber = (telephone) => {
  const phoneRegex = /^(\+212|0)[1-9](\d{2}){4}$/;
  return phoneRegex.test(telephone.replace(/\s/g, ''));
};

/**
 * Valide un code postal français
 * @param {string} codePostal - Code postal à valider
 * @returns {boolean} True si le code postal est valide
 */
const isValidPostalCode = (codePostal) => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(codePostal);
};

/**
 * Valide une date future
 * @param {Date} date - Date à valider
 * @returns {boolean} True si la date est dans le futur
 */
const isFutureDate = (date) => {
  const currentDate = new Date();
  const compareDate = new Date(date);
  return compareDate > currentDate;
};

/**
 * Sanitize les entrées utilisateur pour éviter les injections
 * @param {string} input - Entrée à sanitizer
 * @returns {string} Entrée sanitizée
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return input.replace(/[<>]/g, '');
};

module.exports = {
  isValidEmail,
  isValidPhoneNumber,
  isValidPostalCode,
  isFutureDate,
  sanitizeInput
};