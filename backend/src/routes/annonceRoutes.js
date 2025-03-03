const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const authMiddleware = require('../middleware/auth');

// Routes pour les annonces
router.get('/', annonceController.listerAnnonces);
router.post('/', authMiddleware, annonceController.creerAnnonce);
router.get('/:id', annonceController.getAnnonceById);
router.put('/:id', authMiddleware, annonceController.modifierAnnonce);
router.delete('/:id', authMiddleware, annonceController.supprimerAnnonce);

module.exports = router;