const express = require('express');
const router = express.Router();

const { createAndVerifyDistributor, 
    verifyDistributorOTP, 
    getDistributorDashboard, 
    getDistributorProcurements,
    getProductsByZipcode, 
    purchaseProduct 
    } = require('../controllers/distributorController');


// render distributor registration form
router.get('/distributor/register', (req, res) => {
    res.render('distributor/distributor-register');
});
  
// handle distributor registration and send OTP
router.post('/distributor/register', createAndVerifyDistributor);
  
// render OTP verification form
router.get('/distributor/verify-otp', (req, res) => {
    res.render('distributor/distributor-verify-otp');
});
  
// handle OTP verification and save distributor data
router.post('/distributor/verify-otp', verifyDistributorOTP);

// GET request for retrieving the distributor dashboard
router.get('/distributor/dashboard', getDistributorDashboard);

router.post('/purchase', purchaseProduct);

router.get('/distributor/procurements', getDistributorProcurements);

router.get('/distributor/products', getProductsByZipcode);

module.exports = router;
