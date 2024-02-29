const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
require('@nomicfoundation/hardhat-chai-matchers')
const { expect } = require("chai");

describe("CrowdFunding", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCrowdFundingContract() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, anotherAccount] = await ethers.getSigners();

    const CrowdFund = await ethers.getContractFactory("CrowdFunding");
    const crowdFund = await CrowdFund.deploy("5");

    return { crowdFund, owner, otherAccount, anotherAccount };
  }

  // First, we check the deployment process.
  //  We have defined 2 test units here:
  //    1- checking if platform tax amount will be set correctly
  //    2- checking correct ownership of the deploying contract
  describe("Deployment", function () {
    it("Should set the right tax amount", async function () {
      const { crowdFund } = await loadFixture(deployCrowdFundingContract);

      expect(await crowdFund.platformTax()).to.equal(5);
    });

    it("Should set the right owner", async function () {
      const { crowdFund, owner } = await loadFixture(deployCrowdFundingContract);

      expect(await crowdFund.owner()).to.equal(owner.address);
    });
  });

  // Second, we check the campaign creation process.
  //  We have defined 2 test units here:
  //    1- checking if new campaign will be defined
  //    2- check if emit will occure after creating new campaing
  describe("Campaign Creation", function () {
    describe("New campaign creation", function () {
      it("Should create a new campaign", async function () {
        const { crowdFund, otherAccount } = await loadFixture(deployCrowdFundingContract);
        const title = "NewCampaign";
        const description = "Campaign details";
        const target = 100;
        const currentTime =  Math.floor(Date.now() / 1000); // getting current time
        const image = "img.jpg";

        // const numberOfCampaignsBefore = await crowdFund.numberOfCampaigns();

        await crowdFund.connect(otherAccount).createCampaign(
          otherAccount, 
          title, 
          description, 
          target, 
          currentTime + 3600, // setting campaign deadline to 1hour later ==> currentTime + 3600 seconds
          image)
        
        expect(await crowdFund.numberOfCampaigns()).to.equal(1)
      });
    });

    describe("Events", function () {
      it("Should emit an event on campaign creation", async function () {
        const { crowdFund, otherAccount } = await loadFixture(
          deployCrowdFundingContract
        );

        const title = "NewCampaign";
        const description = "Campaign details";
        const target = 100;
        const currentTime =  Math.floor(Date.now() / 1000);
        const deadline = currentTime + 3600;
        const image = "img.jpg";

        await expect(
          crowdFund.connect(otherAccount).createCampaign(
            otherAccount, 
            title, 
            description, 
            target, 
            deadline, 
            image)).to.emit(crowdFund, "Action")
          .withArgs(1, "Campaign Created", otherAccount.address, currentTime);
      });
      });
  });


  // Third, we check the donation process.
  //  We have defined 2 test units here:
  //    1- checking if minimmum donate amount not sent by the donator
  //    2- check if donated amount will be sent to the contract
  describe("Donation", function () {
      it("Should revert if donated amount be low", async function () {
        const { crowdFund, otherAccount, anotherAccount } = await loadFixture(
          deployCrowdFundingContract
        );

        const title = "NewCampaign";
        const description = "Campaign details";
        const target = 100;
        const currentTime =  Math.floor(Date.now() / 1000);
        const image = "img.jpg";

        
        await crowdFund.connect(otherAccount).createCampaign(
          otherAccount, 
          title, 
          description, 
          target, 
          currentTime + 3600, 
          image)

        await expect(crowdFund.connect(anotherAccount).donateToCampaign(
          0, 
          {value: 0}))
          .to.be.revertedWithCustomError(crowdFund,"LowEtherAmount")
      });

      it("Should transfer donated amount to the contract", async function () {
        const { crowdFund, otherAccount, anotherAccount } = await loadFixture(
          deployCrowdFundingContract
        );

        const title = "NewCampaign";
        const description = "Campaign details";
        const target = 100;
        const currentTime =  Math.floor(Date.now() / 1000);
        const image = "img.jpg";

        
        await crowdFund.connect(otherAccount).createCampaign(
          otherAccount, 
          title, 
          description, 
          target, 
          currentTime + 3600, 
          image)
        
        const collectedAssetsBeforeDonation = await crowdFund.campaigns(0);
        const collectedAssetsBeforeDonationString = await ethers.formatEther(collectedAssetsBeforeDonation.amountCollected);
        console.log("How much collected before: ", (collectedAssetsBeforeDonationString));

        await expect(crowdFund.connect(anotherAccount).donateToCampaign(
          0, 
          {value: 100}))
          .to.changeEtherBalances(
          [anotherAccount, crowdFund],
          [-100, 100]
        );

        const collectedAssetsAfterDonation = await crowdFund.campaigns(0);
        const collectedAssetsAfterDonationString = await ethers.formatEther(collectedAssetsAfterDonation.amountCollected);
        console.log("How much collected after: ", collectedAssetsAfterDonationString);
      });
  });
});

