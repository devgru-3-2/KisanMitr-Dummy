const express = require('express');
const router = express.Router();
const { addUser } = require('../controllers/userController');
const { createAndVerifyFarmer, verifyFarmerOTP } = require('../controllers/farmerController');
const { createAndVerifyDistributor, verifyDistributorOTP } = require('../controllers/distributorController');

// GET request for retrieving the registration form
router.get('/', (req, res) => {
  res.render('register');
});

// POST request for submitting the registration form
router.post('/', addUser);


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

// GET request for retrieving the nodal agency registration form
router.get('/nodal-agency/register', (req, res) => {
  res.render('nodalAgency/nodalAgency-register');
});

// Redirect to /register if role is not specified
router.get('/:role/register', (req, res) => {
  const { role } = req.params;
  if (role !== 'farmer' && role !== 'distributor' && role !== 'nodal-agency') {
    res.redirect('/register');
  } else {
    res.redirect(`/${role}/register`);
  }
});

module.exports = router;
