const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');

// Get messages of a conversation
router.get('/:conversationId', messageController.getMessagesByConversation);

// Send a new message
router.post('/', messageController.sendMessage);

module.exports = router;