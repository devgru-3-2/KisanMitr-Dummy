const Distributor = require('../models/distributorSchema');
const User = require('../models/userSchema');
const Farmer = require('../models/farmerSchema');
const Product = require('../models/productSchema');
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


exports.getDistributors = async (req, res) => {
  try {
    const distributors = await Distributor.find({});
    res.status(200).json(distributors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting distributors' });
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

    

/*This is a JavaScript module named distributorController.js. It exports several functions that handle 
HTTP requests and responses related to the management of distributors, which are entities that represent 
suppliers in a supply chain system.

The module starts by importing three dependencies: Distributor and User from the ../models directory, and 
sendOTP and verifyOTP from the ./auth module. Distributor and User are Mongoose models for MongoDB collections 
that store information about distributors and users, respectively. sendOTP and verifyOTP are functions that 
handle the process of sending and verifying OTPs (one-time passwords) for phone number authentication.


The module exports the following functions:

createDistributor: This function handles a POST request to create a new distributor. It extracts the name, 
phone, and address fields from the request body, sends an OTP to the specified phone number, creates a new 
Distributor object with the extracted fields, saves it to the MongoDB distributors collection, and stores 
its data in the blockchain using the addToBlockchain function from the ../utils/blockchain module. It responds
 with a success message and the transaction ID of the blockchain record.



verifyDistributor: This function handles a POST request to verify a distributor's phone number with an OTP. 
It extracts the phone and OTP fields from the request body, verifies the OTP using the verifyOTP function, 
retrieves the corresponding Distributor object from the MongoDB collection, stores its data in the blockchain 
using addToBlockchain, creates a new User object with the distributor's name and the role "distributor", saves 
it to the users collection, and responds with a success message and the transaction ID of the blockchain record.


getDistributors: This function handles a GET request to retrieve all the distributors in the MongoDB distributors 
collection. It retrieves all the Distributor objects using the find method and responds with an array of the retrieved objects.


getDistributorById: This function handles a GET request to retrieve a distributor by ID from the MongoDB distributors 
collection. It extracts the ID from the request parameters, retrieves the corresponding Distributor object using the 
findById method, and responds with the retrieved object.

Overall, this module implements the CRUD (create, read, update, delete) operations for distributors and provides 
additional functionality for verifying phone numbers with OTPs and storing data in a blockchain.

*/





