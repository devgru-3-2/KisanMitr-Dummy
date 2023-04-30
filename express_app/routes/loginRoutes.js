const express = require('express');
const router = express.Router();
const { sendLoginOTP, verifyLoginOTP, logout} = require('../controllers/login');

// GET request to render the login page
router.get('/', (req, res) => {
  res.render('login');
});
// POST request to send OTP to user's phone and render OTP verification page
router.post('/', sendLoginOTP, (req, res) => {
  res.render('login-verify-otp', { phone: req.body.phone, userType: req.body.userType });
});

// POST request to verify OTP and log user in
router.post('/login/verifyOTP', verifyLoginOTP);

router.post('/logout', logout);


module.exports = router;

