const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    images: [{type: String,}],
    likes: [{type: String,}],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        content: String,
        timestamp: {
            type: Date,
            default: Date.now,
        }, 
    }],
}, { timestmaps: true});

module.exports = mongoose.model('Post', postSchema);


