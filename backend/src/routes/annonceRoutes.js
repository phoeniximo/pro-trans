// backend/src/routes/annonceRoutes.js
const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const { protect, restrictTo } = require('../middleware/auth');

// Routes publiques
router.get('/', annonceController.listerAnnonces);
router.get('/:id', annonceController.getAnnonceById);

// Routes protégées
router.use(protect);

// Mes annonces
router.get('/user/mes-annonces', annonceController.getMesAnnonces);

// Opérations CRUD pour les annonces
router.post('/', annonceController.creerAnnonce);
router.put('/:id', annonceController.modifierAnnonce);
router.delete('/:id', annonceController.supprimerAnnonce);

// Export du router
module.exports = router;