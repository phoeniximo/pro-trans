const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

// Toutes les routes de notifications nécessitent une authentification
router.use(authController.protect);

// Routes pour les notifications
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/read', notificationController.deleteReadNotifications);

module.exports = router;