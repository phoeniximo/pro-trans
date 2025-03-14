const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['annonce', 'devis', 'message', 'avis', 'system'],
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: 'referenceModel'
    },
    referenceModel: {
      type: String,
      enum: ['Annonce', 'Devis', 'Conversation', 'Avis', 'User'],
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Index pour améliorer les performances de recherche
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;