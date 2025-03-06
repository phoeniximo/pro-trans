// backend/src/middleware/validate.js
const AppError = require('../utils/AppError');

/**
 * Middleware pour valider les données d'une requête
 * @param {Function} schema - Fonction de validation qui retourne un objet avec les erreurs
 * @param {string} source - Source des données à valider ('body', 'params', 'query')
 * @returns {Function} - Middleware Express
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error } = schema.validate(data, { abortEarly: false });

    if (!error) {
      return next();
    }

    const errors = error.details.map(err => ({
      field: err.path.join('.'),
      message: err.message.replace(/"/g, '')
    }));

    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors
    });
  };
};

/**
 * Middleware pour valider les paramètres de route
 * @param {Function} schema - Fonction de validation
 * @returns {Function} - Middleware Express
 */
const validateParams = schema => validate(schema, 'params');

/**
 * Middleware pour valider le corps de la requête
 * @param {Function} schema - Fonction de validation
 * @returns {Function} - Middleware Express
 */
const validateBody = schema => validate(schema, 'body');

/**
 * Middleware pour valider les paramètres de requête
 * @param {Function} schema - Fonction de validation
 * @returns {Function} - Middleware Express
 */
const validateQuery = schema => validate(schema, 'query');

module.exports = {
  validate,
  validateParams,
  validateBody,
  validateQuery
};