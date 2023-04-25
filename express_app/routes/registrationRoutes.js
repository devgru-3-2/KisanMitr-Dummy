const express = require('express');
const app = express();
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Distributor = require('../models/Distributor');
const NodalAgency = require('../models/NodalAgency');

// Route for common registration page
app.get('/register', (req, res) => {
  res.render('register');
});

// Route for handling common registration form
app.post('/register', async (req, res) => {
  try {
    const { name, role } = req.body;

    // Determine which collection to add the user to
    let user;
    switch (role) {
      case 'Farmer':
        user = new Farmer({ name });
        break;
      case 'Distributor':
        user = new Distributor({ name });
        break;
      case 'NodalAgency':
        user = new NodalAgency({ name });
        break;
      default:
        user = new User({ name, role });
        break;
    }

    await user.save();
    res.redirect(`/register/${role.toLowerCase()}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding user' });
  }
});

// Route for farmer registration page
app.get('/register/farmer', (req, res) => {
  res.render('farmer-register');
});

// Route for handling farmer registration form
app.post('/register/farmer', async (req, res) => {
  try {
    const { name, phone, zipcode } = req.body;
    const farmer = new Farmer({ name, phone, zipcode });
    await farmer.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering farmer' });
  }
});

// Route for distributor registration page
app.get('/register/distributor', (req, res) => {
  res.render('distributor-register');
});

// Route for handling distributor registration form
app.post('/register/distributor', async (req, res) => {
  try {
    const { name, phone, zipcode } = req.body;
    const distributor = new Distributor({ name, phone, zipcode });
    await distributor.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering distributor' });
  }
});

// Route for nodal agency registration page
app.get('/register/nodal-agency', (req, res) => {
  res.render('nodal-agency-register');
});

// Route for handling nodal agency registration form
app.post('/register/nodal-agency', async (req, res) => {
  try {
    const { name, phone, zipcode } = req.body;
    const nodalAgency = new NodalAgency({ name, phone, zipcode });
    await nodalAgency.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering nodal agency' });
  }
});

module.exports = app;
