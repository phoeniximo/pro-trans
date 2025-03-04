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
    enum: ['en_attente', 'accepte', 'refuse', 'annule', 'expire', 'en_cours', 'termine'],
    default: 'en_attente'
  },
  dateAcceptation: {
    type: Date
  },
  detailTarifs: {
    prixTransport: { type: Number, default: 0 },
    fraisChargement: { type: Number, default: 0 },
    fraisDechargement: { type: Number, default: 0 },
    fraisMontage: { type: Number, default: 0 },
    fraisDemontage: { type: Number, default: 0 },
    fraisEmballage: { type: Number, default: 0 },
    fraisAssurance: { type: Number, default: 0 },
    fraisUrgence: { type: Number, default: 0 },
    autresFrais: { type: Number, default: 0 },
    remise: { type: Number, default: 0 }
  },
  descriptionAutresFrais: {
    type: String
  },
  dureeTransport: {
    type: Number, // Durée en heures
    default: 0
  },
  vehiculeUtilise: {
    type: {
      type: String,
      enum: ['voiture', 'utilitaire', 'camion', 'poids_lourd', 'autre']
    },
    description: String
  },
  disponibilites: [{
    date: Date,
    heureDebut: String,
    heureFin: String
  }],
  options: {
    assuranceIncluse: { type: Boolean, default: false },
    montantAssurance: { type: Number, default: 0 },
    suiviGPS: { type: Boolean, default: false },
    garantiePonctualite: { type: Boolean, default: false }
  },
  conditionsPaiement: {
    acompte: { type: Number, default: 0 },
    pourcentageAcompte: { type: Number, default: 0 },
    paiementIntegral: { type: Boolean, default: false },
    modePaiement: {
      type: String,
      enum: ['carte', 'virement', 'paypal', 'especes', 'cheque', 'autre'],
      default: 'carte'
    }
  },
  validiteDevis: {
    type: Date,
    default: function() {
      // Par défaut, le devis est valide 7 jours
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }
  },
  documentDevis: {
    type: String // URL vers le document PDF du devis
  },
  commentairesClient: {
    type: String
  },
  identifiantDevis: {
    type: String,
    default: function() {
      // Générer un identifiant unique pour le devis
      return 'DEV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
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

// Middleware pour mettre à jour automatiquement le montant total du devis
devisSchema.pre('save', function(next) {
  if (this.isModified('detailTarifs')) {
    const {
      prixTransport,
      fraisChargement,
      fraisDechargement,
      fraisMontage,
      fraisDemontage,
      fraisEmballage,
      fraisAssurance,
      fraisUrgence,
      autresFrais,
      remise
    } = this.detailTarifs;
    
    this.montant = (
      prixTransport +
      fraisChargement +
      fraisDechargement +
      fraisMontage +
      fraisDemontage +
      fraisEmballage +
      fraisAssurance +
      fraisUrgence +
      autresFrais -
      remise
    );
  }
  
  next();
});

// Méthode pour accepter un devis
devisSchema.methods.accepter = async function() {
  this.statut = 'accepte';
  this.dateAcceptation = new Date();
  
  // Mettre à jour le statut de l'annonce
  const Annonce = mongoose.model('Annonce');
  await Annonce.findByIdAndUpdate(this.annonce, {
    statut: 'en_cours',
    devisAccepte: this._id
  });
  
  // Refuser tous les autres devis pour cette annonce
  const Devis = mongoose.model('Devis');
  await Devis.updateMany(
    { 
      annonce: this.annonce, 
      _id: { $ne: this._id },
      statut: 'en_attente'
    },
    { 
      statut: 'refuse'
    }
  );
  
  return this.save();
};

// Méthode pour refuser un devis
devisSchema.methods.refuser = function() {
  this.statut = 'refuse';
  return this.save();
};

module.exports = mongoose.model('Devis', devisSchema);