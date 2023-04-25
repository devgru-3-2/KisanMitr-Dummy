const Product = require('../models/productSchema');
const Farmer = require('../models/farmerSchema');
const Distributor = require('../models/distributorSchema');
const NodalAgency = require('../models/nodalAgencySchema');
const User = require('../models/userSchema');
const { sendSMS } = require('../utils/sms');

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

exports.getProductsByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Check if farmer exists
    const farmer = await Farmer.findById(farmerId);

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Find products by farmer ID
    const products = await Product.find({ farmer: farmerId });

    res.status(200).json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting products by farmer' });
  }
};

exports.purchaseProduct = async (req, res) => {
  try {
    const { productId, distributorId, zipcode } = req.body;

    // Check if distributor exists
    const distributor = await Distributor.findById(distributorId);

    if (!distributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is available
    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is not available' });
    }

    // Update product status to sold and add distributor and zipcode
    product.status = 'sold';
    product.distributor = distributorId;
    product.purchaseRequest = {
      distributor: distributorId,
      zipcode: zipcode
    };

    await product.save();

    // Send SMS notification to farmer
    const farmer = await Farmer.findById(product.farmer);
    const message = `Your product ${product.name} with ID ${product._id} has been sold to ${distributor.name} in ${zipcode}`;
    await sendSMS(farmer.phone, message);

    // Send SMS notification to distributor
    const distributorMessage = `Your purchase request for product ${product.name} with ID ${product._id} has been approved`;
    await sendSMS(distributor.phone, distributorMessage);

    res.status(200).json({ message: 'Product sold successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error purchasing product' });
    }
};

exports.approvePurchaseRequest = async (req, res) => {
    try {
    const { productId, nodalAgencyId } = req.body;
    // Check if nodal agency exists
    const nodalAgency = await NodalAgency.findById(nodalAgencyId);

    if (!nodalAgency) {
        return res.status(404).json({ message: 'Nodal agency not found' });
    }

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product status is 'pending'
    if (product.status !== 'pending') {
        return res.status(400).json({ message: 'Product is not pending' });
    }

    // Update product status to 'available'
    product.status = 'available';
    await product.save();

    // Send SMS notification to distributor
    const distributor = await Distributor.findById(product.distributor);
    const message = `Your purchase request for product ${product.name} with ID ${product._id} has been approved by ${nodalAgency.name}`;
    await sendSMS(distributor.phone, message);

    res.status(200).json({ message: 'Purchase request approved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error approving purchase request' });
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

        // Find products by distributor ID
        const products = await Product.find({ distributor: distributorId });

        res.status(200).json(products);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting products by distributor' });
    }
};

            
exports.getProductsByNodalAgency = async (req, res) => {
    try {
        const { nodalAgencyId } = req.params;
        // Check if nodal agency exists
        const nodalAgency = await NodalAgency.findById(nodalAgencyId);

        if (!nodalAgency) {
            return res.status(404).json({ message: 'Nodal agency not found' });
        }

        // Find products by nodal agency ID
        const products = await Product.find({ 'purchaseRequest.nodalAgency': nodalAgencyId });

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting products by nodal agency' });
    }
};
        
exports.getProductsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        // Check if user exists
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find products by user ID
        const products = await Product.find({ $or: [
        { farmer: user._id },
        { distributor: user._id },
        { 'purchaseRequest.nodalAgency': user._id }
    ]});

    res.status(200).json(products);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error getting products by user' });

    }
};







