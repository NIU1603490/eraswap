const express = require('express');
const router = express.Router();
const conversationController = require('../controller/conversationController');

// Get all conversations for a user (clerkUserId)
router.get('/user/:userId', conversationController.getConversationsByUser);

router.post('/create', conversationController.createConversation);

router.delete('/:conversationId', conversationController.deleteConversation);

module.exports = router;