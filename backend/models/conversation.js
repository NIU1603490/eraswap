const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
},
}, {timestamps: true});

// Índices para búsquedas eficientes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ product: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
