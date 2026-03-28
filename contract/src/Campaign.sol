// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Campaign {

    address public brand;
    uint public deadline;
    uint public totalBudget;
    uint public remainingBudget;

    struct Submission {
        address creator;
        string link;
        uint views;
        uint reward;
        bool paid;
    }

    Submission[] public submissions;

    modifier onlyBrand() {
        require(msg.sender == brand, "Not brand");
        _;
    }

    modifier beforeDeadline() {
        require(block.timestamp < deadline, "Campaign ended");
        _;
    }

    modifier afterDeadline() {
        require(block.timestamp >= deadline, "Campaign active");
        _;
    }

    constructor(uint _duration) payable {
        require(msg.value > 0, "No funds");

        brand = msg.sender;
        deadline = block.timestamp + _duration;
        totalBudget = msg.value;
        remainingBudget = msg.value;
    }

    /* ---------- CREATOR ---------- */

    function submit(string memory _link) public beforeDeadline {
        submissions.push(Submission({
            creator: msg.sender,
            link: _link,
            views: 0,
            reward: 0,
            paid: false
        }));
    }

    function getSubmissionsCount() public view returns (uint) {
        return submissions.length;
    }

    /* ---------- DISTRIBUTION ---------- */

    // Backend sets views + reward together
    function setResult(
        uint index,
        uint _views,
        uint _reward
    ) public onlyBrand afterDeadline {

        require(index < submissions.length, "Invalid index");
        require(_reward <= remainingBudget, "Budget exceeded");

        Submission storage sub = submissions[index];

        sub.views = _views;
        sub.reward = _reward;
    }

    // Pay creator
    function releasePayment(uint index) public onlyBrand afterDeadline {
        require(index < submissions.length, "Invalid index");

        Submission storage sub = submissions[index];

        require(!sub.paid, "Already paid");
        require(sub.reward > 0, "Reward not set");
        require(sub.reward <= remainingBudget, "Insufficient budget");

        sub.paid = true;
        remainingBudget -= sub.reward;

        payable(sub.creator).transfer(sub.reward);
    }

    /* ---------- SAFETY ---------- */

    function withdrawRemaining() public onlyBrand afterDeadline {
        uint amount = remainingBudget;
        remainingBudget = 0;

        payable(brand).transfer(amount);
    }
}