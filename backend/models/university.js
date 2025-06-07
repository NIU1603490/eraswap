const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const universitySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure university names are unique
  },
  city: {
    type: Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  country: {
    type: Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  }
},{versionKey: false,});

universitySchema.index({ city: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('University', universitySchema);