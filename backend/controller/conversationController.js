const Conversation = require('../models/conversation');
const Message = require('../models/message');
const User = require('../models/user');
const Product = require('../models/product');


const getConversations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'You must be logged' });
        }
        // Find conversations where the user is a participant
        const userId = req.user._id;
        const conversations = await Conversation.find({ participants: userId})
            .populate('participants', 'name profilePicture') // Populate participants with name and profile picture
            .populate('product', 'title images') // Populate product with title and images
            .populate('lastMessage')
            .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order

            
        res.status(200).json({
            success: true,
            conversations});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching conversations', error });
    }
}


//create conversation
const createConversation = async (req, res) => {
    try {
        const { receiverId, productId, initialMessage } = req.body;
        const senderId = req.user._id;

        // Check if the sender and receiver are the same
        if (senderId.toString() === receiverId,toSpring()) {
            return res.status(400).json({ 
                success: false,
                message: 'Sender and receiver cannot be the same'
            });
        }

        //verify if receiverId is valid
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ 
                success: false,
                message: 'Receiver not found'
            });
        }

        //verify if productId is valid
        let product = null;
        if (productId) {
            product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
        }
        // Check if a conversation already exists between the sender and receiver
        const existingConversationFilter = {
            participants: { $all: [senderId, receiverId] },
        };
          
        if (productId) {
            existingConversationFilter.product = productId;
        }

        const existingConversation = await Conversation.findOne(existingConversationFilter);

        if (existingConversation) {
            // If a conversation already exists, create a new message in that conversation
            if(initialMessage) {
                const newMessage = new Message({
                    conversation: existingConversation._id,
                    sender: senderId,
                    receiver: receiverId,
                    content: initialMessage,
                    product: productId || null,
                });

                await newMessage.save();

                //update the last message in the conversation
                await Conversation.findByIdAndUpdate(
                    existingConversation._id, 
                    { 
                        lastMessage: newMessage._id,
                        updatedAt: Date.now()
                    }
                );
            }

            return res.status(200).json({ 
                success: true, 
                message:'Conversation already exists',
                conversation: existingConversation 
            });
            
        }

        // If no conversation exists, create a new one
        const newConversation = new Conversation({
            participants: [senderId, receiverId],
            product: productId || null,
            lastMessage: {
                content: initialMessage,
                sender: senderId,
                timestamp: Date.now()
            },
        });
        await newConversation.save();
        res.status(201).json({ success: true, conversation: newConversation });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating conversation', error });
    }
}


module.exports = {getConversations};