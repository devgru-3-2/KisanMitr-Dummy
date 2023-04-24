const Distributor = require('../models/distributorSchema');
const User = require('../models/userSchema');
const { sendOTP, verifyOTP } = require('./auth');
const { addToBlockchain } = require('../utils/blockchain');

exports.createDistributor = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // send OTP to distributor
    await sendOTP(req, res);

    // store distributor data in MongoDB
    const newDistributor = new Distributor({
      name,
      phone,
      address,
    });

    const savedDistributor = await newDistributor.save();

    // store distributor data in blockchain
    const data = { 
      name: savedDistributor.name, 
      phone: savedDistributor.phone, 
      address: savedDistributor.address 
    };
    const txid = await addToBlockchain('createDistributor', data);

    res.status(200).json({ 
      message: 'Distributor created successfully', 
      txid: txid
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating distributor' });
  }
};

exports.verifyDistributor = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // verify OTP
    await verifyOTP(req, res);

    // get distributor data from MongoDB
    const distributor = await Distributor.findOne({ phone });

    if (!distributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }

    // store distributor data in blockchain
    const data = { 
      name: distributor.name, 
      phone: distributor.phone, 
      address: distributor.address 
    };
    const txid = await addToBlockchain('verifyDistributor', data);

    // store user data in MongoDB
    const newUser = new User({
      name: distributor.name,
      role: 'distributor',
    });

    await newUser.save();

    res.status(200).json({ 
      message: 'Distributor verified successfully', 
      txid: txid 
    });

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

exports.updateDistributorById = async (req, res) => {
  try {
    const updatedDistributor = await Distributor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // store updated distributor data in blockchain
    const data = { 
      name: updatedDistributor.name, 
      phone: updatedDistributor.phone, 
      address: updatedDistributor.address 
    };
    const txid = await addToBlockchain('updateDistributor', data);

    res.status(200).json({ 
      message: 'Distributor updated successfully', 
      txid: txid 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating distributor' });
  }
};

exports.deleteDistributorById = async (req, res) => {
    try {
        const deletedDistributor = await Distributor.findByIdAndDelete(req.params.id);
        // delete distributor data from blockchain
        const data = { 
            name: deletedDistributor.name, 
            phone: deletedDistributor.phone, 
            address: deletedDistributor.address 
        };
        const txid = await addToBlockchain('deleteDistributor', data);
  
        res.status(200).json({ 
            message: 'Distributor deleted successfully', 
            txid: txid 
        });
  
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error deleting distributor' });
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


updateDistributorById: This function handles a PUT request to update a distributor's information in the MongoDB 
distributors collection. It extracts the ID from the request parameters, updates the corresponding Distributor object 
with the fields in the request body, stores its data in the blockchain using addToBlockchain, and responds with a success 
message and the transaction ID of the blockchain record.


deleteDistributorById: This function handles a DELETE request to delete a distributor from the MongoDB distributors 
collection. It extracts the ID from the request parameters, deletes the corresponding Distributor object using the 
findByIdAndDelete method, deletes its data from the blockchain using addToBlockchain, and responds with a success 
message and the transaction ID of the blockchain record.


Overall, this module implements the CRUD (create, read, update, delete) operations for distributors and provides 
additional functionality for verifying phone numbers with OTPs and storing data in a blockchain.

*/





