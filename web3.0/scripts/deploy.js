const hre = require("hardhat");
const path = require('path')
const fs = require('fs')
const waitForTargetBlock = require('./utils')

async function main() {
  const platformTax = 3;
  const confirmationsNnumber = 5;
  const Contract = await hre.ethers.deployContract("CrowdFunding", [platformTax]);

  await Contract.waitForDeployment();

  console.log(
    `Crowdfunding contract deployed to ${Contract.target} on ${hre.network.name}`
  );

  saveFrontendFiles(Contract);
  await waitForTargetBlock(confirmationsNnumber);
  verifyContract(Contract, platformTax);

}

function saveFrontendFiles(myContract) {
  // const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "/client",
    "src",
    "abis"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ ["contractAddress"]: myContract.target }, undefined, 2)
  );

  const ContractArtifact = artifacts.readArtifactSync("CrowdFunding");

  fs.writeFileSync(
    path.join(contractsDir, "contractAbi.json"),
    JSON.stringify(ContractArtifact, null, 2)
  );
}

async function verifyContract(contract, taxVal) {
  console.log(`Verifying contract on Etherscan...`);
  try {
      await hre.run("verify:verify", {
      address: contract.target,
      constructorArguments: [taxVal],
    });
    console.log("Contract Verified Successfully");
  } catch(err) {
    console.log(err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
