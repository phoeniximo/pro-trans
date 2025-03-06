// frontend/src/utils/validators.js
/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si l'email est valide
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 * @param {string} telephone - Numéro de téléphone
 * @returns {boolean} - True si le numéro est valide
 */
export const isValidPhoneNumber = (telephone) => {
  if (!telephone) return false;
  // Supprime les espaces et autres caractères non numériques
  const cleaned = telephone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  
  // Formats valides: 0XXXXXXXXX, +33XXXXXXXXX
  if (cleaned.startsWith('0') && cleaned.length === 10) return true;
  if (cleaned.startsWith('+33') && cleaned.length === 12) return true;
  
  return false;
};

/**
 * Valide un code postal français
 * @param {string} codePostal - Code postal
 * @returns {boolean} - True si le code postal est valide
 */
export const isValidPostalCode = (codePostal) => {
  if (!codePostal) return false;
  return /^\d{5}$/.test(codePostal);
};

/**
 * Valide un mot de passe selon les critères de sécurité
 * @param {string} password - Mot de passe
 * @returns {Object} - Résultat de validation avec messages d'erreur
 */
export const validatePassword = (password) => {
  const result = {
    isValid: true,
    errors: []
  };
  
  if (!password) {
    result.isValid = false;
    result.errors.push('Le mot de passe est requis');
    return result;
  }
  
  if (password.length < 8) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit comporter au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    result.isValid = false;
    result.errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return result;
};

/**
 * Valide une date future
 * @param {string|Date} date - Date à valider
 * @returns {boolean} - True si la date est dans le futur
 */
export const isValidFutureDate = (date) => {
  if (!date) return false;
  
  const dateToCheck = new Date(date);
  const now = new Date();
  
  // Ignorer les heures, minutes et secondes
  now.setHours(0, 0, 0, 0);
  dateToCheck.setHours(0, 0, 0, 0);
  
  return dateToCheck >= now;
};

/**
 * Valide un montant
 * @param {string|number} amount - Montant à valider
 * @returns {boolean} - True si le montant est valide
 */
export const isValidAmount = (amount) => {
  if (amount === null || amount === undefined || amount === '') return false;
  
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= 0;
};

/**
 * Valide un objet annonce
 * @param {Object} annonce - Annonce à valider
 * @returns {Object} - Résultat de validation avec erreurs
 */
export const validateAnnonce = (annonce) => {
  const errors = {};
  
  if (!annonce.titre || annonce.titre.trim() === '') {
    errors.titre = 'Le titre est obligatoire';
  } else if (annonce.titre.length > 100) {
    errors.titre = 'Le titre ne doit pas dépasser 100 caractères';
  }
  
  if (!annonce.description || annonce.description.trim() === '') {
    errors.description = 'La description est obligatoire';
  } else if (annonce.description.length < 20) {
    errors.description = 'La description doit comporter au moins 20 caractères';
  }
  
  if (!annonce.typeTransport) {
    errors.typeTransport = 'Le type de transport est obligatoire';
  }
  
  if (!annonce.villeDepart || annonce.villeDepart.trim() === '') {
    errors.villeDepart = 'La ville de départ est obligatoire';
  }
  
  if (!annonce.villeArrivee || annonce.villeArrivee.trim() === '') {
    errors.villeArrivee = 'La ville d\'arrivée est obligatoire';
  }
  
  if (!annonce.dateDepart) {
    errors.dateDepart = 'La date de départ est obligatoire';
  } else if (!isValidFutureDate(annonce.dateDepart)) {
    errors.dateDepart = 'La date de départ doit être dans le futur';
  }
  
  return errors;
};

/**
 * Valide un objet devis
 * @param {Object} devis - Devis à valider
 * @returns {Object} - Résultat de validation avec erreurs
 */
export const validateDevis = (devis) => {
  const errors = {};
  
  if (!devis.annonceId) {
    errors.annonceId = 'L\'annonce est obligatoire';
  }
  
  if (!isValidAmount(devis.montant)) {
    errors.montant = 'Le montant est obligatoire et doit être un nombre positif';
  }
  
  if (!devis.message || devis.message.trim() === '') {
    errors.message = 'Le message est obligatoire';
  } else if (devis.message.length < 20) {
    errors.message = 'Le message doit comporter au moins 20 caractères';
  }
  
  if (!devis.delaiLivraison) {
    errors.delaiLivraison = 'Le délai de livraison est obligatoire';
  } else if (!isValidFutureDate(devis.delaiLivraison)) {
    errors.delaiLivraison = 'Le délai de livraison doit être dans le futur';
  }
  
  return errors;
};

/**
 * Valide un objet avis
 * @param {Object} avis - Avis à valider
 * @returns {Object} - Résultat de validation avec erreurs
 */
export const validateAvis = (avis) => {
  const errors = {};
  
  if (!avis.note || avis.note < 1 || avis.note > 5) {
    errors.note = 'La note est obligatoire et doit être comprise entre 1 et 5';
  }
  
  if (!avis.commentaire || avis.commentaire.trim() === '') {
    errors.commentaire = 'Le commentaire est obligatoire';
  } else if (avis.commentaire.length < 10) {
    errors.commentaire = 'Le commentaire doit comporter au moins 10 caractères';
  }
  
  if (!avis.destinataireId) {
    errors.destinataireId = 'Le destinataire est obligatoire';
  }
  
  if (!avis.annonceId) {
    errors.annonceId = 'L\'annonce est obligatoire';
  }
  
  return errors;
};