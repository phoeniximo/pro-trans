// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de protection des routes nécessitant une authentification
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1. Vérifier si un token est présent dans les headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.'
      });
    }
    
    // 2. Vérifier si le token est valide
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_temporaire');
    
    // 3. Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'L\'utilisateur associé à ce token n\'existe plus.'
      });
    }
    
    // 4. Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
    // (à implémenter si vous ajoutez cette fonctionnalité)
    
    // 5. Accorder l'accès à la route protégée
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide. Veuillez vous reconnecter.'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Votre session a expiré. Veuillez vous reconnecter.'
      });
    }
    
    console.error('Erreur d\'authentification:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'authentification',
      error: err.message
    });
  }
};

// Middleware pour restreindre l'accès aux rôles spécifiques
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission d\'effectuer cette action'
      });
    }
    
    next();
  };
};

// Pour compatibilité avec l'ancien middleware
module.exports = {
  protect: exports.protect,
  restrictTo: exports.restrictTo
};