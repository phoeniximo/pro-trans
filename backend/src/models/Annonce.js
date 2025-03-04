// backend/src/models/Annonce.js
const mongoose = require('mongoose');

const annonceSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    maxlength: [100, 'Maximum 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    minlength: [20, 'Minimum 20 caractères']
  },
  typeTransport: {
    type: String,
    enum: ['meuble', 'marchandise', 'bagage', 'palette', 'demenagement'],
    required: [true, 'Le type de transport est obligatoire']
  },
  villeDepart: {
    type: String,
    required: [true, 'La ville de départ est obligatoire']
  },
  villeArrivee: {
    type: String,
    required: [true, 'La ville d\'arrivée est obligatoire']
  },
  dateDepart: {
    type: Date,
    required: [true, 'La date de départ est obligatoire']
  },
  poids: {
    type: Number,
    required: false
  },
  volume: {
    type: Number,
    required: false
  },
  budget: {
    type: Number,
    required: false
  },
  photos: [{
    type: String
  }],
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    enum: ['disponible', 'en_cours', 'termine'],
    default: 'disponible'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals pour les devis associés
annonceSchema.virtual('devis', {
  ref: 'Devis',
  localField: '_id',
  foreignField: 'annonce'
});

module.exports = mongoose.model('Annonce', annonceSchema);