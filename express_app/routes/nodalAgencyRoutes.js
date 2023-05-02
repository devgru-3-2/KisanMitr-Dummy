const express = require('express');
const router = express.Router();
const nodalAgencyController = require('../controllers/nodalAgencyController');



// GET request for retrieving the nodal agency registration form
router.get('/nodal-agency/register', (req, res) => {
    res.render('nodalAgency/nodalAgency-register');
  });

// POST request for submitting the nodal agency registration form
router.post('/nodalAgency/nodalAgency-register', nodalAgencyController.createAndVerifyNodalAgency);

// GET request for rendering the nodal agency registration otp form
router.get('/nodalAgency/nodalAgency-verify-otp', (req, res) => {
    res.render('nodalAgency/nodalAgency-verify-otp');
});

// POST request for submitting the nodal agency registration otp form
router.post('/nodalAgency/nodalAgency-verify-otp', nodalAgencyController.verifyNodalAgencyOTP);

// GET request for rendering the nodal agency dashboard
router.get('/nodalAgency/dashboard', (req, res) => {
    res.render('nodalAgency/dashboard');
});



// POST request for submitting the log procurement form
router.post('/nodal-agency/procurements',nodalAgencyController.logProcurement);


// POST request for submitting the Get Zipcode Data form
router.post('/nodal-agency/zipcodes',nodalAgencyController.getZipcodeData);


// POST request for submitting the Get Products By Distributor form
router.post('/nodal-agency/products',nodalAgencyController.getProductsByDistributor);


module.exports = router;
