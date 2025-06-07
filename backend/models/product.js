const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        amount: { type: Number, required: true,},
        currency: { type: String, default: 'EUR',},
    },
    category: {
        type: String,
        required: true,
    },
    images: [{
        type: String,
        required: true,
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    location: {
        city: { 
            type: Schema.Types.ObjectId,
            ref: 'City',
            required: true,
        },
        country: { 
            type: Schema.Types.ObjectId,
            ref: 'Country',
            required: true,
        },
    },
    condition: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true, 
        default: 'Available',
        enum: ['Available', 'Sold', 'Reserved'],
    },
    saves: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });


const Product = mongoose.model('Product', productSchema);
module.exports = Product;