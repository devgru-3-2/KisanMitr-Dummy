const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const farmerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  zipcode: {
      type: String,
      required: true
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }]
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;
