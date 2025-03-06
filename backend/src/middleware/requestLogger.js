// backend/src/middleware/requestLogger.js
const logger = require('../utils/logger');

/**
 * Middleware pour enregistrer les requêtes HTTP
 */
const requestLogger = (req, res, next) => {
  const startTime = new Date();
  
  // Enregistrer la requête entrante
  logger.http(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    body: req.method === 'POST' || req.method === 'PUT' ? '...' : undefined
  });
  
  // Intercepter la fin de la réponse pour enregistrer les détails
  res.on('finish', () => {
    const duration = new Date() - startTime;
    logger.http(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
};

module.exports = requestLogger;