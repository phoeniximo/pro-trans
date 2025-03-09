// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middleware/auth'); // Changé de authMiddleware à auth

// Log pour le débogage
console.log('Routes dashboard chargées');

// Routes protégées par authentification
router.use(protect);

// Routes du dashboard client
router.get('/client', restrictTo('client'), dashboardController.getClientDashboard);

// Routes du dashboard transporteur
router.get('/transporteur', restrictTo('transporteur'), dashboardController.getTransporteurDashboard);

module.exports = router;