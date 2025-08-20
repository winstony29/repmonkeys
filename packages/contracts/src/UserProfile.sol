// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserProfile
 * @dev Smart contract to store user wellness data and onboarding status
 */
contract UserProfile is Ownable {
    
    struct WellnessProfile {
        bool hasOnboarded;
        string[] goals;
        string preferredImageTheme;
        string customPrompt;
        uint256 streakCount;
        uint256 totalScore;
        uint256 createdAt;
        uint256 lastActive;
        string profileImageUrl;
    }
    
    // Mapping from user address to their wellness profile
    mapping(address => WellnessProfile) public userProfiles;
    
    // Mapping to track if user has completed specific achievements
    mapping(address => mapping(string => bool)) public userAchievements;
    
    // Array to store all users who have profiles
    address[] public profiledUsers;
    
    // Events
    event ProfileCreated(address indexed user, uint256 timestamp);
    event ProfileUpdated(address indexed user, uint256 timestamp);
    event GoalsUpdated(address indexed user, string[] newGoals);
    event StreakUpdated(address indexed user, uint256 newStreak);
    event ScoreUpdated(address indexed user, uint256 newScore);
    event AchievementUnlocked(address indexed user, string achievement);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create or update user profile during onboarding
     */
    function createProfile(
        string[] memory _goals,
        string memory _imageTheme,
        string memory _customPrompt,
        string memory _profileImageUrl
    ) external {
        WellnessProfile storage profile = userProfiles[msg.sender];
        
        // If first time creating profile, add to users array
        if (!profile.hasOnboarded) {
            profiledUsers.push(msg.sender);
            profile.createdAt = block.timestamp;
            emit ProfileCreated(msg.sender, block.timestamp);
        }
        
        profile.hasOnboarded = true;
        profile.goals = _goals;
        profile.preferredImageTheme = _imageTheme;
        profile.customPrompt = _customPrompt;
        profile.profileImageUrl = _profileImageUrl;
        profile.lastActive = block.timestamp;
        
        emit ProfileUpdated(msg.sender, block.timestamp);
        emit GoalsUpdated(msg.sender, _goals);
    }
    
    /**
     * @dev Update user's wellness goals
     */
    function updateGoals(string[] memory _newGoals) external {
        require(userProfiles[msg.sender].hasOnboarded, "User has not onboarded");
        
        userProfiles[msg.sender].goals = _newGoals;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit GoalsUpdated(msg.sender, _newGoals);
    }
    
    /**
     * @dev Update user's streak count
     */
    function updateStreak(uint256 _newStreak) external {
        require(userProfiles[msg.sender].hasOnboarded, "User has not onboarded");
        
        userProfiles[msg.sender].streakCount = _newStreak;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit StreakUpdated(msg.sender, _newStreak);
    }
    
    /**
     * @dev Update user's total score
     */
    function updateScore(uint256 _newScore) external {
        require(userProfiles[msg.sender].hasOnboarded, "User has not onboarded");
        
        userProfiles[msg.sender].totalScore = _newScore;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit ScoreUpdated(msg.sender, _newScore);
    }
    
    /**
     * @dev Update user's profile image URL
     */
    function updateProfileImage(string memory _newImageUrl) external {
        require(userProfiles[msg.sender].hasOnboarded, "User has not onboarded");
        
        userProfiles[msg.sender].profileImageUrl = _newImageUrl;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit ProfileUpdated(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Mark user achievement as completed
     */
    function unlockAchievement(string memory _achievement) external {
        require(userProfiles[msg.sender].hasOnboarded, "User has not onboarded");
        require(!userAchievements[msg.sender][_achievement], "Achievement already unlocked");
        
        userAchievements[msg.sender][_achievement] = true;
        userProfiles[msg.sender].lastActive = block.timestamp;
        
        emit AchievementUnlocked(msg.sender, _achievement);
    }
    
    /**
     * @dev Update user's last active timestamp
     */
    function updateActivity() external {
        require(userProfiles[msg.sender].hasOnboarded, "User has not onboarded");
        userProfiles[msg.sender].lastActive = block.timestamp;
    }
    
    // View functions
    
    /**
     * @dev Check if user has completed onboarding
     */
    function hasUserOnboarded(address _user) external view returns (bool) {
        return userProfiles[_user].hasOnboarded;
    }
    
    /**
     * @dev Get user's complete profile
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
        string memory profileImageUrl
    ) {
        WellnessProfile memory profile = userProfiles[_user];
        return (
            profile.hasOnboarded,
            profile.goals,
            profile.preferredImageTheme,
            profile.customPrompt,
            profile.streakCount,
            profile.totalScore,
            profile.createdAt,
            profile.lastActive,
            profile.profileImageUrl
        );
    }
    
    /**
     * @dev Get user's wellness goals
     */
    function getUserGoals(address _user) external view returns (string[] memory) {
        return userProfiles[_user].goals;
    }
    
    /**
     * @dev Get user's streak and score
     */
    function getUserStats(address _user) external view returns (uint256 streak, uint256 score) {
        WellnessProfile memory profile = userProfiles[_user];
        return (profile.streakCount, profile.totalScore);
    }
    
    /**
     * @dev Check if user has specific achievement
     */
    function hasAchievement(address _user, string memory _achievement) external view returns (bool) {
        return userAchievements[_user][_achievement];
    }
    
    /**
     * @dev Get total number of users with profiles
     */
    function getTotalUsers() external view returns (uint256) {
        return profiledUsers.length;
    }
    
    /**
     * @dev Get user by index (for admin purposes)
     */
    function getUserByIndex(uint256 _index) external view returns (address) {
        require(_index < profiledUsers.length, "Index out of bounds");
        return profiledUsers[_index];
    }
    
    /**
     * @dev Admin function to reset user profile (for testing)
     */
    function resetUserProfile(address _user) external onlyOwner {
        delete userProfiles[_user];
        
        // Remove from profiledUsers array
        for (uint256 i = 0; i < profiledUsers.length; i++) {
            if (profiledUsers[i] == _user) {
                profiledUsers[i] = profiledUsers[profiledUsers.length - 1];
                profiledUsers.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Admin function to get all user data (for analytics)
     */
    function getAllUsersData() external view onlyOwner returns (
        address[] memory users,
        uint256[] memory streaks,
        uint256[] memory scores,
        uint256[] memory lastActiveTimestamps
    ) {
        uint256 totalUsers = profiledUsers.length;
        users = new address[](totalUsers);
        streaks = new uint256[](totalUsers);
        scores = new uint256[](totalUsers);
        lastActiveTimestamps = new uint256[](totalUsers);
        
        for (uint256 i = 0; i < totalUsers; i++) {
            address user = profiledUsers[i];
            WellnessProfile memory profile = userProfiles[user];
            
            users[i] = user;
            streaks[i] = profile.streakCount;
            scores[i] = profile.totalScore;
            lastActiveTimestamps[i] = profile.lastActive;
        }
        
        return (users, streaks, scores, lastActiveTimestamps);
    }
}
