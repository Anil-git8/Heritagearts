const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

// All chat operations require authentication
router.use(authenticate);

router.get('/', chatController.getConversations);
router.get('/conversations', chatController.getConversations);
router.post('/', chatController.startOrGetChat);
router.post('/start', chatController.startOrGetChat);
router.get('/:chatId/messages', chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);
router.post('/report', chatController.reportChat);

module.exports = router;
