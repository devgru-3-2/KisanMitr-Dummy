const express = require('express');
const Web3 = require('web3');
const mongoose = require('mongoose');

const app = express();

const MyContractABI = require('./Contracts/MyContractABI.json');
const contractAddress = '0x1234567890abcdef...'; // replace with your actual contract address

const infuraProjectId = process.env.INFURA_PROJECT_ID;


const infuraEndpoint = `https://goerli.infura.io/v3/${infuraProjectId}`;
const web3 = new Web3(new Web3.providers.HttpProvider(infuraEndpoint));


const myContract = new web3.eth.Contract(MyContractABI, contractAddress);



const userRouter = require('./routers/userRouter');
app.use('/users', userRouter);

const authRouter = require('./express_app/routers/auth');
app.use('/auth', authRouter);




// set up your routes and middleware here
