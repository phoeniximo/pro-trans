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
  },
  typeTransport: {
    type: String,
    enum: [
      'colis', 
      'meuble', 
      'marchandise', 
      'palette', 
      'demenagement', 
      'vehicule', 
      'autre',
      'bagages',
      'motos_velos',
      'pieces_automobile',
      'marchandise_fragile',
      'voitures',
      'Machine_equipement',
      'materiels_vrac',
      'materiel_hors_gabarit',
      'autres_vehicules',
      'bateaux',
      'autres_livraisons'
    ],
    required: [true, 'Le type de transport est obligatoire']
  },
  villeDepart: {
    type: String,
    required: [true, 'La ville de départ est obligatoire']
  },
  adresseDepart: {
    rue: String,
    codePostal: String,
    ville: String,
    pays: { type: String, default: 'France' }
  },
  villeArrivee: {
    type: String,
    required: [true, 'La ville d\'arrivée est obligatoire']
  },
  adresseArrivee: {
    rue: String,
    codePostal: String,
    ville: String,
    pays: { type: String, default: 'France' }
  },
  dateDepart: {
    type: Date,
    required: [true, 'La date de départ est obligatoire']
  },
  dateArrivee: {
    type: Date
  },
  flexibiliteDate: {
    type: Boolean,
    default: false
  },
  distance: {
    type: Number,
    default: 0
  },
  poids: {
    type: Number,
    required: false
  },
  unite_poids: {
    type: String,
    enum: ['kg', 'tonnes'],
    default: 'kg'
  },
  volume: {
    type: Number,
    required: false
  },
  dimensions: {
    longueur: Number,
    largeur: Number,
    hauteur: Number,
    unite: { type: String, enum: ['cm', 'm'], default: 'cm' }
  },
  nombreColis: {
    type: Number,
    default: 1
  },
  contenuColis: [{
    type: String
  }],
  valeurDeclaree: {
    type: Number,
    default: 0
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
    enum: ['disponible', 'en_attente', 'en_cours', 'termine', 'annule'],
    default: 'disponible'
  },
  optionsTransport: {
    chargement: { type: Boolean, default: false },
    dechargement: { type: Boolean, default: false },
    montage: { type: Boolean, default: false },
    demontage: { type: Boolean, default: false },
    emballage: { type: Boolean, default: false },
    assurance: { type: Boolean, default: false }
  },
  commentairesTransporteur: {
    type: String
  },
  devisAccepte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Devis',
    default: null
  },
  tracking: {
    codeTracking: String,
    statut: {
      type: String,
      enum: ['en_attente', 'pris_en_charge', 'en_transit', 'en_livraison', 'livre', 'probleme'],
      default: 'en_attente'
    },
    historique: [{
      statut: String,
      date: { type: Date, default: Date.now },
      commentaire: String,
      localisation: String
    }]
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  vues: {
    type: Number,
    default: 0
  },
  paiement: {
    statut: {
      type: String,
      enum: ['non_paye', 'paye_partiellement', 'paye', 'rembourse'],
      default: 'non_paye'
    },
    montantPaye: {
      type: Number,
      default: 0
    },
    methode: {
      type: String,
      enum: ['carte', 'virement', 'paypal', 'especes', 'autre'],
      default: 'carte'
    },
    dateTransaction: Date,
    referenceTransaction: String
  },
  notesPrivees: {
    type: String
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

// Virtuals pour les messages associés
annonceSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'annonce'
});

// Indexation pour la recherche
annonceSchema.index({ villeDepart: 'text', villeArrivee: 'text', titre: 'text', description: 'text' });
annonceSchema.index({ dateDepart: 1 });
annonceSchema.index({ statut: 1 });
annonceSchema.index({ utilisateur: 1 });
annonceSchema.index({ typeTransport: 1 });

module.exports = mongoose.model('Annonce', annonceSchema);