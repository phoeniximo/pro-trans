// backend/src/models/Avis.js
const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  note: {
    type: Number,
    required: [true, 'La note est obligatoire'],
    min: [1, 'La note minimum est 1'],
    max: [5, 'La note maximum est 5']
  },
  commentaire: {
    type: String,
    required: [true, 'Le commentaire est obligatoire'],
    minlength: [10, 'Minimum 10 caractères']
  },
  auteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce',
    required: true
  },
  transportEffectue: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Empêcher un utilisateur de s'auto-évaluer
avisSchema.pre('save', function(next) {
  if (this.auteur.toString() === this.destinataire.toString()) {
    const error = new Error('Vous ne pouvez pas vous auto-évaluer');
    return next(error);
  }
  next();
});

// Empêcher un utilisateur de donner plusieurs avis pour la même annonce
avisSchema.index({ auteur: 1, annonce: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);