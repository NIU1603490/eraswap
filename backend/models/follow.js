const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

}, { timestamps: true }); // timestamps will add createdAt and updatedAt fields

// indexe to avoid duplicate follows

// this will create a unique index on the combination of follower and following
// e.g. user A follows user B, user B follows user A
followSchema.index({ follower: 1, following: 1 }, { unique: true });

//index to improve query performance
// e.g. find all follows for a user
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

const Follow = mongoose.model('Follow', followSchema);

module.exports = Follow;
