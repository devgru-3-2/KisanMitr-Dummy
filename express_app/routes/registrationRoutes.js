const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createAndVerifyFarmer, verifyFarmerOTP } = require('../controllers/farmerController');
const { createAndVerifyDistributor, verifyDistributorOTP } = require('../controllers/distributorController');

// GET request for retrieving the registration form
router.get('/register', (req, res) => {
  res.render('register');
});

// POST request for submitting the registration form
router.post('/register', userController.addUser);

// render farmer registration form
router.get('/farmer/farmer-register', (req, res) => {
  res.render('farmer/farmer-register');
});

// handle farmer registration and send OTP
router.post('/farmer/farmer-register', createAndVerifyFarmer);

// render OTP verification form
router.get('/farmer/farmer-verify-otp', (req, res) => {
  res.render('farmer/farmer-verify-otp');
});

// handle OTP verification and save farmer data
router.post('/farmer/farmer-verify-otp', verifyFarmerOTP);

// render distributor registration form
router.get('/distributor-register', (req, res) => {
  res.render('distributor/distributor-register');
});

// handle distributor registration and send OTP
router.post('/distributor/distributor-register', createAndVerifyDistributor);

// render OTP verification form
router.get('/distributor-verify-otp', (req, res) => {
  res.render('distributor/distributor-verify-otp');
});

// handle OTP verification and save distributor data
router.post('/distributor/distributor-verify-otp', verifyDistributorOTP);

// GET request for retrieving the nodal agency registration form
router.get('/nodalagency-register', (req, res) => {
  res.render('nodalAgency/nodalagency-register');
});

// Redirect to /register if role is not specified
router.get('/:role', (req, res) => {
  const { role } = req.params;
  if (role !== 'farmer' && role !== 'distributor' && role !== 'nodalagency') {
    res.redirect('/register');
  } else {
    res.redirect(`/${role}-register`);
  }
});

module.exports = router;
