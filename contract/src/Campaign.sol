// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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

    constructor(uint duration) payable {
        require(msg.value > 0, "Budget must be greater than 0");
        brand = msg.sender;
        deadline = block.timestamp + duration;
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

    function setViews(uint index, uint views) external {
        require(msg.sender == brand, "Only brand can call this");
        require(block.timestamp >= deadline, "Campaign is still active");
        require(!resultsFinalized, "Results already finalized");
        require(index < submissions.length, "Invalid index");

        submissions[index].views = views;
        totalViews += views;
    }

    function finalizeResults() external {
        require(msg.sender == brand, "Only brand can call this");
        require(block.timestamp >= deadline, "Campaign is still active");
        require(!resultsFinalized, "Results already finalized");
        require(totalViews > 0, "No views recorded");

        uint distributedRewards = 0;
        
        for (uint i = 0; i < submissions.length; i++) {
            uint reward = (submissions[i].views * totalBudget) / totalViews;
            
            // Handle dust to distribute ENTIRE budget precisely
            if (i == submissions.length - 1 && submissions[i].views > 0) {
                reward = totalBudget - distributedRewards;
            }
            
            submissions[i].reward = reward;
            distributedRewards += reward;
        }
        
        resultsFinalized = true;
    }

    function claimReward(uint index) external {
        require(resultsFinalized, "Results not finalized");
        require(index < submissions.length, "Invalid index");
        
        Submission storage sub = submissions[index];
        require(msg.sender == sub.creator, "Not the creator");
        require(!sub.paid, "Already paid");
        require(sub.reward > 0, "No reward to claim");

        sub.paid = true;
        (bool success, ) = sub.creator.call{value: sub.reward}("");
        require(success, "Transfer failed");
    }
}
