const { addToBlockchain } = require('../utils/blockchain');
const { verifyOTP, sendOTP } = require('./auth');
const NodalAgency = require('../models/nodalAgencySchema');
const Distributor = require('../models/distributorSchema');
const Product = require('../models/productSchema');
const farmer = require('../models/farmerSchema');
const User = require('../models/userSchema');

const express = require('express');
const session = require('express-session');

exports.createAndVerifyNodalAgency = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const phoneNumber = "+91" + phone;

    // send OTP to nodal agency
    const verification = await sendOTP(req, phoneNumber);
    req.session.verificationSid = verification.sid; // store verification SID in session variable
    req.session.nodalAgencyDetails = { name, phoneNumber, address }; // store nodal agency details in session variable

    // redirect nodal agency to OTP verification page
    res.redirect('/nodal-agency-verify-otp');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating and verifying nodal agency' });
  }
};

exports.verifyNodalAgencyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { verificationSid, nodalAgencyDetails } = req.session;

    // verify OTP entered by nodal agency
    const verificationCheck = await verifyOTP(req, verificationSid, otp);

    if (verificationCheck.status !== 'approved') {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // store nodal agency data in MongoDB
    const newNodalAgency = new NodalAgency(nodalAgencyDetails);
    const savedNodalAgency = await newNodalAgency.save();

    // store nodal agency data in blockchain
    /*const data = { 
      name: savedNodalAgency.name, 
      phone: savedNodalAgency.phone, 
      address: savedNodalAgency.address 
    };
    const txid = await addToBlockchain('createNodalAgency', data);*/

   

    // remove session variables
    delete req.session.verificationSid;
    delete req.session.nodalAgencyDetails;

    // render dashboard page for nodal agency
    res.render('nodalAgency/dashboard', { nodalAgency: savedNodalAgency });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying nodal agency' });
  }
};




exports.logProcurement = async (req, res) => {
  try {
  const { distributorPhone, procurementDetails } = req.body;

    // get nodal agency data from MongoDB
const nodalAgency = await NodalAgency.findOne({});

if (!nodalAgency) {
  return res.status(404).json({ message: 'Nodal agency not found' });
}

// get distributor data from MongoDB
const distributor = await Distributor.findOne({ phone: distributorPhone });

if (!distributor) {
  return res.status(404).json({ message: 'Distributor not found' });
}

// log procurement data in MongoDB
nodalAgency.procurements.push({
  distributor: distributor._id,
  details: procurementDetails,
  createdAt: Date.now()
});

await nodalAgency.save();

// store procurement data in blockchain
const data = { 
  nodalAgency: nodalAgency._id, 
  distributor: distributor._id, 
  details: procurementDetails
};
const txid = await addToBlockchain('logProcurement', data);

res.status(200).json({
    message: 'Procurement logged successfully',
    txid: txid,
    });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging procurement' });
}

};


