// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Rewards
 * @dev Contract to manage distribution of $WELL tokens to users
 * - Holds $WELL tokens for distribution
 * - Only owner can distribute rewards
 * - Tracks total rewards distributed
 */
contract Rewards is Ownable {
    IERC20 public wellToken;
    
    // Total rewards distributed
    uint256 public totalRewardsDistributed;
    
    // Mapping to track rewards per user
    mapping(address => uint256) public userRewards;
    
    // Events
    event RewardDistributed(address indexed user, uint256 amount);
    event ContractFunded(uint256 amount);
    
    constructor(address _wellToken) Ownable(msg.sender) {
        require(_wellToken != address(0), "Invalid token address");
        wellToken = IERC20(_wellToken);
    }
    
    /**
     * @dev Distribute $WELL tokens to a user
     * @param user Address of the user to reward
     * @param amount Amount of $WELL tokens to distribute
     */
    function distributeReward(address user, uint256 amount) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(amount > 0, "Amount must be greater than 0");
        require(
            wellToken.balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        
        // Transfer tokens to user
        require(wellToken.transfer(user, amount), "Transfer failed");
        
        // Update tracking
        userRewards[user] += amount;
        totalRewardsDistributed += amount;
        
        emit RewardDistributed(user, amount);
    }
    
    /**
     * @dev Fund the contract with $WELL tokens
     * @param amount Amount of $WELL tokens to fund
     */
    function fundContract(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(
            wellToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        emit ContractFunded(amount);
    }
    
    /**
     * @dev Get the current balance of $WELL tokens in the contract
     * @return Current balance
     */
    function getContractBalance() external view returns (uint256) {
        return wellToken.balanceOf(address(this));
    }
    
    /**
     * @dev Get total rewards for a specific user
     * @param user Address of the user
     * @return Total rewards received by the user
     */
    function getUserTotalRewards(address user) external view returns (uint256) {
        return userRewards[user];
    }
    
    /**
     * @dev Emergency function to withdraw all tokens (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = wellToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        
        require(wellToken.transfer(owner(), balance), "Transfer failed");
    }
}

