// backend/src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Vérification des fonctions de contrôleur
// Si certaines fonctions ne sont pas définies dans le contrôleur, créez des fonctions temporaires
const getMyConversations = messageController.getMyConversations || ((req, res) => {
  res.status(501).json({ 
    success: false, 
    message: "Cette fonctionnalité n'est pas encore implémentée" 
  });
});

const getConversation = messageController.getConversation || ((req, res) => {
  res.status(501).json({ 
    success: false, 
    message: "Cette fonctionnalité n'est pas encore implémentée" 
  });
});

const markAsRead = messageController.markAsRead || ((req, res) => {
  res.status(501).json({ 
    success: false, 
    message: "Cette fonctionnalité n'est pas encore implémentée" 
  });
});

const sendMessage = messageController.sendMessage || ((req, res) => {
  res.status(501).json({ 
    success: false, 
    message: "Cette fonctionnalité n'est pas encore implémentée" 
  });
});

const sendMessageWithAttachments = messageController.sendMessageWithAttachments || ((req, res) => {
  res.status(501).json({ 
    success: false, 
    message: "Cette fonctionnalité n'est pas encore implémentée" 
  });
});

const deleteMessage = messageController.deleteMessage || ((req, res) => {
  res.status(501).json({ 
    success: false, 
    message: "Cette fonctionnalité n'est pas encore implémentée" 
  });
});

// Toutes les routes de messages nécessitent l'authentification
router.use(protect);

// Routes pour les conversations
router.get('/conversations', getMyConversations);
router.get('/conversation/:annonceId/:userId', getConversation);
router.put('/mark-read/:annonceId/:userId', markAsRead);

// Routes pour les messages
router.post('/', sendMessage);
router.post('/with-attachments', sendMessageWithAttachments);
router.delete('/:messageId', deleteMessage);

module.exports = router;