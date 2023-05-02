const Farmer = require('../models/farmerSchema');
const Distributor = require('../models/distributorSchema');
const NodalAgency = require('../models/nodalAgencySchema');
const User = require('../models/userSchema');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const { sendOTP, verifyOTP } = require('./auth');

const store = new MongoDBStore({
  uri: 'mongodb+srv://asaprov:Iamneganyousob%40123@kisanmitr.ua2nz7t.mongodb.net/test',
  collection: 'sessions'
});

exports.sendLoginOTP = async (req, res) => {
  try {
    const { name, phone, role } = req.body;
    console.log(role);
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
    const verification = await sendOTP(phone);
    req.session.verificationSid = verification.sid; // store verification SID in session variable
    req.session.userDetails = { user, name, role }; // store user object in session variable 
    // save session
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
    console.log(req.session);
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
    const sid = req.session.verificationSid;
    const storeSession = await store.get(sid); // retrieve session from store using verification SID
    console.log(storeSession);
    if (!storeSession || !storeSession.userDetails) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { user, name, role } = storeSession.userDetails; // retrieve user role from session variable

    // verify OTP entered by user
    const verificationCheck = await verifyOTP(user.phone, otp);

    if (!verificationCheck.success) {
      return res.status(401).json({ message: verificationCheck.message });
    }

    // destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
    });

    // render dashboard page based on user's role
    switch (role) {
      case 'farmer':
        const farmer = await Farmer.findOne({ name: user.name });
        res.render('farmer/dashboard', { farmer });
        break;
      case 'distributor':
        const distributor = await Distributor.findOne({ name: user.name });
        res.render('distributor/dashboard', { distributor });
        break;
      case 'nodalAgency':
        const nodalAgency = await NodalAgency.findOne({ name: user.name });
        res.render('nodalAgency/dashboard', { nodalAgency });
        break;
      default:
        res.status(401).json({ message: 'Invalid user role' });
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying login OTP' });
  }
};


exports.logout = async (req, res) => {

  try {
    // destroy session
    req.session.destroy();
    console.log(req.session);
    // redirect to login page
    res.redirect('/login');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging out' });
  }
};


