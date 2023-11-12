require("dotenv").config();

module.exports = {
  solidity: {
    version: '0.8.21',
    defaultNetwork: 'BNB Smart Chain Testnet',
    networks: {
      hardhat: {},
      BinanceSmartChainTestnet: {
        url: 'https://endpoints.omniatech.io/v1/bsc/testnet/public',
        accounts: [process.env.PRIAVTE_KEY]
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};