// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// Créer des fonctions temporaires pour les contrôleurs manquants
const notImplemented = (req, res) => {
  res.status(501).json({
    success: false,
    message: "Cette fonctionnalité d'administration n'est pas encore implémentée"
  });
};

// Assigner les fonctions temporaires pour les contrôleurs non définis
const getDashboardStats = adminController.getDashboardStats || notImplemented;
const getAllUsers = adminController.getAllUsers || notImplemented;
const getUserById = adminController.getUserById || notImplemented;
const updateUser = adminController.updateUser || notImplemented;
const toggleUserStatus = adminController.toggleUserStatus || notImplemented;
const deleteUser = adminController.deleteUser || notImplemented;
const verifyUserDocuments = adminController.verifyUserDocuments || notImplemented;
const getAllAnnonces = adminController.getAllAnnonces || notImplemented;
const getAnnonceById = adminController.getAnnonceById || notImplemented;
const updateAnnonceStatus = adminController.updateAnnonceStatus || notImplemented;
const deleteAnnonce = adminController.deleteAnnonce || notImplemented;
const getAllTransactions = adminController.getAllTransactions || notImplemented;
const getTransactionById = adminController.getTransactionById || notImplemented;
const updateTransactionStatus = adminController.updateTransactionStatus || notImplemented;
const getAllDisputes = adminController.getAllDisputes || notImplemented;
const getDisputeById = adminController.getDisputeById || notImplemented;
const updateDisputeStatus = adminController.updateDisputeStatus || notImplemented;
const resolveDispute = adminController.resolveDispute || notImplemented;
const updateFaqContent = adminController.updateFaqContent || notImplemented;
const updateTermsContent = adminController.updateTermsContent || notImplemented;
const updatePrivacyContent = adminController.updatePrivacyContent || notImplemented;
const sendSystemNotification = adminController.sendSystemNotification || notImplemented;
const getSystemLogs = adminController.getSystemLogs || notImplemented;

// Toutes les routes d'administration nécessitent une authentification et un rôle d'admin
router.use(protect);
router.use(restrictTo('admin'));

// Statistiques générales du tableau de bord
router.get('/dashboard', getDashboardStats);

// Gestion des utilisateurs
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', updateUser);
router.patch('/users/:userId/status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);
router.post('/users/:userId/verify', verifyUserDocuments);

// Gestion des annonces
router.get('/annonces', getAllAnnonces);
router.get('/annonces/:annonceId', getAnnonceById);
router.patch('/annonces/:annonceId/status', updateAnnonceStatus);
router.delete('/annonces/:annonceId', deleteAnnonce);

// Gestion des transactions
router.get('/transactions', getAllTransactions);
router.get('/transactions/:transactionId', getTransactionById);
router.patch('/transactions/:transactionId/status', updateTransactionStatus);

// Gestion des litiges
router.get('/disputes', getAllDisputes);
router.get('/disputes/:disputeId', getDisputeById);
router.patch('/disputes/:disputeId/status', updateDisputeStatus);
router.post('/disputes/:disputeId/resolve', resolveDispute);

// Gestion du contenu du site
router.put('/content/faq', updateFaqContent);
router.put('/content/terms', updateTermsContent);
router.put('/content/privacy', updatePrivacyContent);

// Notifications système
router.post('/notifications', sendSystemNotification);
router.get('/logs', getSystemLogs);

module.exports = router;