const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const farmerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  zipcode: {
    type: String,
    required: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  role: {
    type: String,
    default: 'farmer'
  }
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
