const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    price: {
        amount: {
          type: Number,
          required: true
        },
        currency: {
          type: String,
          default: 'EUR'
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed','Completed', 'Canceled'],
        default: 'Pending',
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online'],
        default: 'cash',
    },
    deliveryMethod: {
        type: String,
        enum: ['inPerson', 'delivery'],
        default: 'inPerson',
    },
    meetingDate: {
        type: Date,
    },
    meetingTime: {
        type: String,
    },
    meetingLocation: {
        type: String,
    },
    messageToSeller: {
        type: String,
    },

}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema); 
