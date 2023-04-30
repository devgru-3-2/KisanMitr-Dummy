const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const distributorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    zipcode: {
      type: String,
      required: true
    }
  },
  products: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  procurements: [{
    type: Schema.Types.ObjectId,
    ref: 'Procurement'
  }],
  role: {
    type: String,
    default: 'distributor'
  }
});

const Distributor = mongoose.model('Distributor', distributorSchema);

module.exports = Distributor;
