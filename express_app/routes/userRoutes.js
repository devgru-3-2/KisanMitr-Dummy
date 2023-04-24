// Require the necessary modules
const express = require('express');
const router = express.Router();

// Require the controllers for each collection
const userController = require('../controllers/userController');
const farmerController = require('../controllers/farmerController');
const distributorController = require('../controllers/distributorController');
const distributionController = require('../controllers/distributionController');
const procurementController = require('../controllers/procurementController');

// Set up the routes for each collection
router.get('/users', userController.getUsers);
router.get('/farmers', farmerController.getFarmers);
router.get('/distributors', distributorController.getDistributors);
router.get('/distributions', distributionController.getDistributions);
router.get('/procurements', procurementController.getProcurements);

router.post('/users', userController.addUser);
router.post('/farmers', farmerController.addFarmer);
router.post('/distributors', distributorController.addDistributor);
router.post('/distributions', distributionController.addDistribution);
router.post('/procurements', procurementController.addProcurement);

router.put('/users/:id', userController.updateUser);
router.put('/farmers/:id', farmerController.updateFarmer);
router.put('/distributors/:id', distributorController.updateDistributor);
router.put('/distributions/:id', distributionController.updateDistribution);
router.put('/procurements/:id', procurementController.updateProcurement);

router.delete('/users/:id', userController.deleteUser);
router.delete('/farmers/:id', farmerController.deleteFarmer);
router.delete('/distributors/:id', distributorController.deleteDistributor);
router.delete('/distributions/:id', distributionController.deleteDistribution);
router.delete('/procurements/:id', procurementController.deleteProcurement);

// Export the router
module.exports = router;
