// backend/src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Statistiques pour le tableau de bord client
router.get('/client', analyticsController.getClientAnalytics);

// Statistiques pour le tableau de bord transporteur
router.get('/transporteur', analyticsController.getTransporteurAnalytics);

// Statistiques des annonces
router.get('/annonces', analyticsController.getAnnoncesAnalytics);

// Statistiques des paiements
router.get('/paiements', analyticsController.getPaiementsAnalytics);

// Statistiques de performance
router.get('/performance', analyticsController.getPerformanceAnalytics);

// Historique des transports
router.get('/historique', analyticsController.getHistoriqueTransports);

module.exports = router;