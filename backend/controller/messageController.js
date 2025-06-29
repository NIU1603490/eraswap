const Message = require('../models/message');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const Product = require('../models/product');
const { isValidObjectId } = require('mongoose');

// Get messages of a conversation
const getMessagesByConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({ success: false, message: 'Invalid conversation id' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .populate('sender', 'clerkUserId username profilePicture')
      .populate('receiver', 'clerkUserId username profilePicture')
      .populate('product', 'title images');

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
};


const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, receiverId, content, productId } = req.body;
    console.log(req.body);
    console.log(senderId);
    console.log(receiverId);
    if (!conversationId || !senderId || !receiverId || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const sender = await User.findOne({ _id: senderId });
    const receiver = await User.findOne({ _id: receiverId });
    if (!sender || !receiver) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let product = null;
    if (productId) {
      if (!isValidObjectId(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid product id' });
      }
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: sender._id,
      receiver: receiver._id,
      content,
      product: product ? product._id : undefined,
    });

    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    if (global.io) {
      await message.populate([
        { path: 'sender', select: 'username profilePicture' },
        { path: 'receiver', select: 'username profilePicture' },
        { path: 'product', select: 'title images' },
      ]);
      global.io.to(conversationId).emit('newMessage', message);
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

module.exports = { getMessagesByConversation, sendMessage };