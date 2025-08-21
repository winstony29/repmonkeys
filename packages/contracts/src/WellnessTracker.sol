// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WellnessTracker
 * @dev Stores comprehensive wellness data on-chain including activities, streaks, scores, and meal tracking
 */
contract WellnessTracker is Ownable {
    
    struct Activity {
        uint256 id;
        string activityType;
        string name;
        uint256 reward;
        uint256 timestamp;
        bool completed;
    }
    
    struct Meal {
        uint256 id;
        string mealType;
        string name;
        uint256 calories;
        uint256 timestamp;
    }
    
    struct WeeklyGoals {
        uint256 exerciseCurrent;
        uint256 exerciseTarget;
        uint256 meditationCurrent;
        uint256 meditationTarget;
        uint256 sleepCurrent;
        uint256 sleepTarget;
        bool exerciseCompleted;
        bool meditationCompleted;
        bool sleepCompleted;
    }
    
    struct WellnessData {
        uint256 streakCount;
        uint256 totalScore;
        uint256 lastActivityTimestamp;
        uint256 dailyStreakStart;
        WeeklyGoals weeklyGoals;
        uint256 totalActivities;
        uint256 totalMeals;
    }
    
    // Mapping from user address to their wellness data
    mapping(address => WellnessData) private userWellnessData;
    
    // Mapping to track if user has wellness data initialized
    mapping(address => bool) private hasWellnessData;
    
    // Separate mappings for activities and meals to avoid storage issues
    mapping(address => mapping(uint256 => Activity)) private userActivities;
    mapping(address => mapping(uint256 => Meal)) private userMeals;
    
    // Events
    event ActivityLogged(address indexed user, string activityType, string name, uint256 reward, uint256 timestamp);
    event MealLogged(address indexed user, string mealType, string name, uint256 calories, uint256 timestamp);
    event StreakUpdated(address indexed user, uint256 newStreak, uint256 timestamp);
    event ScoreUpdated(address indexed user, uint256 newScore, uint256 increment, uint256 timestamp);
    event WeeklyGoalsUpdated(address indexed user, uint256 exerciseCurrent, uint256 meditationCurrent, uint256 sleepCurrent, uint256 timestamp);
    event WellnessDataInitialized(address indexed user, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Initialize wellness data for a new user
     */
    function initializeWellnessData() external {
        require(!hasWellnessData[msg.sender], "Wellness data already initialized");
        
        userWellnessData[msg.sender] = WellnessData({
            streakCount: 0,
            totalScore: 0,
            lastActivityTimestamp: 0,
            dailyStreakStart: 0,
            weeklyGoals: WeeklyGoals({
                exerciseCurrent: 0,
                exerciseTarget: 5,
                meditationCurrent: 0,
                meditationTarget: 7,
                sleepCurrent: 0,
                sleepTarget: 7,
                exerciseCompleted: false,
                meditationCompleted: false,
                sleepCompleted: false
            }),
            totalActivities: 0,
            totalMeals: 0
        });
        
        hasWellnessData[msg.sender] = true;
        
        emit WellnessDataInitialized(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Log a wellness activity
     */
    function logActivity(
        string memory _activityType,
        string memory _name,
        uint256 _reward
    ) external {
        require(hasWellnessData[msg.sender], "Wellness data not initialized");
        
        uint256 activityId = userWellnessData[msg.sender].totalActivities + 1;
        
        // Create new activity
        Activity memory newActivity = Activity({
            id: activityId,
            activityType: _activityType,
            name: _name,
            reward: _reward,
            timestamp: block.timestamp,
            completed: true
        });
        
        // Store activity in separate mapping
        userActivities[msg.sender][activityId] = newActivity;
        userWellnessData[msg.sender].totalActivities++;
        
        // Update score
        userWellnessData[msg.sender].totalScore += _reward;
        
        // Update streak logic
        _updateStreak();
        
        // Update weekly goals based on activity type
        _updateWeeklyGoals(_activityType);
        
        // Update last activity timestamp
        userWellnessData[msg.sender].lastActivityTimestamp = block.timestamp;
        
        emit ActivityLogged(msg.sender, _activityType, _name, _reward, block.timestamp);
        emit ScoreUpdated(msg.sender, userWellnessData[msg.sender].totalScore, _reward, block.timestamp);
    }
    
    /**
     * @dev Log a meal
     */
    function logMeal(
        string memory _mealType,
        string memory _name,
        uint256 _calories
    ) external {
        require(hasWellnessData[msg.sender], "Wellness data not initialized");
        
        uint256 mealId = userWellnessData[msg.sender].totalMeals + 1;
        
        // Create new meal
        Meal memory newMeal = Meal({
            id: mealId,
            mealType: _mealType,
            name: _name,
            calories: _calories,
            timestamp: block.timestamp
        });
        
        // Store meal in separate mapping
        userMeals[msg.sender][mealId] = newMeal;
        userWellnessData[msg.sender].totalMeals++;
        
        // Give small reward for meal logging
        uint256 mealReward = 10;
        userWellnessData[msg.sender].totalScore += mealReward;
        
        // Update streak
        _updateStreak();
        
        // Update last activity timestamp
        userWellnessData[msg.sender].lastActivityTimestamp = block.timestamp;
        
        emit MealLogged(msg.sender, _mealType, _name, _calories, block.timestamp);
        emit ScoreUpdated(msg.sender, userWellnessData[msg.sender].totalScore, mealReward, block.timestamp);
    }
    
    /**
     * @dev Update weekly goals based on activity type
     */
    function _updateWeeklyGoals(string memory _activityType) private {
        if (keccak256(abi.encodePacked(_activityType)) == keccak256(abi.encodePacked("workout"))) {
            userWellnessData[msg.sender].weeklyGoals.exerciseCurrent++;
            if (userWellnessData[msg.sender].weeklyGoals.exerciseCurrent >= userWellnessData[msg.sender].weeklyGoals.exerciseTarget) {
                userWellnessData[msg.sender].weeklyGoals.exerciseCompleted = true;
            }
        } else if (keccak256(abi.encodePacked(_activityType)) == keccak256(abi.encodePacked("meditation"))) {
            userWellnessData[msg.sender].weeklyGoals.meditationCurrent++;
            if (userWellnessData[msg.sender].weeklyGoals.meditationCurrent >= userWellnessData[msg.sender].weeklyGoals.meditationTarget) {
                userWellnessData[msg.sender].weeklyGoals.meditationCompleted = true;
            }
        } else if (keccak256(abi.encodePacked(_activityType)) == keccak256(abi.encodePacked("sleep"))) {
            userWellnessData[msg.sender].weeklyGoals.sleepCurrent++;
            if (userWellnessData[msg.sender].weeklyGoals.sleepCurrent >= userWellnessData[msg.sender].weeklyGoals.sleepTarget) {
                userWellnessData[msg.sender].weeklyGoals.sleepCompleted = true;
            }
        }
        
        emit WeeklyGoalsUpdated(
            msg.sender,
            userWellnessData[msg.sender].weeklyGoals.exerciseCurrent,
            userWellnessData[msg.sender].weeklyGoals.meditationCurrent,
            userWellnessData[msg.sender].weeklyGoals.sleepCurrent,
            block.timestamp
        );
    }
    
    /**
     * @dev Update streak count based on daily activity
     */
    function _updateStreak() private {
        uint256 currentTime = block.timestamp;
        uint256 lastActivity = userWellnessData[msg.sender].lastActivityTimestamp;
        
        // If this is the first activity or more than 24 hours have passed
        if (lastActivity == 0 || (currentTime - lastActivity) >= 24 hours) {
            // Check if we should reset or continue streak
            if (lastActivity == 0 || (currentTime - lastActivity) >= 48 hours) {
                // Reset streak
                userWellnessData[msg.sender].streakCount = 1;
                userWellnessData[msg.sender].dailyStreakStart = currentTime;
            } else {
                // Continue streak
                userWellnessData[msg.sender].streakCount++;
            }
            
            emit StreakUpdated(msg.sender, userWellnessData[msg.sender].streakCount, currentTime);
        }
    }
    
    /**
     * @dev Reset weekly goals (call this weekly)
     */
    function resetWeeklyGoals() external {
        require(hasWellnessData[msg.sender], "Wellness data not initialized");
        
        userWellnessData[msg.sender].weeklyGoals.exerciseCurrent = 0;
        userWellnessData[msg.sender].weeklyGoals.meditationCurrent = 0;
        userWellnessData[msg.sender].weeklyGoals.sleepCurrent = 0;
        userWellnessData[msg.sender].weeklyGoals.exerciseCompleted = false;
        userWellnessData[msg.sender].weeklyGoals.meditationCompleted = false;
        userWellnessData[msg.sender].weeklyGoals.sleepCompleted = false;
        
        emit WeeklyGoalsUpdated(
            msg.sender,
            0, 0, 0, block.timestamp
        );
    }
    
    /**
     * @dev Get user's wellness data
     */
    function getUserWellnessData(address _user) external view returns (
        uint256 streakCount,
        uint256 totalScore,
        uint256 lastActivityTimestamp,
        uint256 dailyStreakStart,
        WeeklyGoals memory weeklyGoals,
        uint256 totalActivities,
        uint256 totalMeals
    ) {
        require(hasWellnessData[_user], "User has no wellness data");
        
        WellnessData memory data = userWellnessData[_user];
        return (
            data.streakCount,
            data.totalScore,
            data.lastActivityTimestamp,
            data.dailyStreakStart,
            data.weeklyGoals,
            data.totalActivities,
            data.totalMeals
        );
    }
    
    /**
     * @dev Get user's recent activities (last 10)
     */
    function getUserRecentActivities(address _user, uint256 _count) external view returns (Activity[] memory) {
        require(hasWellnessData[_user], "User has no wellness data");
        require(_count <= 10, "Max 10 activities can be retrieved");
        
        uint256 totalActivities = userWellnessData[_user].totalActivities;
        if (totalActivities == 0) return new Activity[](0);
        
        uint256 startIndex = totalActivities > _count ? totalActivities - _count + 1 : 1;
        uint256 resultCount = totalActivities - startIndex + 1;
        
        Activity[] memory recentActivities = new Activity[](resultCount);
        uint256 resultIndex = 0;
        
        for (uint256 i = startIndex; i <= totalActivities && resultIndex < _count; i++) {
            recentActivities[resultIndex] = userActivities[_user][i];
            resultIndex++;
        }
        
        return recentActivities;
    }
    
    /**
     * @dev Get user's recent meals (last 10)
     */
    function getUserRecentMeals(address _user, uint256 _count) external view returns (Meal[] memory) {
        require(hasWellnessData[_user], "User has no wellness data");
        require(_count <= 10, "Max 10 meals can be retrieved");
        
        uint256 totalMeals = userWellnessData[_user].totalMeals;
        if (totalMeals == 0) return new Meal[](0);
        
        uint256 startIndex = totalMeals > _count ? totalMeals - _count + 1 : 1;
        uint256 resultCount = totalMeals - startIndex + 1;
        
        Meal[] memory recentMeals = new Meal[](resultCount);
        uint256 resultIndex = 0;
        
        for (uint256 i = startIndex; i <= totalMeals && resultIndex < _count; i++) {
            recentMeals[resultIndex] = userMeals[_user][i];
            resultIndex++;
        }
        
        return recentMeals;
    }
    
    /**
     * @dev Check if user has wellness data
     */
    function hasUserWellnessData(address _user) external view returns (bool) {
        return hasWellnessData[_user];
    }
    
    /**
     * @dev Admin function to manually update user score (for rewards)
     */
    function adminUpdateScore(address _user, uint256 _increment) external onlyOwner {
        require(hasWellnessData[_user], "User has no wellness data");
        
        userWellnessData[_user].totalScore += _increment;
        userWellnessData[_user].lastActivityTimestamp = block.timestamp;
        
        emit ScoreUpdated(_user, userWellnessData[_user].totalScore, _increment, block.timestamp);
    }
    
    /**
     * @dev Admin function to manually update user streak
     */
    function adminUpdateStreak(address _user, uint256 _newStreak) external onlyOwner {
        require(hasWellnessData[_user], "Wellness data not initialized");
        
        userWellnessData[_user].streakCount = _newStreak;
        userWellnessData[_user].lastActivityTimestamp = block.timestamp;
        
        emit StreakUpdated(_user, _newStreak, block.timestamp);
    }
}
