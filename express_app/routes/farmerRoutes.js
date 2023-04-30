const express = require('express');
const router = express.Router();
const { createAndVerifyFarmer, verifyFarmerOTP } = require('../controllers/farmerController');

// render farmer registration form
router.get('/farmer-register', (req, res) => {
  res.render('farmer/farmer-register');
});

// handle farmer registration and send OTP
router.post('/farmer-register', createAndVerifyFarmer);

// render OTP verification form
router.get('/farmer-verify-otp', (req, res) => {
  res.render('farmer/farmer-verify-otp');
});

// handle OTP verification and save farmer data
router.post('/farmer-verify-otp', verifyFarmerOTP);

router.get('/farmer-dashboard', (req, res) => {
  res.render('farmer/farmer-dashboard');
});

router.post('/approvePurchaseRequest', (req, res) => {
  res.render('farmer/farmer-dashboard', { message: 'Purchase request approved' });
});



module.exports = router;
