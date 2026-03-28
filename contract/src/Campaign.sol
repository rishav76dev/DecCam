// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// -------------------------------------------------------------------
// Campaign — individual campaign instance (no constructor args needed
//            from the user; the factory passes them internally)
// -------------------------------------------------------------------
contract Campaign {
    address public brand;
    uint public deadline;
    uint public totalBudget;
    uint public totalViews;
    bool public resultsFinalized;

    struct Submission {
        address creator;
        string link;
        uint views;
        uint reward;
        bool paid;
    }

    Submission[] public submissions;

    modifier onlyBrand() {
        require(msg.sender == brand, "Only brand can call this");
        _;
    }

    // Called once by the factory right after deployment
    function initialize(address _brand, uint _duration) external payable {
        require(brand == address(0), "Already initialized");
        require(msg.value > 0, "Budget must be greater than 0");
        brand    = _brand;
        deadline = block.timestamp + _duration;
        totalBudget = msg.value;
    }

    function submit(string calldata link) external {
        require(block.timestamp < deadline, "Campaign has ended");
        submissions.push(Submission({
            creator: msg.sender,
            link: link,
            views: 0,
            reward: 0,
            paid: false
        }));
    }

    function setViews(uint index, uint views) external onlyBrand {
        require(block.timestamp >= deadline, "Campaign is still active");
        require(!resultsFinalized, "Results already finalized");
        require(index < submissions.length, "Invalid submission index");
        submissions[index].views = views;
        totalViews += views;
    }

    function finalizeResults() external onlyBrand {
        require(block.timestamp >= deadline, "Campaign is still active");
        require(!resultsFinalized, "Results already finalized");
        require(totalViews > 0, "No views recorded");
        for (uint i = 0; i < submissions.length; i++) {
            submissions[i].reward =
                (submissions[i].views * totalBudget) / totalViews;
        }
        resultsFinalized = true;
    }

    function claimReward(uint index) external {
        require(resultsFinalized, "Results not finalized yet");
        require(index < submissions.length, "Invalid submission index");
        Submission storage sub = submissions[index];
        require(msg.sender == sub.creator, "Only creator can claim");
        require(!sub.paid, "Reward already claimed");
        require(sub.reward > 0, "No reward to claim");
        sub.paid = true;
        (bool success, ) = payable(sub.creator).call{value: sub.reward}("");
        require(success, "Transfer failed");
    }

    function getSubmissionCount() external view returns (uint) {
        return submissions.length;
    }
}

// -------------------------------------------------------------------
// CampaignFactory — deploy and track unlimited campaigns
// -------------------------------------------------------------------
contract CampaignFactory {

    address[] public campaigns;

    event CampaignCreated(
        address indexed campaignAddress,
        address indexed brand,
        uint deadline,
        uint budget
    );

    /// @notice Create a new campaign.
    /// @param duration  How many seconds until the campaign ends.
    /// Send ETH with this call — it becomes the reward budget.
    function createCampaign(uint duration) external payable returns (address) {
        require(msg.value > 0, "Budget must be greater than 0");
        require(duration > 0,  "Duration must be greater than 0");

        Campaign campaign = new Campaign();
        campaign.initialize{value: msg.value}(msg.sender, duration);

        campaigns.push(address(campaign));

        emit CampaignCreated(
            address(campaign),
            msg.sender,
            block.timestamp + duration,
            msg.value
        );

        return address(campaign);
    }

    /// @notice Returns all deployed campaign addresses.
    function getCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    /// @notice Total number of campaigns ever created.
    function campaignCount() external view returns (uint) {
        return campaigns.length;
    }
}