// backend/src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/conversation/:annonceId/:userId', messageController.getConversation);

module.exports = router;