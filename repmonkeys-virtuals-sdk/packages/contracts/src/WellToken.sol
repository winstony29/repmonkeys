// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WellToken
 * @dev ERC-20 token for the wellness application
 * - Fixed maximum supply of 1,000,000,000 tokens
 * - Initial supply goes to the deployer
 * - Bitcoin-style halving mechanism for rewards
 */
contract WellToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens with 18 decimals
    
    // Bitcoin-style halving parameters
    uint256 public constant HALVING_INTERVAL = 210000; // Every 210,000 wellness activities
    uint256 public constant INITIAL_REWARD_PER_ACTIVITY = 50 * 10**18; // 50 WELL tokens per activity
    
    uint256 public currentRewardPerActivity;
    uint256 public totalActivitiesProcessed;
    uint256 public currentHalvingEpoch;
    
    // Events
    event RewardHalved(uint256 newReward, uint256 epoch);
    event ActivityRewarded(address indexed user, uint256 amount, uint256 totalActivities);
    
    constructor() ERC20("Well Token", "WELL") Ownable(msg.sender) {
        // Mint initial supply to the deployer
        _mint(msg.sender, MAX_SUPPLY);
        
        // Initialize halving parameters
        currentRewardPerActivity = INITIAL_REWARD_PER_ACTIVITY;
        totalActivitiesProcessed = 0;
        currentHalvingEpoch = 0;
    }
    
    /**
     * @dev Override decimals to return 18
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Function to mint additional tokens (only owner)
     * Note: This is disabled since we have a fixed supply
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Calculate and distribute rewards for wellness activities
     * @param user Address of the user to reward
     * @param activityCount Number of activities completed
     */
    function distributeWellnessReward(address user, uint256 activityCount) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(activityCount > 0, "Activity count must be greater than 0");
        
        uint256 totalReward = 0;
        
        for (uint256 i = 0; i < activityCount; i++) {
            totalReward += currentRewardPerActivity;
            totalActivitiesProcessed++;
            
            // Check if it's time for halving
            if (totalActivitiesProcessed % HALVING_INTERVAL == 0) {
                _performHalving();
            }
        }
        
        // Transfer tokens to user
        require(transfer(user, totalReward), "Transfer failed");
        
        emit ActivityRewarded(user, totalReward, totalActivitiesProcessed);
    }
    
    /**
     * @dev Perform halving of rewards
     */
    function _performHalving() private {
        currentHalvingEpoch++;
        currentRewardPerActivity = currentRewardPerActivity / 2;
        
        emit RewardHalved(currentRewardPerActivity, currentHalvingEpoch);
    }
    
    /**
     * @dev Get current reward per activity
     */
    function getCurrentRewardPerActivity() external view returns (uint256) {
        return currentRewardPerActivity;
    }
    
    /**
     * @dev Get next halving information
     */
    function getNextHalvingInfo() external view returns (uint256 activitiesUntilHalving, uint256 nextReward) {
        uint256 activitiesUntilHalving = HALVING_INTERVAL - (totalActivitiesProcessed % HALVING_INTERVAL);
        uint256 nextReward = currentRewardPerActivity / 2;
        return (activitiesUntilHalving, nextReward);
    }
    
    /**
     * @dev Get halving statistics
     */
    function getHalvingStats() external view returns (
        uint256 currentReward,
        uint256 totalActivities,
        uint256 currentEpoch,
        uint256 activitiesUntilNextHalving
    ) {
        uint256 activitiesUntilNextHalving = HALVING_INTERVAL - (totalActivitiesProcessed % HALVING_INTERVAL);
        return (
            currentRewardPerActivity,
            totalActivitiesProcessed,
            currentHalvingEpoch,
            activitiesUntilNextHalving
        );
    }
}
