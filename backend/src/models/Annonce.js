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
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    enum: ['disponible', 'en_cours', 'termine'],
    default: 'disponible'
  }
}, { timestamps: true });

module.exports = mongoose.model('Annonce', annonceSchema);