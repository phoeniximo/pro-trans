// backend/src/models/Rating.js
const mongoose = require('mongoose');

/**
 * Schéma pour gérer les notes par catégorie dans les avis
 */
const ratingSchema = new mongoose.Schema({
  global: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ponctualite: {
    type: Number,
    min: 1,
    max: 5
  },
  communication: {
    type: Number,
    min: 1,
    max: 5
  },
  service: {
    type: Number,
    min: 1,
    max: 5
  },
  rapport_qualite_prix: {
    type: Number,
    min: 1,
    max: 5
  }
});

module.exports = ratingSchema;