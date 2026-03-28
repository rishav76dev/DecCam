// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CampaignFactory {

    struct Submission {
        address creator;
        string link;
        uint views;
        uint reward;
        bool paid;
    }

    struct Campaign {
        address brand;
        uint deadline;
        uint totalBudget;
        uint totalViews;
        bool resultsFinalized;
        Submission[] submissions;
    }

    Campaign[] public campaigns;

    event CampaignCreated(uint indexed campaignId, address indexed brand, uint deadline, uint budget);

    // ---------------------------------------------------------------
    // Create a new campaign — send ETH as the reward budget
    // ---------------------------------------------------------------
    function createCampaign(uint duration) external payable returns (uint campaignId) {
        require(msg.value > 0, "Budget must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        campaignId = campaigns.length;
        campaigns.push();

        Campaign storage c = campaigns[campaignId];
        c.brand       = msg.sender;
        c.deadline    = block.timestamp + duration;
        c.totalBudget = msg.value;

        emit CampaignCreated(campaignId, msg.sender, c.deadline, msg.value);
    }

    // ---------------------------------------------------------------
    // Creators submit their content link before the deadline
    // ---------------------------------------------------------------
    function submit(uint campaignId, string calldata link) external {
        Campaign storage c = _get(campaignId);
        require(block.timestamp < c.deadline, "Campaign has ended");

        c.submissions.push(Submission({
            creator: msg.sender,
            link: link,
            views: 0,
            reward: 0,
            paid: false
        }));
    }

    // ---------------------------------------------------------------
    // Brand records view counts after deadline
    // ---------------------------------------------------------------
    function setViews(uint campaignId, uint index, uint views) external {
        Campaign storage c = _get(campaignId);
        require(msg.sender == c.brand, "Only brand can call this");
        require(block.timestamp >= c.deadline, "Campaign is still active");
        require(!c.resultsFinalized, "Results already finalized");
        require(index < c.submissions.length, "Invalid submission index");

        c.totalViews += views - c.submissions[index].views; // handle re-setting
        c.submissions[index].views = views;
    }

    // ---------------------------------------------------------------
    // Brand finalizes — calculates each creator's share
    // ---------------------------------------------------------------
    function finalizeResults(uint campaignId) external {
        Campaign storage c = _get(campaignId);
        require(msg.sender == c.brand, "Only brand can call this");
        require(block.timestamp >= c.deadline, "Campaign is still active");
        require(!c.resultsFinalized, "Results already finalized");
        require(c.totalViews > 0, "No views recorded");

        for (uint i = 0; i < c.submissions.length; i++) {
            c.submissions[i].reward =
                (c.submissions[i].views * c.totalBudget) / c.totalViews;
        }

        c.resultsFinalized = true;
    }

    // ---------------------------------------------------------------
    // Creator claims their reward
    // ---------------------------------------------------------------
    function claimReward(uint campaignId, uint index) external {
        Campaign storage c = _get(campaignId);
        require(c.resultsFinalized, "Results not finalized yet");
        require(index < c.submissions.length, "Invalid submission index");

        Submission storage sub = c.submissions[index];
        require(msg.sender == sub.creator, "Only creator can claim");
        require(!sub.paid, "Reward already claimed");
        require(sub.reward > 0, "No reward to claim");

        sub.paid = true;
        (bool success, ) = payable(sub.creator).call{value: sub.reward}("");
        require(success, "Transfer failed");
    }

    // ---------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------
    function getCampaignCount() external view returns (uint) {
        return campaigns.length;
    }

    function getSubmission(uint campaignId, uint index)
        external view
        returns (address creator, string memory link, uint views, uint reward, bool paid)
    {
        Submission storage sub = _get(campaignId).submissions[index];
        return (sub.creator, sub.link, sub.views, sub.reward, sub.paid);
    }

    function getSubmissionCount(uint campaignId) external view returns (uint) {
        return _get(campaignId).submissions.length;
    }

    // ---------------------------------------------------------------
    // Internal helper
    // ---------------------------------------------------------------
    function _get(uint campaignId) internal view returns (Campaign storage) {
        require(campaignId < campaigns.length, "Campaign does not exist");
        return campaigns[campaignId];
    }
}