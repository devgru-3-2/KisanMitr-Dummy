const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nodalAgencySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    zipcode: {
      type: String,
      required: true
    }
  },
  phone: {  
    type: String,
    required: true
  },

  procurements: [{
    type: Schema.Types.ObjectId,
    ref: 'Procurement'
  }],
  role: {
    type: String,
    default: 'nodalAgency'
  }
});

const NodalAgency = mongoose.model('NodalAgency', nodalAgencySchema);

module.exports = NodalAgency;
