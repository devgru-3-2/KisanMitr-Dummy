const Farmer = require('../models/farmerSchema');
const Distributor = require('../models/distributorSchema');
const NodalAgency = require('../models/nodalAgencySchema');
const session = require('express-session');
const { sendOTP, verifyOTP } = require('./auth');

exports.sendLoginOTP = async (req, res) => {
  try {
    const { name, role } = req.body;

    let user;
    let userSchema;

    // Get user with the given name and role from MongoDB
    if (role === 'farmer') {
      userSchema = Farmer;
    } else if (role === 'distributor') {
      userSchema = Distributor;
    } else if (role === 'nodalAgency') {
      userSchema = NodalAgency;
    } else {
      return res.status(401).json({ message: 'Invalid user role' });
    }

    user = await userSchema.findOne({ name });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid name or role' });
    }

    // send OTP to user
    const verification = await sendOTP(user.phone);
    req.session.verificationSid = verification.sid; // store verification SID in session variable
    req.session.user = user; // store user object in session variable

    // render OTP verification page
    res.render('login-verify-otp', { user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending login OTP' });
  }
};

exports.verifyLoginOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!req.session.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = req.session.user;

    // verify OTP entered by user
    const verificationCheck = await verifyOTP(user.phone, otp);

    if (!verificationCheck.success) {
      return res.status(401).json({ message: verificationCheck.message });
    }

    // remove session variables
    delete req.session.verificationSid;
    delete req.session.user;

    // render dashboard page
    if (user.role === 'farmer') {
      const farmer = await Farmer.findOne({ name: user.name });
      res.render('farmer/dashboard', { farmer });
    } else if (user.role === 'distributor') {
      const distributor = await Distributor.findOne({ name: user.name });
      res.render('distributor/dashboard', { distributor });
    } else if (user.role === 'nodalAgency') {
      const nodalAgency = await NodalAgency.findOne({ name: user.name });
      res.render('nodal-agency/dashboard', { nodalAgency });
    } else {
      res.status(401).json({ message: 'Invalid user role' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying login OTP' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};
