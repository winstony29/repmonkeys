// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserProfile
 * @dev Stores user wellness profiles and onboarding data on-chain
 */
contract UserProfile is Ownable {
    
    struct Profile {
        bool hasOnboarded;
        string[] goals;
        string preferredImageTheme;
        string customPrompt;
        uint256 streakCount;
        uint256 totalScore;
        uint256 createdAt;
        uint256 lastActive;
        string profileImageUrl;
        uint256 nftTokenId;
    }
    
    // Mapping from user address to their profile
    mapping(address => Profile) private userProfiles;
    
    // Array to keep track of all users who have onboarded
    address[] public onboardedUsers;
    
    // Events
    event ProfileCreated(address indexed user, string[] goals, string imageTheme, uint256 timestamp);
    event ProfileUpdated(address indexed user, string updateType, uint256 timestamp);
    event GoalsUpdated(address indexed user, string[] newGoals);
    event StreakUpdated(address indexed user, uint256 newStreak);
    event ScoreUpdated(address indexed user, uint256 newScore);
    event ActivityUpdated(address indexed user, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new user profile (onboarding)
     */
    function createProfile(
        string[] memory _goals,
        string memory _imageTheme,
        string memory _customPrompt,
        string memory _profileImageUrl
    ) external {
        require(!userProfiles[msg.sender].hasOnboarded, "User already has a profile");
        require(_goals.length > 0, "At least one goal is required");
        
        userProfiles[msg.sender] = Profile({
            hasOnboarded: true,
            goals: _goals,
            preferredImageTheme: _imageTheme,
            customPrompt: _customPrompt,
            streakCount: 1,
            totalScore: 100,
            createdAt: block.timestamp,
            lastActive: block.timestamp,
            profileImageUrl: _profileImageUrl,
            nftTokenId: 0
        });
        
        onboardedUsers.push(msg.sender);
        
        emit ProfileCreated(msg.sender, _goals, _imageTheme, block.timestamp);
    }
    
    /**
     * @dev Update user goals
     */
    function updateGoals(string[] memory _newGoals) external {
        require(userProfiles[msg.sender].hasOnboarded, "User must onboard first");
        require(_newGoals.length > 0, "At least one goal is required");
        
        userProfiles[msg.sender].goals = _newGoals;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit GoalsUpdated(msg.sender, _newGoals);
        emit ProfileUpdated(msg.sender, "goals", block.timestamp);
    }
    
    /**
     * @dev Update user streak count
     */
    function updateStreak(uint256 _newStreak) external {
        require(userProfiles[msg.sender].hasOnboarded, "User must onboard first");
        
        userProfiles[msg.sender].streakCount = _newStreak;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit StreakUpdated(msg.sender, _newStreak);
        emit ProfileUpdated(msg.sender, "streak", block.timestamp);
    }
    
    /**
     * @dev Update user total score
     */
    function updateScore(uint256 _newScore) external {
        require(userProfiles[msg.sender].hasOnboarded, "User must onboard first");
        
        userProfiles[msg.sender].totalScore = _newScore;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit ScoreUpdated(msg.sender, _newScore);
        emit ProfileUpdated(msg.sender, "score", block.timestamp);
    }
    
    /**
     * @dev Update profile image URL (after NFT generation)
     */
    function updateProfileImage(string memory _newImageUrl) external {
        require(userProfiles[msg.sender].hasOnboarded, "User must onboard first");
        
        userProfiles[msg.sender].profileImageUrl = _newImageUrl;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit ProfileUpdated(msg.sender, "image", block.timestamp);
    }
    
    /**
     * @dev Set NFT token ID for user
     */
    function setNftTokenId(uint256 _tokenId) external {
        require(userProfiles[msg.sender].hasOnboarded, "User must onboard first");
        
        userProfiles[msg.sender].nftTokenId = _tokenId;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit ProfileUpdated(msg.sender, "nft", block.timestamp);
    }
    
    /**
     * @dev Update user activity timestamp
     */
    function updateActivity() external {
        require(userProfiles[msg.sender].hasOnboarded, "User must onboard first");
        
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit ActivityUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if user has onboarded
     */
    function hasUserOnboarded(address _user) external view returns (bool) {
        return userProfiles[_user].hasOnboarded;
    }
    
    /**
     * @dev Get full user profile
     */
    function getUserProfile(address _user) external view returns (
        bool hasOnboarded,
        string[] memory goals,
        string memory preferredImageTheme,
        string memory customPrompt,
        uint256 streakCount,
        uint256 totalScore,
        uint256 createdAt,
        uint256 lastActive,
        string memory profileImageUrl,
        uint256 nftTokenId
    ) {
        Profile memory profile = userProfiles[_user];
        return (
            profile.hasOnboarded,
            profile.goals,
            profile.preferredImageTheme,
            profile.customPrompt,
            profile.streakCount,
            profile.totalScore,
            profile.createdAt,
            profile.lastActive,
            profile.profileImageUrl,
            profile.nftTokenId
        );
    }
    
    /**
     * @dev Get user goals only
     */
    function getUserGoals(address _user) external view returns (string[] memory) {
        require(userProfiles[_user].hasOnboarded, "User has not onboarded");
        return userProfiles[_user].goals;
    }
    
    /**
     * @dev Get user stats (streak and score)
     */
    function getUserStats(address _user) external view returns (uint256 streak, uint256 score) {
        require(userProfiles[_user].hasOnboarded, "User has not onboarded");
        Profile memory profile = userProfiles[_user];
        return (profile.streakCount, profile.totalScore);
    }
    
    /**
     * @dev Get user's profile image URL
     */
    function getProfileImageUrl(address _user) external view returns (string memory) {
        require(userProfiles[_user].hasOnboarded, "User has not onboarded");
        return userProfiles[_user].profileImageUrl;
    }
    
    /**
     * @dev Get user's NFT token ID
     */
    function getNftTokenId(address _user) external view returns (uint256) {
        require(userProfiles[_user].hasOnboarded, "User has not onboarded");
        return userProfiles[_user].nftTokenId;
    }
    
    /**
     * @dev Get total number of onboarded users
     */
    function getTotalUsers() external view returns (uint256) {
        return onboardedUsers.length;
    }
    
    /**
     * @dev Get onboarded user by index
     */
    function getOnboardedUser(uint256 _index) external view returns (address) {
        require(_index < onboardedUsers.length, "Index out of bounds");
        return onboardedUsers[_index];
    }
    
    /**
     * @dev Admin function to increment user score (for rewards)
     */
    function adminIncrementScore(address _user, uint256 _increment) external onlyOwner {
        require(userProfiles[_user].hasOnboarded, "User has not onboarded");
        
        userProfiles[_user].totalScore += _increment;
        userProfiles[_user].lastActive = block.timestamp;
        
        emit ScoreUpdated(_user, userProfiles[_user].totalScore);
    }
    
    /**
     * @dev Admin function to increment user streak (for daily check-ins)
     */
    function adminIncrementStreak(address _user) external onlyOwner {
        require(userProfiles[_user].hasOnboarded, "User has not onboarded");
        
        userProfiles[_user].streakCount += 1;
        userProfiles[_user].lastActive = block.timestamp;
        
        emit StreakUpdated(_user, userProfiles[_user].streakCount);
    }
}
