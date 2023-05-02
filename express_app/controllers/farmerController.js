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

    // Verify the OTP entered by the farmer
    const verificationCheck = await verifyOTP(req.session.phone, otp);

    if (!verificationCheck.success) {
      return res.status(401).json({ message: verificationCheck.message });
    }

    // Save the farmer data in MongoDB
    const newFarmer = new Farmer(req.session.farmerDetails);
    const savedFarmer = await newFarmer.save();

    // Save the user data in MongoDB
    const newUser = new User({
      name: savedFarmer.name,
      role: 'farmer',
    });
    await newUser.save();

    // Add the farmer data to the blockchain
    //await addToBlockchain(savedFarmer);

    // Set up the session with the user information
    req.session.user = {
      _id: savedFarmer._id,
      name: savedFarmer.name,
      role: 'farmer',
    };

    // Redirect to the dashboard page
    res.redirect("/farmer/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying farmer' });
  }
};


exports.getFarmerDashboard = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.session.user) {
      return res.redirect('/login');
    }

    // Retrieve the user ID from the session
    const userId = req.session.user._id;

    const farmer = await Farmer.findById(userId).populate('products');

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    res.render('farmer/dashboard', { farmer: req.session.farmer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting farmer dashboard' });
  }
};



exports.getFarmersAndDistributors = async (req, res) => {
  try {
    const { zipcode } = req.params;

    // Find farmers and distributors based on zipcode
    const farmers = await Farmer.find({ "address.zipcode": zipcode })
    const distributors = await Distributor.find({ "address.zipcode": zipcode })

    // Render the dashboard template with the farmers and distributors data
    res.render('dashboard', { farmer: req.user, farmers, distributors });

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

    res.redirect('/farmer/dashboard');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating product' });
  }
};


exports.approvePurchaseRequest = async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId).populate('farmer');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product status is 'pending'
    if (product.status !== 'pending') {
      return res.status(400).json({ message: 'Product is not pending' });
    }

    // Update product status to 'sold'
    product.status = 'sold';
    product.purchaseRequest = null;
    await product.save();

    // Send SMS notification to distributor
    const message = `Your purchase request for product ${product.name} with ID ${product._id} has been approved by ${product.farmer.name}`;
    await sendSMS(product.purchaseRequest.distributor.phone, message);

    res.redirect('/farmer/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving purchase request' });
  }
};


  


/*

This file contains the controller functions for handling the routes related to the farmer's activities. 
The functions defined in this file are:

createAndVerifyFarmer: This function receives a POST request containing the farmer's details (name, phone, and zipcode), 
sends an OTP to the farmer's phone number, stores the verification SID in the session variable, and redirects the farmer 
to the OTP verification page.

verifyFarmerOTP: This function receives a POST request containing the OTP entered by the farmer, verifies the OTP with 
the Twilio API, saves the farmer's and user's data in the database, removes the session variables, and renders the farmer's 
dashboard page.

getFarmerDashboard: This function receives a GET request, finds the farmer's data using the farmer's ID from the request's 
user object, populates the farmer's products array, and renders the farmer's dashboard page with the farmer's and product's data.

getFarmersAndDistributors: This function receives a GET request with a zipcode parameter, finds the farmers and distributors 
with that zipcode, and renders the dashboard page with the farmer's and farmers' and distributors' data.

createProduct: This function receives a POST request containing the product's details (farmerId, name, price, and quantity), 
creates a new product, saves it to the database, adds the product's ID to the farmer's products array, saves the farmer's data 
to the database, and redirects the user to the farmer's dashboard page.

approvePurchaseRequest: This function receives a POST request containing the product's ID, checks if the product exists and 
its status is "pending," updates the product's status to "sold," sends an SMS notification to the distributor, and sends a 
response with a success message.

This file requires the following modules:

express: Node.js web application framework for creating HTTP servers and handling HTTP requests and responses.
express-session: middleware for managing sessions in Express.js.
farmerSchema: a mongoose schema model for the farmer's data.
distributorSchema: a mongoose schema model for the distributor's data.
userSchema: a mongoose schema model for the user's data.
productSchema: a mongoose schema model for the product's data.
sendOTP: a function from the auth.js file that sends an OTP to the farmer's phone number using the Twilio API.
verifyOTP: a function from the auth.js file that verifies the OTP entered by the farmer using the Twilio API.
addToBlockchain: a function from the utils/blockchain.js file that adds the farmer's data to the blockchain.
*/