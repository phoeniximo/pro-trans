// backend/src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  expediteur: {
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
  contenu: {
    type: String,
    required: [true, 'Le contenu du message est obligatoire'],
    minlength: [1, 'Le message ne peut pas être vide']
  },
  lu: {
    type: Boolean,
    default: false
  },
  pieceJointe: {
    type: String
  }
}, {
  timestamps: true
});

// Index pour accélérer les recherches de conversations
messageSchema.index({ expediteur: 1, destinataire: 1, annonce: 1 });
messageSchema.index({ destinataire: 1, lu: 1 });

module.exports = mongoose.model('Message', messageSchema);