const express = require('express');
const Web3 = require('web3');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = express();

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const infuraEndpoint = `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));

// Middleware to make the web3 and contract instances available to all routes
app.use((req, res, next) => {
  req.web3 = web3;
  req.contractABI = contractABI;
  req.contractAddress = contractAddress;
  next();
});

// Import and use userRoutes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// Import and use nodalAgencyRoutes
const nodalAgencyRoutes = require('./routes/nodalAgencyRoutes');
app.use('/nodal-agencies', nodalAgencyRoutes);

// Serve static files from the public folder
app.use(express.static('public'));

// Set up your routes and middleware here

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}`);
});
