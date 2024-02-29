# Donation Project

This project demonstrates a smart contract for people to get donations for their projects or humanity use cases.
It comes with a contract, and a script that deploys and verifies that contract. (note: test for the contract will be added at a later time)

# Deploy the core contract on `Sepolia` network:

Take steps as below:

``` shell
npm install
npx hardhat run scripts/deploy.js --network YOUR_DESIRED_NETWORK
```
Thats' it!


As you run `deploy.js`, below things happen:

- Contract will be deployed and initilized with starter `platform fee`
- `Contract address` and `ABI` will go to the client folder
- We will wait for `5` block confirmation from sepolia chain to request verifying the contract(with the help of `utils.js` in script folder)
- Contract verification will be successfully done if everything goes fine.

# Deploy on localhsot:

Terminal #1:
```shell
npx hardhat node
```

Terminal #2:
```shell
npx hardhat run scripts/deploy.js --network localhost
```

* Note1: Make sure commenting the below lines of code in `deploy.js` when deploying on `localhost`:

```JavaScript
const waitForTargetBlock = require('./utils')  --> line 4
await waitForTargetBlock(confirmationsNnumber); --> line 18
```
* Note2: Make sure to set correct configurations in your `hardhat.config.js`

* Note3: When changing the network from `Sepolia` to `localhost`, you have to make some little changes in frontend part ( `client/src/main.jsx` folder):

``` Javascript
  <ThirdwebProvider 
    desiredChainId={ChainId.Localhost}
    activeChain={ChainId.Localhost}
  > 
```