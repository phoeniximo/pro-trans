// backend/src/models/Paiement.js
const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  devis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devis',
    required: true
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce',
    required: true
  },
  transporteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  montant: {
    type: Number,
    required: [true, 'Le montant est obligatoire']
  },
  methode: {
    type: String,
    enum: ['carte', 'virement', 'paypal', 'especes', 'autre'],
    default: 'carte'
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'paye', 'rembourse', 'echec', 'annule'],
    default: 'en_attente'
  },
  paiementId: {
    type: String
  },
  paiementMethode: {
    type: String
  },
  dateTransaction: {
    type: Date,
    default: Date.now
  },
  detailsEchec: {
    code: String,
    message: String,
    date: Date
  },
  notesAdmin: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Paiement', paiementSchema);