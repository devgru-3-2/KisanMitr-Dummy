  const express = require('express');
  const router = express.Router();
  const bodyparser = require('body-parser');
  const Farmer = require('../models/farmerSchema');
  const Product = require('../models/productSchema');
  const User = require('../models/userSchema');
  const session = require('express-session');

  const { createAndVerifyFarmer, verifyFarmerOTP, createProduct, approvePurchaseRequest, getFarmerDashboard } = require('../controllers/farmerController');

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


  router.get("/farmer/dashboard", getFarmerDashboard);



  // create product
  router.post('/createProduct', createProduct);

  // handle purchase request approval
  router.post('/farmer/approvePurchaseRequest', approvePurchaseRequest);

  module.exports = router;
