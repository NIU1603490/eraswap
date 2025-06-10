const express = require('express');
const router = express.Router();
const conversationController = require('../controller/conversationController');

// Get all conversations for a user (clerkUserId)
router.get('/user/:userId', conversationController.getConversationsByUser);

// Create a new conversation
router.post('/create', conversationController.createConversation);

module.exports = router;