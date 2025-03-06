// backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err.stack);

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation',
      errors: messages
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide. Veuillez vous reconnecter.'
    });
  }

  // Erreurs d'expiration JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Votre session a expiré. Veuillez vous reconnecter.'
    });
  }

  // Erreurs de doublon MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `La valeur du champ '${field}' existe déjà`
    });
  }

  // Erreurs personnalisées avec statut HTTP
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Erreur par défaut
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue sur le serveur'
  });
};

module.exports = errorHandler;