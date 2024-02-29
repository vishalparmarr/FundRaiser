# <u><i>__FundRaiser (Minor-Project)__</i></u>

Hello Everyone, <br>
    I am Vishal Parmar, and this is my project on a CrowdFunding Platform using blockchain named FundRaiser. This Decentralized application (Dapp) demonstrates an application for people to get donations for their projects or humanity use cases.

# Main functionalities of the project
- Creating fundraising campaigns
- Updating fundraising campaigns
- Donating to campaigns
- deleting campaigns
- withdrawing funds
- refunding funds(in case of emergency and campaign deleting)

##

Back-end parts (`solidity`) are located in `web3.0` folder.
Front-end parts are located in `client` folder.

![Donation(crowdfunding or fundraising dapp)](assests/FundRaiser.png?raw=true)

# Starting the frontend:

Take steps as below:
- 0) deploy core smart contract ( `CrowdFunding.sol` file) from `web3` folder on your desire network(default is Sepolia). Explanation is located at `web3` folder.
- 1) `cd client`
- 2) `npm install`
- 3) to start the frontend: `yarn dev`
- 4) easily work with the platform

* Note: In case facing error of __*to high nonce*__ (on `localhost` network), first reset your `Metamask` as stated below, and then try again:
- Open __Metamask__ > __Settings__ > __Advanced__ > __Clear activity and nonce data__ > click on __`Clear activity tab data`__ button



