// backend/src/routes/trackingRoutes.js
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { protect, restrictTo } = require('../middleware/auth');

// Routes publiques (accessibles avec le code de suivi)
router.get('/public/:codeTracking', trackingController.getTrackingPublic);

// Routes protégées
router.use(protect);

// Obtenir le suivi d'une annonce
router.get('/:annonceId', trackingController.getTracking);

// Créer ou mettre à jour le suivi (transporteur seulement)
router.post('/:annonceId', restrictTo('transporteur'), trackingController.createUpdateTracking);

// Mise à jour du statut de suivi (transporteur seulement)
router.patch('/:annonceId/status', restrictTo('transporteur'), trackingController.updateTrackingStatus);

// Ajouter un événement dans l'historique (transporteur seulement)
router.post('/:annonceId/event', restrictTo('transporteur'), trackingController.addTrackingEvent);

// Obtenir le code de suivi ou en générer un (transporteur seulement)
router.get('/:annonceId/code', restrictTo('transporteur'), trackingController.getTrackingCode);

// Enregistrer une position GPS (transporteur seulement)
router.post('/:annonceId/position', restrictTo('transporteur'), trackingController.updateGpsPosition);

// Marquer comme livré avec signature (transporteur seulement)
router.post('/:annonceId/delivered', restrictTo('transporteur'), trackingController.markAsDelivered);

// Confirmer la réception (client seulement)
router.post('/:annonceId/confirm-reception', trackingController.confirmReception);

// Signaler un problème lié à la livraison (client ou transporteur)
router.post('/:annonceId/report-issue', trackingController.reportIssue);

module.exports = router;