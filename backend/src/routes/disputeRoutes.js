// backend/src/routes/disputeRoutes.js
const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { protect } = require('../middleware/auth');

// Protection de toutes les routes
router.use(protect);

// Créer un nouveau litige
router.post('/', disputeController.createDispute);

// Obtenir les litiges de l'utilisateur
router.get('/', disputeController.getMyDisputes);

// Obtenir un litige par son ID
router.get('/:id', disputeController.getDisputeById);

// Ajouter un message au litige
router.post('/:id/messages', disputeController.addMessage);

// Résoudre un litige
router.put('/:id/resolve', disputeController.resolveDispute);

module.exports = router;