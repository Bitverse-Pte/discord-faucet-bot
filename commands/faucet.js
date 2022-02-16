const { findOrCreate, findOneAndUpdate } = require("../utilities/db.js");
const fetch = require("node-fetch")
const ObjectId = require('mongoose').Types.ObjectId;
const dotenv = require('dotenv').config();
const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider(process.env.CHAIN_RPC_URL);
const private_key = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(private_key)
const walletSigner = wallet.connect(provider)
const send_account = wallet.address

// const apiKey = process.env.FAUCET_KEY
// TODO: handle pending tx
// let pendingNonce = 0;

async function getBalance() {
  try {
    const balance = await provider.getBalance(send_account);
    return ethers.utils.formatEther(balance.toString());
  }
  catch (error) {
    console.log(error);
  }
}

async function sendDropTo(to_address) {
  try {
    const currentGasPrice = await provider.getGasPrice();
    const gas_limit = 21000;
    const send_token_amount = '2';
    const tx_params = {
        from: send_account,
        to: to_address,
        value: ethers.utils.parseEther(send_token_amount),
        nonce: provider.getTransactionCount(send_account, 'latest'),
        gasLimit: ethers.utils.hexlify(gas_limit), // 100000
        gasPrice: ethers.utils.hexlify(parseInt(currentGasPrice)),
    }
    const tx = await walletSigner.sendTransaction(tx_params);
    return tx;
  }
  catch (error) {
    console.log(error);
  }
}

module.exports = {
  getBalance,
  sendDropTo
};
