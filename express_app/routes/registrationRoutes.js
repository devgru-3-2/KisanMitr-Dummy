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
