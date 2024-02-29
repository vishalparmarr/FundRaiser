require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, './.env')});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia : {
      url: "https://sepolia.rpc.thirdweb.com",
      accounts: [process.env.PRIVATE_KEY]
    },
    hardhat: {
    }
  },
  etherscan: {
    apiKey: process.env.EtherScan_API,
  },
  
};
