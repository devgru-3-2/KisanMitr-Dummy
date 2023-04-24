const express = require('express');
const Web3 = require('web3');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const { contractABI, contractAddress } = require('./Contracts/user_contract.js');

const app = express();

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const infuraEndpoint = `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));

const myContract = new web3.eth.Contract(contractABI, contractAddress);

// Middleware to make the contract instance available to all routes
app.use((req, res, next) => {
  req.myContract = myContract;
  next();
});

const userRouter = require('./routers/userRouter');
app.use('/users', userRouter);

// Serve static files from the public folder
app.use(express.static('public'));

// Set up your routes and middleware here

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}`);
});
