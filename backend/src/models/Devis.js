// backend/src/models/Devis.js
const mongoose = require('mongoose');

const devisSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: [true, 'Un message explicatif est obligatoire'],
    minlength: [20, 'Minimum 20 caractères']
  },
  delaiLivraison: {
    type: Date,
    required: [true, 'Le délai de livraison est obligatoire']
  },
  statut: {
    type: String,
    enum: ['en_attente', 'accepte', 'refuse', 'annule'],
    default: 'en_attente'
  },
  dateAcceptation: {
    type: Date
  }
}, {
  timestamps: true
});

// Empêcher un transporteur de faire plusieurs devis sur la même annonce
devisSchema.index({ transporteur: 1, annonce: 1 }, { unique: true });

// Middleware pour vérifier que l'utilisateur est bien un transporteur
devisSchema.pre('save', async function(next) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(this.transporteur);
    
    if (!user || user.role !== 'transporteur') {
      return next(new Error('Seuls les transporteurs peuvent proposer des devis'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Devis', devisSchema);