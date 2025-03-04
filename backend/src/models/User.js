// backend/src/models/User.js
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  prenom: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Minimum 6 caractères'],
    select: false
  },
  telephone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v);
      },
      message: props => `${props.value} n'est pas un numéro de téléphone valide!`
    }
  },
  role: {
    type: String,
    enum: ['client', 'transporteur', 'admin'],
    default: 'client'
  },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  documents: {
    identite: String,
    assurance: String,
    vehicule: String
  },
  vehicules: [{
    type: {
      type: String,
      enum: ['voiture', 'utilitaire', 'camion', 'poids_lourd']
    },
    capacite: Number,
    immatriculation: String
  }],
  notation: {
    moyenne: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    nombreAvis: {
      type: Number,
      default: 0
    }
  },
  emailVerifie: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  actif: {
    type: Boolean,
    default: true
  },
  derniereConnexion: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals pour les annonces et avis
userSchema.virtual('annonces', {
  ref: 'Annonce',
  localField: '_id',
  foreignField: 'utilisateur'
});

userSchema.virtual('avisRecus', {
  ref: 'Avis',
  localField: '_id',
  foreignField: 'destinataire'
});

userSchema.virtual('avisDonnes', {
  ref: 'Avis',
  localField: '_id',
  foreignField: 'auteur'
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un token de réinitialisation de mot de passe
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Middleware pour hacher le mot de passe avant la sauvegarde
userSchema.pre('save', async function(next) {
  // Ne pas réhacher le mot de passe s'il n'a pas été modifié
  if (!this.isModified('password')) return next();
  
  try {
    // Hacher le mot de passe avec un coût de 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware pour mettre à jour la date de dernière connexion
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.derniereConnexion = Date.now();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);