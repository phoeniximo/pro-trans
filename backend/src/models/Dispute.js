// backend/src/models/Dispute.js
const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Annonce',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transporteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titre: {
    type: String,
    required: [true, 'Le titre du litige est obligatoire']
  },
  description: {
    type: String,
    required: [true, 'La description du litige est obligatoire']
  },
  statut: {
    type: String,
    enum: ['ouvert', 'en_cours', 'resolu', 'annule'],
    default: 'ouvert'
  },
  typeProbleme: {
    type: String,
    enum: ['retard', 'objet_endommage', 'objet_manquant', 'annulation', 'non_livraison', 'autre'],
    required: true
  },
  montantReclame: {
    type: Number,
    default: 0
  },
  photos: [{
    type: String
  }],
  documents: [{
    type: String
  }],
  messages: [{
    expediteur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    fichiers: [{
      type: String
    }]
  }],
  decisionAdmin: {
    decision: {
      type: String,
      enum: ['remboursement_total', 'remboursement_partiel', 'aucun_remboursement', 'autre'],
    },
    montantRemboursement: {
      type: Number,
      default: 0
    },
    justification: {
      type: String
    },
    date: {
      type: Date
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  dateResolution: {
    type: Date
  }
}, {
  timestamps: true
});

// Méthode pour marquer comme résolu
disputeSchema.methods.resolve = async function(adminId, decision, montant, justification) {
  this.statut = 'resolu';
  this.dateResolution = new Date();
  this.decisionAdmin = {
    decision,
    montantRemboursement: montant || 0,
    justification,
    date: new Date(),
    admin: adminId
  };
  
  return this.save();
};

module.exports = mongoose.model('Dispute', disputeSchema);