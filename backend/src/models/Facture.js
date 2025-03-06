// backend/src/models/Facture.js
const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transporteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce',
    required: true
  },
  devis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devis',
    required: true
  },
  paiement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paiement',
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  montantHT: {
    type: Number,
    required: true
  },
  montantTVA: {
    type: Number,
    required: true
  },
  montantTTC: {
    type: Number,
    required: true
  },
  tauxTVA: {
    type: Number,
    default: 20
  },
  dateEmission: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['emise', 'payee', 'annulee'],
    default: 'emise'
  },
  fichierPDF: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Facture', factureSchema);