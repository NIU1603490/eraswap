const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const countrySchema = new Schema({
  name: {
    type: String,
    required: true, 
    unique: true,
  },
},{ versionKey: false, }); // Disable version key (__v)


module.exports = mongoose.model('Country', countrySchema);