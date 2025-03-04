// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Créer un paiement
router.post('/', paymentController.createPayment);

// Obtenir les méthodes de paiement sauvegardées
router.get('/payment-methods', paymentController.getPaymentMethods);

// Ajouter une nouvelle méthode de paiement
router.post('/payment-methods', paymentController.addPaymentMethod);

// Supprimer une méthode de paiement
router.delete('/payment-methods/:id', paymentController.deletePaymentMethod);

// Vérifier le statut d'un paiement
router.get('/:id', paymentController.getPaymentStatus);

// Confirmer un paiement (callback webhook)
router.post('/webhook', paymentController.handleWebhook);

// Obtenir les factures de l'utilisateur
router.get('/factures', paymentController.getUserInvoices);

// Obtenir une facture spécifique
router.get('/factures/:id', paymentController.getInvoice);

// Télécharger une facture au format PDF
router.get('/factures/:id/download', paymentController.downloadInvoice);

// Obtenir les statistiques de paiement (pour le tableau de bord)
router.get('/statistics', paymentController.getPaymentStatistics);

module.exports = router;