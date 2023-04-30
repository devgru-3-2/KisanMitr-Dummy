const Distribution = require('../models/distributionSchema');
const { sendDataToEthereumBlockchain } = require('../utils/blockchain');

// Get all distributions made by a specific distributor
exports.getDistributionsByDistributor = async (req, res) => {
  try {
    const distributions = await Distribution.find({ distributor: req.params.distributorId })
      .populate('farmer')
      .populate('product');
    res.json(distributions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a new distribution
exports.addDistribution = async (req, res) => {
  const distribution = new Distribution({
    distributor: req.body.distributorId,
    farmer: req.body.farmerId,
    product: req.body.productId,
    quantity: req.body.quantity,
    date: req.body.date
  });

  try {
    // Save data to MongoDB collection
    const newDistribution = await distribution.save();

    // Send data to Ethereum Blockchain
    const data = {
      distributorId: req.body.distributorId,
      farmerId: req.body.farmerId,
      productId: req.body.productId,
      quantity: req.body.quantity,
      date: req.body.date,
      transactionType: 'Distribution'
    };
    await sendDataToEthereumBlockchain(data);

    // Return the newly created distribution data
    res.status(201).json(newDistribution);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing distribution
exports.updateDistribution = async (req, res) => {
  try {
    const distribution = await Distribution.findById(req.params.id);
    if (distribution == null) {
      return res.status(404).json({ message: 'Distribution not found' });
    }

    if (req.body.distributorId != null) {
      distribution.distributor = req.body.distributorId;
    }
    if (req.body.farmerId != null) {
      distribution.farmer = req.body.farmerId;
    }
    if (req.body.productId != null) {
      distribution.product = req.body.productId;
    }
    if (req.body.quantity != null) {
      distribution.quantity = req.body.quantity;
    }
    if (req.body.date != null) {
      distribution.date = req.body.date;
    }

    // Save data to MongoDB collection
    const updatedDistribution = await distribution.save();

    // Send data to Ethereum Blockchain
    const data = {
      distributorId: req.body.distributorId || distribution.distributor,
      farmerId: req.body.farmerId || distribution.farmer,
      productId: req.body.productId || distribution.product,
      quantity: req.body.quantity || distribution.quantity,
      date: req.body.date || distribution.date,
      transactionType: 'Distribution'
    };
    await sendDataToEthereumBlockchain(data);

    // Return the updated distribution data
    res.json(updatedDistribution);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an existing distribution
exports.deleteDistribution = async (req, res) => {
  try {
    const distribution = await Distribution.findById(req.params.id);
    if (distribution == null) {
      return res.status(404).json({ message: 'Distribution not found' });
    }
    // Delete data from MongoDB collection
    await distribution.remove();

    // Send data to Ethereum Blockchain
    const data = {
        distributorId: distribution.distributor,
        farmerId: distribution.farmer,
        productId: distribution.product,
        quantity: distribution.quantity,
        date: distribution.date,
        transactionType: 'Distribution'
    };
    await sendDataToEthereumBlockchain(data);

    res.json({ message: 'Distribution deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
    
// Get the distribution details by ID
exports.getDistributionById = async (req, res) => {
    try {
        const distribution = await Distribution.findById(req.params.id)
        .populate('distributor')
        .populate('farmer')
        .populate('product');
        if (distribution == null) {
            return res.status(404).json({ message: 'Distribution not found' });
        }
        res.json(distribution);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

