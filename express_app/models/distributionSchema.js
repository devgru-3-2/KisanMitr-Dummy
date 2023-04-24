const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const distributionSchema = new Schema({
  distributor: {
    type: Schema.Types.ObjectId,
    ref: 'Distributor',
    required: true
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
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

const Distribution = mongoose.model('Distribution', distributionSchema);

module.exports = Distribution;
