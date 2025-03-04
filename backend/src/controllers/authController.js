// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

// Génération de JWT
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'votre_secret_jwt_temporaire',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

// Réponse avec token et informations utilisateur
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Supprimer le mot de passe de la sortie
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, telephone, role } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Création de l'utilisateur (le hachage du mot de passe est géré par le middleware du modèle)
    const newUser = await User.create({
      nom,
      prenom,
      email,
      password,
      telephone,
      role
    });

    // Générer un token de vérification d'email (à implémenter dans le futur)
    const emailToken = crypto.randomBytes(32).toString('hex');
    newUser.emailVerificationToken = crypto
      .createHash('sha256')
      .update(emailToken)
      .digest('hex');
    newUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
    
    await newUser.save();

    // Envoi d'email de vérification (à implémenter)
    // await sendVerificationEmail(newUser.email, emailToken);

    // Créer et envoyer le token JWT
    createAndSendToken(newUser, 201, res);
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err);
    
    // Erreur de validation mongoose
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: err.message
    });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Vérifier si l'utilisateur existe et si le mot de passe est correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    user.derniereConnexion = Date.now();
    await user.save({ validateBeforeSave: false });

    // Créer et envoyer le token JWT
    createAndSendToken(user, 200, res);
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: err.message
    });
  }
};

// @desc    Envoyer un email de réinitialisation de mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    // 1. Récupérer l'utilisateur par email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    // 2. Générer un token de réinitialisation
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Envoyer par email (à implémenter)
    try {
      // await sendPasswordResetEmail(user.email, resetToken);
      
      res.status(200).json({
        success: true,
        message: 'Token de réinitialisation envoyé par email',
        // En développement, renvoyer le token pour faciliter les tests
        ...(process.env.NODE_ENV === 'development' && { resetToken })
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de réinitialisation',
        error: err.message
      });
    }
  } catch (err) {
    console.error('Erreur lors de la demande de réinitialisation de mot de passe:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation de mot de passe',
      error: err.message
    });
  }
};

// @desc    Réinitialiser le mot de passe
// @route   PATCH /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // 1. Hacher le token de réinitialisation
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Trouver l'utilisateur avec ce token et vérifier qu'il n'a pas expiré
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // 3. Vérifier que les 2 mots de passe correspondent
    if (req.body.password !== req.body.passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Les mots de passe ne correspondent pas'
      });
    }

    // 4. Mettre à jour le mot de passe et supprimer les champs de réinitialisation
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 5. Connecter l'utilisateur
    createAndSendToken(user, 200, res);
  } catch (err) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: err.message
    });
  }
};

// @desc    Vérifier l'email de l'utilisateur
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    // 1. Hacher le token de vérification d'email
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Trouver l'utilisateur avec ce token et vérifier qu'il n'a pas expiré
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // 3. Marquer l'email comme vérifié et supprimer les champs de vérification
    user.emailVerifie = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Email vérifié avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'email:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'email',
      error: err.message
    });
  }
};

// @desc    Obtenir l'utilisateur actuellement connecté
// @route   GET /api/auth/me
// @access  Privé
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du profil:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: err.message
    });
  }
};