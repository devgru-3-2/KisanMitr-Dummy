const Web3 = require('web3');
require('dotenv').config();

const web3 = new Web3(new Web3.providers.HttpProvider(`https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`));



// Set up the contract ABI and address
//const contractABI = ... // Define the contract ABI
//const contractAddress = ... // Define the contract address
//const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to add data to the blockchain
async function addToBlockchain(data) {
  // Get the private key for the wallet
  const privateKey = Buffer.from('YOUR_PRIVATE_KEY', 'hex');
  
  // Get the current nonce for the wallet
  const nonce = await web3.eth.getTransactionCount('YOUR_WALLET_ADDRESS', 'pending');
  
  // Create a new transaction object
  const transactionObject = {
    from: 'YOUR_WALLET_ADDRESS',
    to: contractAddress,
    nonce: web3.utils.toHex(nonce),
    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
    gasLimit: web3.utils.toHex(600000),
    data: contract.methods.addData(data).encodeABI()
  };
  
  // Sign the transaction with the private key
  const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
  
  // Send the signed transaction to the network
  const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  
  return receipt.transactionHash;
}

// Example function to add user data to the blockchain
async function addUserToBlockchain(data) {
  const transactionHash = await addToBlockchain(data);
  console.log('User added to blockchain. Transaction hash:', transactionHash);
}

// Example function to add distribution data to the blockchain
async function addDistributionToBlockchain(data) {
  const transactionHash = await addToBlockchain(data);
  console.log('Distribution added to blockchain. Transaction hash:', transactionHash);
}

// Example function to add procurement data to the blockchain
async function addProcurementToBlockchain(data) {
  const transactionHash = await addToBlockchain(data);
  console.log('Procurement added to blockchain. Transaction hash:', transactionHash);
}
