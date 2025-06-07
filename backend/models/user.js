const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    clerkUserId: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    country: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: true,
    },
    city: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true,
    },
    university: {
        type: Schema.Types.ObjectId,
        ref: 'University',
        required: true,
    },
    profilePicture: {
        type: String,
        default: 'https://www.gravatar.com/avatar/?d=mp',
    },
    savedProducts: [{
            type: Schema.Types.ObjectId,
            ref: 'Product',
    }],
    rating: {
        average: {
            type: Number,
            default: 0,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    });

module.exports = mongoose.model('User', userSchema);
