const Conversation = require('../models/conversation');
const Message = require('../models/message');
const User = require('../models/user');
const Product = require('../models/product');


const { isValidObjectId } = require('mongoose');

// Get conversations for a given user (clerkUserId)
const getConversationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const conversations = await Conversation.find({ participants: user._id })
      .populate('participants', 'clerkUserId username firstName lastName profilePicture')
      .populate('product', 'title images')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender receiver', select: 'username profilePicture' },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
  }
};



//create a conversation between two users. senderId and receiverId are clerkIDs
const createConversation = async (req, res) => {
    //object id of sender and receiver
    console.log('Create Conversation');
    try {
        console.log(req.body);
        const { senderId, receiverId, productId, initialMessage } = req.body;
        const sender = await User.findOne({ _id: senderId });
        console.log(sender);
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

    let conversation = await Conversation.findOne({
      participants: { $all: [sender._id, receiver._id] },
      ...(product ? { product: product._id } : {}),
    });

    if (!conversation) {
      console.log('No exist conversation');
        conversation = await Conversation.create({
          participants: [sender._id, receiver._id],
          product: product ? product._id : undefined,
        });
      }
  
      if (initialMessage) {
        const message = await Message.create({
          conversation: conversation._id,
          sender: sender._id,
          receiver: receiver._id,
          content: initialMessage,
          product: product ? product._id : undefined,
        });
        conversation.lastMessage = message._id;
        conversation.updatedAt = Date.now();
        await conversation.save();
    }
    //return a conversation even if doesn't exist 
    console.log(conversation);
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, message: 'Error creating conversation', error: error.message });
  }
};


module.exports = {getConversationsByUser, createConversation, };