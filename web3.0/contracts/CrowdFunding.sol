// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// To use circuit-breaker pattern from oz-contracts, can use:
//  import "@openzeppelin/contracts/security/Pausable.sol"; 
//  (As a tradeoff, I decided to just implement my simple circuit-breaker for gas efficiency)
// Todo: import {CampaignTypes} from "./CampaignTypes.sol";

/// @title The crowdfunding platform
/// @author Bahador Ghadamkheir
/// @dev This is a sample crowdfunding smart contract.
/// @notice As this contract is not audited, use at your own risk!
contract CrowdFunding is Ownable {
    using SafeMath for uint256;

    /// Strcuture of each campaign
    struct Campaign {
        address owner;
        bool payedOut;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
    }

    // a mapppig to hold each campaign's data
    mapping(uint256 => Campaign) public campaigns;

    // defining tax of the platform
    uint8 public platformTax;
    // holding number of all campaigns 
    uint24 public numberOfCampaigns;

    // avtivity status of the contract
    bool public emergencyMode; // default: false

    // Will be emitted when a main functionality executed
    // (such as: creating/deleting/updating capaigns, and etc.)
    event Action (
        uint256 id,
        string actionType,
        address indexed executor,
        uint256 timestamp
    );

    // Will be emitted in case of changing activity status of the contract
    event ContractStateChanged (
        bool State
    );

    /// Will arise when msg.value is lower than minAmount
    /// `minAmount` minimmum amount
    /// @param minAmount the minnimum acceptable ETH amount to fund
    /// @param payedAmount the ETH amount funded by user
    error LowEtherAmount(uint minAmount, uint payedAmount);

    /// Will arise when block.timestamp is more than campaingDeadline
    /// `campaingDeadline` deadline
    /// @param campaingDeadline deadline time of fundraising the campaign
    /// @param requestTime time of requesting
    error DeadLine(uint campaingDeadline, uint requestTime);

    // Preventing unauthorized entity execute specific function
    modifier privilageEntity(uint _id) {
        _privilagedEntity(_id);
        _;
    }

    // To have an scape way when something bad happened in contract
    modifier notInEmergency() {
        require(!emergencyMode);
        _;
    }

    // To have an scape way when something bad happened in contract
    modifier onlyInEmergency() {
        require(emergencyMode);
        _;
    }

    // Preventing entering null values as campaign details
    modifier notNull(
        string memory title,
        string memory description,
        uint256 target,
        uint256 deadline,
        string memory image) {
            _nullChecker(title, description, target, deadline, image);
            _;
        }

    /// @param _platformTax initilizing tax of the platform
    constructor(uint8 _platformTax) {
        platformTax = _platformTax;
    }

    /**  @notice Create a fundraising campaign 
     *  @param _owner creator of the fundraising campaign
     *  @param _title title of the fundraising campaign
     *  @param _description description of the fundraising campaign
     *  @param _target desired ETH target amount of the fundraising campaign(based on wei)
     *  @param _deadline deadline of the fundraising campaign
     *  @param _image image address of the fundraising campaign
     *  @return campaign id
     */
    function createCampaign(
        address _owner, 
        string memory _title, 
        string memory _description,
        uint256 _target, 
        uint256 _deadline, 
        string memory _image
        ) external notNull(_title, _description, _target, _deadline, _image) notInEmergency returns (uint256) {
            require(block.timestamp <  _deadline, "Deadline must be in the future");
            Campaign storage campaign = campaigns[numberOfCampaigns];
            numberOfCampaigns++;

            campaign.owner = _owner;
            campaign.title = _title;
            campaign.description = _description;
            campaign.target = _target;
            campaign.deadline = _deadline;
            campaign.amountCollected = 0;
            campaign.image = _image;
            campaign.payedOut = false;

            emit Action (
                numberOfCampaigns,
                "Campaign Created",
                msg.sender,
                block.timestamp
            );

            return numberOfCampaigns - 1;
    }

    /** @notice Update a fundraising campaign 
     *  @param _id campign id
     *  @param _title new title of the fundraising campaign
     *  @param _description new description of the fundraising campaign
     *  @param _target new desired ETH target amount of the fundraising campaign(based on wei)
     *  @param _deadline new deadline of the fundraising campaign
     *  @param _image new image address of the fundraising campaign
     *  @return status of campaign update request
     */
    function updateCampaign(
        uint256 _id,
        string memory _title, 
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
         ) external privilageEntity(_id) notNull(_title, _description, _target, _deadline, _image) notInEmergency returns (bool) {
            require(block.timestamp <  _deadline, "Deadline must be in the future");
            
            // Making a pointer for a campaign
            Campaign storage campaign = campaigns[_id];
            require(campaign.owner > address(0), "No campaign exist with this ID");
            require(campaign.amountCollected == 0, "Update error: amount collected");

            campaign.title = _title;
            campaign.description = _description;
            campaign.target = _target;
            campaign.deadline = _deadline;
            campaign.amountCollected = 0;
            campaign.image = _image;
            campaign.payedOut = false;

            emit Action (
                _id,
                "Campaign Updated",
                msg.sender,
                block.timestamp
            );
            return true;
    }

    /// @notice Donate to an specific fundraising campaign
    /// @param _id campaign id
    function donateToCampaign(uint256 _id) external payable notInEmergency {
        if(msg.value == 0 wei) revert LowEtherAmount({minAmount: 1 wei, payedAmount: msg.value});
        Campaign storage campaign = campaigns[_id];
        if(campaigns[_id].payedOut == true) revert("Funds withdrawed before");
        require(campaign.owner > address(0), "No campaign exist with this ID");
        if(campaign.deadline < block.timestamp) {
            revert DeadLine(
                {
                    campaingDeadline:campaigns[_id].deadline,
                    requestTime: block.timestamp
                }
            );
        }
        uint256 amount = msg.value;
        if(campaign.amountCollected > campaign.amountCollected.add(amount)) revert ("Target amount has reached");
        campaign.amountCollected = campaign.amountCollected.add(amount);

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        emit Action (
            _id,
            "Donation To The Campaign",
            msg.sender,
            block.timestamp
        );
    }

    /// @notice Transfering raised funds to the campaign team
    /// @param _id campaign id
    /// @return true, if payout process get completely done
    function payOutToCampaignTeam(uint256 _id) external privilageEntity(_id) notInEmergency returns (bool) {
        // this line will avoid re-entrancy attack
        if(campaigns[_id].payedOut == true) revert("Funds withdrawed before");
        if(msg.sender != address(owner())) {
            if(campaigns[_id].deadline > block.timestamp) {
                revert DeadLine(
                    {
                        campaingDeadline:campaigns[_id].deadline,
                        requestTime: block.timestamp
                    }
                );
            }
        }

        campaigns[_id].payedOut = true;
        (uint256 raisedAmount, uint256 taxAmount) = _calculateTax(_id);
        _payTo(campaigns[_id].owner, (raisedAmount - taxAmount));
        _payPlatformFee(taxAmount);
        emit Action (
            _id,
            "Funds Withdrawal",
            msg.sender,
            block.timestamp
        );
        return true;
    }

    /// @notice Paying platform fee
    /// @param _taxAmount tax amount to transfer into platform owner account
    function _payPlatformFee(uint256 _taxAmount) internal {
        _payTo(owner(), _taxAmount);
    }

    /// @notice Deleting a specific fundraising campaign 
    /// @param _id campaign id
    /// @return true, if deleting be correctly done
    function deleteCampaign(uint256 _id) external privilageEntity(_id) notInEmergency returns (bool) {
        // to check if a capmpaign with specific id exists.
        require(campaigns[_id].owner > address(0), "No campaign exist with this ID");
        if(campaigns[_id].amountCollected > 0 wei) {
            _refundDonators(_id);
        }
        delete campaigns[_id];

        emit Action (
            _id,
            "Campaign Deleted",
            msg.sender,
            block.timestamp
        );

        numberOfCampaigns -= 1;
        return true;
    }

    /// @notice Showing donators of a specific campaign
    /// @param _id campaign id
    /// @return donator's addresses
    /// @return donator's funded amount
    function getDonators(uint256 _id) external view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    /// @notice Updating platform tax
    /// @param _platformTax new platform tax
    function changeTax(uint8 _platformTax) external onlyOwner {
        platformTax = _platformTax;
    }

    /// @notice Halting fundraising of a specific campaign 
    /// @param _id campaign id
    function haltCampaign(uint256 _id) external onlyOwner {
        campaigns[_id].deadline = block.timestamp;

        emit Action (
            _id,
            "Campaign halted",
            msg.sender,
            block.timestamp
        );
    }

    /** @notice Showing all campaigns data
     *  @dev todo: making slicing for pagination, 
     *  @dev       to reduce the chance of reverting(exceeding block gas limit) in case of big number of campaigns.
     *  @dev           getCampaigns(uint256 startIndex, uint256 endIndex)
     *  @return campaigns data
     */
    function getCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint i=0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allCampaigns[i] = item;
        }
        return allCampaigns;
    }

    /// @notice Changing activity status of the contract
    /// @dev implemented mainly for any unintended situation which risks campaigns funds
    function changeContractState() external onlyOwner {
        emergencyMode = !emergencyMode;
        
        emit ContractStateChanged(emergencyMode);
    }

    /// @notice Withdrawing funds and refunding to donators, in case of an emergency situation(such as bugs, hacks, etc)
    /// @param _startId id of first campaign to refund
    /// @param _endId id of end campaign to refund
    function withdrawFunds(uint256 _startId, uint256 _endId) external onlyOwner onlyInEmergency {
        for(uint i = _startId; i <= _endId; i++) {
            _refundDonators(_startId, _endId);
        }
    }

    /// @notice Making refund to donators of a specific campaign
    /// @param _id campgin id
    function _refundDonators(uint _id) internal {
        uint256 donationAmount;
        Campaign storage campaign = campaigns[_id];
        for(uint i; i < campaign.donators.length; i++) {
            donationAmount = campaign.donations[i];
            campaign.donations[i] = 0;
            _payTo(campaign.donators[i], donationAmount);
            // campaign.donations[i] = 0;
        }
        campaign.amountCollected = 0;
    }

    /// @notice Making refund to donators of specific campaigns range
    /// @param _idFrom campgin id from
    /// @param _idTo campgin id to
    function _refundDonators(uint256 _idFrom, uint256 _idTo) internal {
        require(_idFrom < _idTo, "Invalid id range");
        require(campaigns[_idTo].owner > address(0), "No campaign exist with this ID");
        uint256 donationAmount;
        for(uint i = _idFrom; i < _idTo; i++) {
        Campaign storage campaign = campaigns[i]; 
        uint256 campaignDonators = campaign.donators.length;
            if(campaignDonators > 0) {
                for(uint j = 0; j < campaignDonators; j++) {
                    donationAmount = campaign.donations[j];
                    campaign.donations[j] = 0;
                    _payTo(campaign.donators[j], donationAmount);
                    // campaign.donations[j] = 0;
                }
                    campaign.amountCollected = 0;
            }
        }
    }

    /// @notice Calculating the tax amount
    /// @param _id campaign id
    /// @return total funded amount of specific campaign
    /// @return tax amount of funded amount of specific campaign
    function _calculateTax(uint256 _id) internal view returns (uint, uint) {
        uint raised = campaigns[_id].amountCollected;
        uint tax = (raised * platformTax) / 100;
        return (raised, tax);
    }

    /// @notice Paying stakeholders of the campaign(campaign creator & platform owner)
    /// @param to recipient of the raised amount
    /// @param amount raised amount
    function _payTo(address to, uint256 amount) internal returns (bool) {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
        return true;
    }
    
    /** @notice Preventing entering null values as campaign details
     *  @param _title title of the fundraising campaign
     *  @param _description description of the fundraising campaign
     *  @param _target desired ETH target amount of the fundraising campaign(based on wei)
     *  @param _deadline deadline of the fundraising campaign
     *  @param _image image address of the fundraising campaign
     */
    function _nullChecker(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
        ) internal pure {
            require((
                    bytes(_title).length > 0 
                    && bytes(_description).length > 0 
                    && _target > 0 
                    && _deadline > 0 
                    && bytes(_image).length > 0
                ), "Null value not acceptable");
    }

    /// @notice Preventing unauthorized entity to execute specific function
    /// @param _id campaign id
    function _privilagedEntity(uint256 _id) internal view {
        require(
            msg.sender == campaigns[_id].owner ||
            msg.sender == owner(),
            "Unauthorized Entity"
        );
    } 
}