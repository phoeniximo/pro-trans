// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Toutes les routes d'administration nécessitent une authentification et un rôle d'admin
router.use(protect);
router.use(restrictTo('admin'));

// Statistiques générales du tableau de bord
router.get('/dashboard', adminController.getDashboardStats);

// Gestion des utilisateurs
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId', adminController.updateUser);
router.patch('/users/:userId/status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/:userId/verify', adminController.verifyUserDocuments);

// Gestion des annonces
router.get('/annonces', adminController.getAllAnnonces);
router.get('/annonces/:annonceId', adminController.getAnnonceById);
router.patch('/annonces/:annonceId/status', adminController.updateAnnonceStatus);
router.delete('/annonces/:annonceId', adminController.deleteAnnonce);

// Gestion des transactions
router.get('/transactions', adminController.getAllTransactions);
router.get('/transactions/:transactionId', adminController.getTransactionById);
router.patch('/transactions/:transactionId/status', adminController.updateTransactionStatus);

// Gestion des litiges
router.get('/disputes', adminController.getAllDisputes);
router.get('/disputes/:disputeId', adminController.getDisputeById);
router.patch('/disputes/:disputeId/status', adminController.updateDisputeStatus);
router.post('/disputes/:disputeId/resolve', adminController.resolveDispute);

// Gestion du contenu du site
router.put('/content/faq', adminController.updateFaqContent);
router.put('/content/terms', adminController.updateTermsContent);
router.put('/content/privacy', adminController.updatePrivacyContent);

// Notifications système
router.post('/notifications', adminController.sendSystemNotification);
router.get('/logs', adminController.getSystemLogs);

module.exports = router;