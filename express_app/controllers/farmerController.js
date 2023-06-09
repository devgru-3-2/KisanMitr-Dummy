const Farmer = require('../models/farmerSchema');
const Distributor = require('../models/distributorSchema');
const User = require('../models/userSchema');
const Product = require('../models/productSchema');
const session = require('express-session');
const express = require('express');

const { sendOTP, verifyOTP } = require('./auth');
const { addToBlockchain } = require('../utils/blockchain');


exports.createAndVerifyFarmer = async (req, res) => {
  try {
    const { name, phone, zipcode } = req.body;
    console.log(req.body);
   // const phone = "+91" + phone;
    // send OTP to farmer
    //console.log(phoneNumber);
    const verification = await sendOTP(phone);
    console.log(verification);
    console.log(typeof(verification.sid));
    console.log(req.session);
    req.session.verificationSid = verification.sid; // store verification SID in session variable
    req.session.farmerDetails = { name, phone : phone, zipcode }; // store farmer details in session variable
    console.log(req.session.farmerDetails);

    // redirect farmer to OTP verification page
    res.redirect('/farmer/farmer-verify-otp');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating and verifying farmer' });
  }
};

exports.verifyFarmerOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!req.session.farmerDetails) {
      return res.status(401).json({ message: 'Farmer details not found' });
    }
    
    const { name, phone, zipcode } = req.session.farmerDetails;

    // verify OTP entered by farmer
    const verificationCheck = await verifyOTP(phone, otp);

    if (!verificationCheck.success) {
      return res.status(401).json({ message: verificationCheck.message });
    }

    // store farmer data in MongoDB
    const newFarmer = new Farmer({ name, phone, zipcode });
    const savedFarmer = await newFarmer.save();

    // store user data in MongoDB
    const newUser = new User({
      name: savedFarmer.name,
      role: 'farmer',
    });
    await newUser.save();

    // add farmer data to blockchain
    //await addToBlockchain(savedFarmer);

    // remove session variables
    delete req.session.verificationSid;
    delete req.session.farmerDetails;

    // render dashboard page for farmer
    res.render('farmer/dashboard', { farmer: savedFarmer });
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

exports.createProduct = async (req, res) => {
  try {
    const { farmerId, name, price, quantity } = req.body;

    // Check if farmer exists
    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Create new product
    const newProduct = new Product({
      name,
      price,
      quantity,
      farmer: farmerId
    });

    const savedProduct = await newProduct.save();

    // Add product to farmer's list of products
    farmer.products.push(savedProduct._id);
    await farmer.save();

    res.status(200).json({ 
      message: 'Product created successfully',
      product: savedProduct
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating product' });
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

The first function createAndVerifyFarmer creates a new farmer and saves the farmer's data in MongoDB. 
The function also sends an OTP to the farmer's phone, verifies the OTP, stores the farmer's data in a blockchain, 
and creates a new user for the farmer. The function returns a success message and the transaction ID generated by the blockchain.

The second function getFarmersAndDistributors retrieves a list of farmers and distributors based on a given zip code. 
It searches for farmers and distributors in the MongoDB collections Farmers and Distributors, respectively, 
whose address.zipcode matches the provided value. The function returns the list of farmers and distributors as a JSON object.

The third function createProduct creates a new product and associates it with an existing farmer. The function checks if the 
farmer exists in MongoDB, creates a new product with the provided details, saves the product in the Products collection, 
adds the product ID to the farmer.products array, and saves the farmer's data in MongoDB. The function returns a success message 
and the newly created product details.

Overall, these functions provide basic functionality for creating farmers, products, and users, and retrieving information about 
farmers and distributors based on location.*/