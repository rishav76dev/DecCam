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

    modifier onlyBrand() {
        require(msg.sender == brand, "Only brand can call this");
        _;
    }

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
            submissions[i].reward = (submissions[i].views * totalBudget) / totalViews;
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
}

