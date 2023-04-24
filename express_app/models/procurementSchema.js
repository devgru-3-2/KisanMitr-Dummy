const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const procurementSchema = new Schema({
  distributor: {
    type: Schema.Types.ObjectId,
    ref: 'Distributor',
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

const Procurement = mongoose.model('Procurement', procurementSchema);

module.exports = Procurement;
