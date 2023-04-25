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
    required: true
  },
  nodalAgency: {
    type: Schema.Types.ObjectId,
    ref: 'NodalAgency',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
