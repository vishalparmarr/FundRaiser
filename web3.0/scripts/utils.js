const hre = require("hardhat");

async function waitForTargetBlock(confirmations) {
    const WAIT_BLOCK_CONFIRMATIONS = confirmations;
    const provider = hre.ethers.provider;
    let currentBlockNumber;
    
    await provider.getBlockNumber().then((blockNumber) => {
        currentBlockNumber = blockNumber;
    });

    const targetBlockNumber = currentBlockNumber + WAIT_BLOCK_CONFIRMATIONS;

    return new Promise((resolve, reject) => {
    provider.on("block", (blockNumber) => {
        console.log(`Waiting to get target block(${WAIT_BLOCK_CONFIRMATIONS} blocks wait):`, blockNumber);
        if(blockNumber ==  targetBlockNumber) {
            console.log("Done:", blockNumber);
            provider.off("block");
            resolve(blockNumber);
        }
        reject("Error in getting block number");
        })
    })
}

module.exports = waitForTargetBlock;