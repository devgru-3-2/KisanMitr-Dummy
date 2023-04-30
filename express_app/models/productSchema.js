const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  distributor: {
    type: Schema.Types.ObjectId,
    ref: 'Distributor',
    default: null
  },
  nodalAgency: {
    type: Schema.Types.ObjectId,
    ref: 'NodalAgency',
    default: null
  },
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'approved'],
    default: 'available'
  },
  date: {
    type: Date,
    default: Date.now
  },
  purchaseRequest: {
    distributor: {
      type: Schema.Types.ObjectId,
      ref: 'Distributor',
      required: true
    },
    zipcode: {
      type: String,
      required: true
    }
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
