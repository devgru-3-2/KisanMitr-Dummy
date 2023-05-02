const Distributor = require('../models/distributorSchema');
const User = require('../models/userSchema');
const Farmer = require('../models/farmerSchema');
const Product = require('../models/productSchema');
const Procurement = require('../models/procurementSchema');
const nodalAgency = require('../models/nodalAgencySchema');
const { sendOTP, verifyOTP } = require('./auth');
const { addToBlockchain } = require('../utils/blockchain');
/*const twilio = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);*/

exports.createAndVerifyDistributor = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const phoneNumber = "+91" + phone;

    // send OTP to distributor
    const verification = await sendOTP(req, phoneNumber);
    req.session.verificationSid = verification.sid; // store verification SID in session variable
    req.session.distributorDetails = { name, phoneNumber, address }; // store distributor details in session variable

    // redirect distributor to OTP verification page
    res.redirect('/distributor-verify-otp');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating and verifying distributor' });
  }
};

exports.verifyDistributorOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { verificationSid, distributorDetails } = req.session;

    // verify OTP entered by distributor
    const verificationCheck = await verifyOTP(req, verificationSid, otp);

    if (verificationCheck.status !== 'approved') {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // store distributor data in MongoDB
    const newDistributor = new Distributor(distributorDetails);
    const savedDistributor = await newDistributor.save();

    // store user data in MongoDB
    const newUser = new User({
      name: savedDistributor.name,
      role: 'distributor',
    });
    await newUser.save();

    // remove session variables
    delete req.session.verificationSid;
    delete req.session.distributorDetails;

    // render dashboard page for distributor
    res.render('distributor/dashboard', { distributor: savedDistributor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying distributor' });
  }
};


exports.getDistributorDashboard = async (req, res) => {
  try {
    const distributorId = req.user._id;

    const [distributor, products, farmers, purchasedProducts, procurements] = await Promise.all([
      Distributor.findById(distributorId),
      Product.find({ distributors: distributorId }),
      Farmer.find(),
      Product.find({ purchasers: distributorId }),
      Procurement.find({ distributor: distributorId }).populate('nodalAgency').populate('product'),
    ]);

    res.render('dashboard', { distributor, products, farmers, purchasedProducts, procurements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching distributor dashboard' });
  }
};

exports.getDistributors = async (req, res) => {
  try {
    const distributors = await Distributor.find({});
    res.status(200).json(distributors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting distributors' });
  }
};

exports.getDistributorProcurements = async (req, res) => {
  try {
    const distributorId = req.params.id;
    const distributor = await Distributor.findById(distributorId).populate('procurements');

    res.render('distributor/procurements', { procurements: distributor.procurements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting distributor procurements' });
  }
};


exports.getDistributorById = async (req, res) => {
  try {
    const distributor = await Distributor.findById(req.params.id);
    res.status(200).json(distributor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting distributor' });
  }
};


/*Now, when a distributor queries for farmers and products based on the zipcode, 
we can return all the available products in addition to the farmers. We can also populate the 
farmer field of the product with the corresponding farmer object, so that the distributor can see 
the details of the farmer associated with the product. The modified getFarmersAndDistributors function will look like this:*/


exports.getFarmersAndDistributors = async (req, res) => {
  try {
    const { zipcode } = req.params;

    // Find farmers and distributors based on zipcode
    const farmers = await Farmer.find({ "address.zipcode": zipcode })
    const distributors = await Distributor.find({ "address.zipcode": zipcode })

    // Find all available products based on zipcode
    const products = await Product.find({ 
      "farmer.address.zipcode": zipcode, 
      status: 'available' 
    }).populate('farmer', '-_id name phone address');

    res.status(200).json({ farmers, distributors, products });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting farmers and distributors' });
  }
};


/*This function accepts two query parameters: zipcode and productName. If productName is provided, 
the function adds a new filter to find products by name. The $regex operator is used to perform a 
case-insensitive search for products that contain the provided string in their name. If productName 
is not provided, the function only filters products by zipcode.*/

exports.getProductsByZipcode = async (req, res) => {
  try {
    const { zipcode, productName } = req.query;

    const filter = {
      "farmer.address.zipcode": zipcode,
      status: 'available'
    };

    if (productName) {
      filter.name = { $regex: productName, $options: 'i' };
    }

    // Find products based on filter
    const products = await Product.find(filter).populate('farmer');

    res.status(200).json({ products });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting products by zipcode' });
  }
};




/*Now, when a distributor sends a purchase request for a product, we can update the distributor 
field of the product with the corresponding distributor object and set its status to "sold". 
We can also notify the farmer about the purchase request. The modified purchaseProduct function will look like this:*/

exports.purchaseProduct = async (req, res) => {
  try {
    const { productId, distributorId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId).populate('farmer');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Check if distributor exists
    const distributor = await Distributor.findById(distributorId);
    if (!distributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }
    
    // Update product status to 'sold'
    product.status = 'sold';
    product.distributor = distributorId;
    await product.save();
    
    // Add product to distributor's list of purchased products
    distributor.purchasedProducts.push(productId);
    await distributor.save();
    
    // Send SMS notification to farmer
    const farmer = product.farmer;
    const message = `Your product '${product.name}' has been sold to ${distributor.name} with the zipcode ${distributor.address.zipcode}.`;
    twilio.messages.create({
      to: farmer.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message
    });

    res.status(200).json({ message: 'Product purchased successfully', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error purchasing product' });
    }
    
};

    

/*

Documentation for distributorController.js:

This module exports several functions that manage and control the operations of the distributor entity in the application.

createAndVerifyDistributor(req, res): This function is an asynchronous function that accepts an HTTP request and response 
objects as parameters. It creates a new distributor by sending an OTP to the provided phone number for verification purposes. 
It then stores the verification SID and distributor details in the session variable and redirects the user to the distributor 
OTP verification page.

verifyDistributorOTP(req, res): This function is an asynchronous function that accepts an HTTP request and response objects as 
parameters. It verifies the OTP entered by the distributor against the stored SID in the session variable. If the OTP is valid, 
it creates a new distributor record in the database, stores user details, and renders the distributor dashboard.

getDistributorDashboard(req, res): This function is an asynchronous function that accepts an HTTP request and response objects 
as parameters. It retrieves the distributor's dashboard and renders it with details of the products, farmers, procurements, and 
purchased products associated with the distributor.

getDistributors(req, res): This function is an asynchronous function that accepts an HTTP request and response objects as parameters. 
It retrieves all the distributors' records from the database and returns them as a JSON response.

getDistributorProcurements(req, res): This function is an asynchronous function that accepts an HTTP request and response objects as 
parameters. It retrieves a specific distributor's procurement records from the database and renders them on the 
distributor/procurements view.

getDistributorById(req, res): This function is an asynchronous function that accepts an HTTP request and response objects as 
parameters. It retrieves a specific distributor's record from the database based on the provided ID and returns it as a JSON response.

getFarmersAndDistributors(req, res): This function is an asynchronous function that accepts an HTTP request and response objects as 
parameters. It retrieves all farmers and distributors' records based on the provided zipcode query parameter. It also retrieves all 
the available products associated with the farmers in that zipcode. If the productName query parameter is provided, the function 
filters the products by name using the $regex operator. The function returns the retrieved records as a JSON response.

The module imports some models and utility functions to implement these operations. The imported models are Distributor, User, 
Farmer, Product, and Procurement. The imported utility functions are sendOTP and verifyOTP from the auth module and addToBlockchain 
from the blockchain module.

*/