exports.getProcurements = async (req, res) => {
    try {
    // get nodal agency data from MongoDB
    const nodalAgency = await NodalAgency.findOne({});
    if (!nodalAgency) {
        return res.status(404).json({ message: 'Nodal agency not found' });
    }

    // get all procurements logged by nodal agency
    const procurements = await NodalAgency.aggregate([
    { $unwind: '$procurements' },
    { 
      $lookup: { 
        from: 'distributors', 
        localField: 'procurements.distributor', 
        foreignField: '_id', 
        as: 'distributor' 
      } 
    },
    { $unwind: '$distributor' },
    { $project: { 
        _id: '$procurements._id', 
        distributor: '$distributor.name', 
        details: '$procurements.details', 
        createdAt: '$procurements.createdAt' 
      } 
    }
  ]);
  
  res.status(200).json({ procurements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting procurements' });
    }
};

exports.getZipcodeData = async (req, res) => {
    try {
      const { zipcode } = req.params;
  
      // get nodal agency data from MongoDB
      const nodalAgency = await NodalAgency.findOne({});
  
      if (!nodalAgency) {
        return res.status(404).json({ message: 'Nodal agency not found' });
      }
  
      // get list of all distributors in the zipcode
      const distributors = await Distributor.find({ zipcode });
  
      // get list of all farmers in the zipcode
      const farmers = await Farmer.find({ zipcode });
  
      // create an object to store the data
      const data = {};
  
      // iterate over each distributor
      for (const distributor of distributors) {
        // get the procurement data for the distributor
        const procurements = nodalAgency.procurements.filter((procurement) => procurement.distributor.equals(distributor._id));
  
        // get the distribution data for the distributor
        const distributions = await Distribution.find({ distributor: distributor._id });
  
        // add the distributor data to the object
        data[distributor._id] = {
          type: 'distributor',
          name: distributor.name,
          procurements,
          distributions,
        };
      }
  
      // iterate over each farmer
      for (const farmer of farmers) {
        // get the distribution data for the farmer
        const distributions = await Distribution.find({ farmer: farmer._id });
  
        // get the product data for the farmer
        const products = await Product.find({ farmer: farmer._id });
  
        // add the farmer data to the object
        data[farmer._id] = {
          type: 'farmer',
          name: farmer.name,
          distributions,
          products,
        };
      }
  
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error getting data' });
    }
  };

  exports.getProductsByDistributor = async (req, res) => {
    try {
      const { distributorId } = req.params;
  
      // Check if distributor exists
      const distributor = await Distributor.findById(distributorId);
      if (!distributor) {
        return res.status(404).json({ message: 'Distributor not found' });
      }
  
      // Find products by distributor ID with status 'available'
      const products = await Product.find({ distributor: distributorId, status: 'available' });
  
      res.status(200).json(products);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error getting products by distributor' });
    }
  };
  


  



/*The code implements three API endpoints for a Node.js application:

createNodalAgency: This endpoint creates a new nodal agency by first sending an OTP to the provided phone number 
using the sendOTP function from the auth.js module. After verifying the OTP, the nodal agency data is stored in 
MongoDB using the NodalAgency schema. Then, the nodal agency data is stored in a blockchain using the addToBlockchain 
function from the blockchain.js module. Finally, a response is sent to the client with a success message and the transaction 
ID returned by the blockchain.

verifyNodalAgency: This endpoint verifies an existing nodal agency by first verifying the OTP sent to the provided phone 
number using the verifyOTP function from the auth.js module. Then, the nodal agency data is retrieved from MongoDB using 
the findOne method of the NodalAgency schema. If the nodal agency is found, a new user is created with the name and role 
of the nodal agency using the User schema. The nodal agency data is also stored in a blockchain using the addToBlockchain 
function from the blockchain.js module. Finally, a response is sent to the client with a success message and the transaction 
ID returned by the blockchain.

logProcurement: This endpoint logs the procurement details of a distributor by first retrieving the nodal agency data from 
MongoDB using the findOne method of the NodalAgency schema. If the nodal agency is found, the distributor data is retrieved 
from MongoDB using the findOne method of the Distributor schema. If the distributor is found, the procurement details are logged 
in the procurements array of the nodal agency using the push method. The procurement data is also stored in a blockchain using 
the addToBlockchain function from the blockchain.js module. Finally, a response is sent to the client with a success message 
and the transaction ID returned by the blockchain.

getZipcodeData controller function which is responsible for getting a list of all distributors and farmers in a particular zipcode, 
along with their respective procurements and distributions incase of distributors, and distributions and products incase of the 
farmers.

Here is a step-by-step breakdown of the code:

The function starts by extracting the zipcode parameter from the request.

It then retrieves the nodal agency data from MongoDB using the findOne method. If there is no nodal agency data, it returns a 
404 error.

The function then retrieves a list of all distributors in the given zipcode using the find method of the Distributor model.

It then retrieves a list of all farmers in the given zipcode using the find method of the Farmer model.

An empty object data is created to store the data for each distributor and farmer.

The function then iterates over each distributor and retrieves their procurement data from the nodal agency using the filter 
method on the procurements array. It also retrieves their distribution data using the find method of the Distribution model.

For each distributor, it adds their data to the data object with an id as key and the data object as value.

The function then iterates over each farmer and retrieves their distribution data using the find method of the Distribution model. 
It also retrieves their product data using the find method of the Product model.

For each farmer, it adds their data to the data object with an id as key and the data object as value
*/


