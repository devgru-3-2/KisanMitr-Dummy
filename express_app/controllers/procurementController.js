const Procurement = require('../models/procurementSchema');
const { sendDataToEthereumBlockchain } = require('../utils/blockchain');

// Get all procurements made by a specific distributor
exports.getProcurementsByDistributor = async (req, res) => {
  try {
    const procurements = await Procurement.find({ distributor: req.params.distributorId })
      .populate('product');
    res.json(procurements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new procurement
exports.addProcurement = async (req, res) => {
  const procurement = new Procurement({
    distributor: req.body.distributorId,
    product: req.body.productId,
    quantity: req.body.quantity,
    date: req.body.date
  });

  try {
    // Save data to MongoDB collection
    const newProcurement = await procurement.save();

    // Send data to Ethereum Blockchain
    const data = {
      distributorId: req.body.distributorId,
      productId: req.body.productId,
      quantity: req.body.quantity,
      date: req.body.date,
      transactionType: 'Procurement'
    };
    await sendDataToEthereumBlockchain(data);

    // Return the newly created procurement data
    res.status(201).json(newProcurement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing procurement
exports.updateProcurement = async (req, res) => {
  try {
    const procurement = await Procurement.findById(req.params.id);
    if (procurement == null) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    if (req.body.distributorId != null) {
      procurement.distributor = req.body.distributorId;
    }
    if (req.body.productId != null) {
      procurement.product = req.body.productId;
    }
    if (req.body.quantity != null) {
      procurement.quantity = req.body.quantity;
    }
    if (req.body.date != null) {
      procurement.date = req.body.date;
    }

    // Save data to MongoDB collection
    const updatedProcurement = await procurement.save();

    // Send data to Ethereum Blockchain
    const data = {
      distributorId: req.body.distributorId || procurement.distributor,
      productId: req.body.productId || procurement.product,
      quantity: req.body.quantity || procurement.quantity,
      date: req.body.date || procurement.date,
      transactionType: 'Procurement'
    };
    await sendDataToEthereumBlockchain(data);

    // Return the updated procurement data
    res.json(updatedProcurement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an existing procurement
exports.deleteProcurement = async (req, res) => {
  try {
    const procurement = await Procurement.findById(req.params.id);
    if (procurement == null) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    // Delete the procurement from the MongoDB collection
    await procurement.remove();

    // Send data to Ethereum Blockchain
    const data = {
      distributorId: procurement.distributor,
      productId: procurement.product,
      quantity: procurement.quantity,
      date: procurement.date,
      transactionType: 'Delete Procurement'
    };
    await sendDataToEthereumBlockchain(data);

    // Return the deleted procurement data
    res.json(procurement);  

    } catch (err) {

        res.status(500).json({ message: err.message });
    }

};

/*This is a Node.js module that exports several functions related to managing procurements.

The first function getProcurementsByDistributor fetches all procurements made by a specific distributor. 
It accepts a distributorId as a parameter in the URL and returns the matching procurements from the database.

The second function addProcurement creates a new procurement in the MongoDB database. It accepts a JSON object 
in the request body containing the distributorId, productId, quantity, and date of the procurement. 
It creates a new Procurement document and saves it to the database. Then it sends the same data to an Ethereum 
blockchain network using the sendDataToEthereumBlockchain function from the blockchain module. Finally, 
it returns the newly created procurement object.

The third function updateProcurement updates an existing procurement in the MongoDB database. It accepts a JSON object 
in the request body containing the new distributorId, productId, quantity, and date values. It finds the procurement 
by its ID, updates the values, and saves the changes to the database. Then it sends the updated data to the Ethereum 
blockchain network using the sendDataToEthereumBlockchain function. Finally, it returns the updated procurement object.

The fourth function deleteProcurement deletes an existing procurement from the MongoDB database. It accepts a procurement 
ID in the URL, finds the procurement by its ID, and removes it from the database. Then it sends the same data to the Ethereum 
blockchain network using the sendDataToEthereumBlockchain function. Finally, it returns the deleted procurement object.

All of these functions handle errors by returning an appropriate HTTP status code and error message in JSON format.*/