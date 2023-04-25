const Farmer = require('../models/farmerSchema');
const Distributor = require('../models/distributorSchema');
const User = require('../models/userSchema');

const { sendOTP, verifyOTP } = require('./auth');
const { addToBlockchain } = require('../utils/blockchain');

exports.createFarmer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // send OTP to farmer
    await sendOTP(req, res);

    // store farmer data in MongoDB
    const newFarmer = new Farmer({
      name,
      phone,
      address,
    });

    const savedFarmer = await newFarmer.save();

    // store farmer data in blockchain
    const data = { 
      name: savedFarmer.name, 
      phone: savedFarmer.phone, 
      address: savedFarmer.address 
    };
    const txid = await addToBlockchain('createFarmer', data);

    res.status(200).json({ 
      message: 'Farmer created successfully', 
      txid: txid
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating farmer' });
  }
};

exports.verifyFarmer = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // verify OTP
    await verifyOTP(req, res);

    // get farmer data from MongoDB
    const farmer = await Farmer.findOne({ phone });

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // store farmer data in blockchain
    const data = { 
      name: farmer.name, 
      phone: farmer.phone, 
      address: farmer.address 
    };
    const txid = await addToBlockchain('verifyFarmer', data);

    // store user data in MongoDB
    const newUser = new User({
      name: farmer.name,
      role: 'farmer',
    });

    await newUser.save();

    res.status(200).json({ 
      message: 'Farmer verified successfully', 
      txid: txid 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying farmer' });
  }
};

exports.getFarmersAndDistributors = async (req, res) => {
  try {
    const { zipcode } = req.params;

    // Find farmers and distributors based on zipcode
    const farmers = await Farmer.find({ "address.zipcode": zipcode })
    const distributors = await Distributor.find({ "address.zipcode": zipcode })

    res.status(200).json({ farmers, distributors });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting farmers and distributors' });
  }
};


/*We start by importing the necessary modules - twilio for sending SMS messages and generateOTP function 
from the otp.js file for generating OTPs.

The sendOTP function is an asynchronous function that takes the phone number of the Farmer as input, 
generates an OTP using the generateOTP function, creates a message containing the OTP, and sends it to 
the phone number using the Twilio API. The OTP is also stored in a map where the phone number is the key.

The verifyOTP function is also an asynchronous function that takes the phone number and OTP as input. 
It retrieves the stored OTP for the given phone number, compares it with the OTP provided in the request body. 
If they match, the OTP is deleted from the map and the function returns a success message. If they don't match, 
the function returns an error message indicating an invalid OTP.

The createFarmer function is also an asynchronous function that takes the Farmer's details as input, checks if 
the phone number is valid and sends an OTP for verification. If the OTP verification is successful, the function 
creates a new Farmer object and saves it to the database. The function also sends the Farmer's data to the blockchain 
using the addFarmer function from the blockchain.js file.

The getFarmers function is an asynchronous function that fetches all the Farmers from the database and returns 
them as an array.

The getFarmer function is also an asynchronous function that takes a Farmer ID as input, fetches the corresponding 
Farmer object from the database, and returns it.

The updateFarmer function is an asynchronous function that takes a Farmer ID and updated details as input, finds 
the corresponding Farmer object in the database, updates its details, and saves it to the database. The function 
also sends the updated data to the blockchain using the updateFarmer function from the blockchain.js file.

The deleteFarmer function is an asynchronous function that takes a Farmer ID as input, finds the corresponding 
Farmer object in the database, deletes it from the database, and sends a success message as a response. 
The function also sends the deleted Farmer's ID to the blockchain using the deleteFarmer function from the blockchain.js file */