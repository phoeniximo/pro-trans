// backend/src/utils/AppError.js
/**
 * Classe d'erreur personnalisée pour l'API
 */
class AppError extends Error {
  /**
   * Créer une nouvelle erreur d'application
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code HTTP d'erreur
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;