const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  userId: String,
  imageUrl: String,
},{timestamps: true,});

module.exports = mongoose.model('Image', imageSchema);
