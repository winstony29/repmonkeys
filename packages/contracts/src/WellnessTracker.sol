// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WellnessTracker
 * @dev Stores comprehensive wellness data on-chain including activities, streaks, scores, and meal tracking
 */
contract WellnessTracker is Ownable {
    
    struct Workout {
        uint256 id;
        uint256 duration; // in minutes
        uint256 sets;
        uint256 caloriesBurned;
        string activityType;
        string name;
        uint256 reward;
        uint256 timestamp;
        bool completed;
    }
    
    struct Meditation {
        uint256 id;
        uint256 duration; // in minutes
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
        uint256 protein; // in grams
        uint256 fat; // in grams
        uint256 carbs; // in grams
        uint256 timestamp;
    }
    
    struct Sleep {
        uint256 id;
        uint256 duration; // in hours (stored as minutes * 60 for precision)
        uint256 timestamp;
        bool completed;
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
        uint256 totalWorkouts;
        uint256 totalMeditations;
        uint256 totalMeals;
        uint256 totalSleepSessions;
    }
    
    // Mapping from user address to their wellness data
    mapping(address => WellnessData) private userWellnessData;
    
    // Mapping to track if user has wellness data initialized
    mapping(address => bool) private hasWellnessData;
    
    // Separate mappings for different wellness activities to avoid storage issues
    mapping(address => mapping(uint256 => Workout)) private userWorkouts;
    mapping(address => mapping(uint256 => Meditation)) private userMeditations;
    mapping(address => mapping(uint256 => Meal)) private userMeals;
    mapping(address => mapping(uint256 => Sleep)) private userSleepSessions;
    
    // Events
    event WorkoutLogged(address indexed user, uint256 duration, uint256 sets, uint256 caloriesBurned, string activityType, string name, uint256 reward, uint256 timestamp);
    event MeditationLogged(address indexed user, uint256 duration, string name, uint256 reward, uint256 timestamp);
    event MealLogged(address indexed user, string mealType, string name, uint256 calories, uint256 protein, uint256 fat, uint256 carbs, uint256 timestamp);
    event SleepLogged(address indexed user, uint256 duration, uint256 timestamp);
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
            totalWorkouts: 0,
            totalMeditations: 0,
            totalMeals: 0,
            totalSleepSessions: 0
        });
        
        hasWellnessData[msg.sender] = true;
        
        emit WellnessDataInitialized(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Log a workout with detailed information
     */
    function logWorkout(
        uint256 _duration,
        uint256 _sets,
        uint256 _caloriesBurned,
        string memory _activityType,
        string memory _name,
        uint256 _reward
    ) external {
        require(hasWellnessData[msg.sender], "Wellness data not initialized");
        require(_duration > 0, "Duration must be greater than 0");
        require(_sets > 0, "Sets must be greater than 0");
        require(_caloriesBurned > 0, "Calories burned must be greater than 0");
        
        uint256 workoutId = userWellnessData[msg.sender].totalWorkouts + 1;
        
        // Create new workout
        Workout memory newWorkout = Workout({
            id: workoutId,
            duration: _duration,
            sets: _sets,
            caloriesBurned: _caloriesBurned,
            activityType: _activityType,
            name: _name,
            reward: _reward,
            timestamp: block.timestamp,
            completed: true
        });
        
        // Store workout in separate mapping
        userWorkouts[msg.sender][workoutId] = newWorkout;
        userWellnessData[msg.sender].totalWorkouts++;
        
        // Update score
        userWellnessData[msg.sender].totalScore += _reward;
        
        // Update streak logic
        _updateStreak();
        
        // Update weekly goals
        _updateWeeklyGoals("workout");
        
        // Update last activity timestamp
        userWellnessData[msg.sender].lastActivityTimestamp = block.timestamp;
        
        emit WorkoutLogged(msg.sender, _duration, _sets, _caloriesBurned, _activityType, _name, _reward, block.timestamp);
        emit ScoreUpdated(msg.sender, userWellnessData[msg.sender].totalScore, _reward, block.timestamp);
    }
    
    /**
     * @dev Log a meditation session
     */
    function logMeditation(
        uint256 _duration,
        string memory _name,
        uint256 _reward
    ) external {
        require(hasWellnessData[msg.sender], "Wellness data not initialized");
        require(_duration > 0, "Duration must be greater than 0");
        
        uint256 meditationId = userWellnessData[msg.sender].totalMeditations + 1;
        
        // Create new meditation
        Meditation memory newMeditation = Meditation({
            id: meditationId,
            duration: _duration,
            name: _name,
            reward: _reward,
            timestamp: block.timestamp,
            completed: true
        });
        
        // Store meditation in separate mapping
        userMeditations[msg.sender][meditationId] = newMeditation;
        userWellnessData[msg.sender].totalMeditations++;
        
        // Update score
        userWellnessData[msg.sender].totalScore += _reward;
        
        // Update streak logic
        _updateStreak();
        
        // Update weekly goals
        _updateWeeklyGoals("meditation");
        
        // Update last activity timestamp
        userWellnessData[msg.sender].lastActivityTimestamp = block.timestamp;
        
        emit MeditationLogged(msg.sender, _duration, _name, _reward, block.timestamp);
        emit ScoreUpdated(msg.sender, userWellnessData[msg.sender].totalScore, _reward, block.timestamp);
    }
    
    /**
     * @dev Log a meal with detailed macronutrient information
     */
    function logMeal(
        string memory _mealType,
        string memory _name,
        uint256 _calories,
        uint256 _protein,
        uint256 _fat,
        uint256 _carbs
    ) external {
        require(hasWellnessData[msg.sender], "Wellness data not initialized");
        require(_calories > 0, "Calories must be greater than 0");
        require(_protein >= 0, "Protein cannot be negative");
        require(_fat >= 0, "Fat cannot be negative");
        require(_carbs >= 0, "Carbs cannot be negative");
        
        uint256 mealId = userWellnessData[msg.sender].totalMeals + 1;
        
        // Create new meal
        Meal memory newMeal = Meal({
            id: mealId,
            mealType: _mealType,
            name: _name,
            calories: _calories,
            protein: _protein,
            fat: _fat,
            carbs: _carbs,
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
        
        emit MealLogged(msg.sender, _mealType, _name, _calories, _protein, _fat, _carbs, block.timestamp);
        emit ScoreUpdated(msg.sender, userWellnessData[msg.sender].totalScore, mealReward, block.timestamp);
    }
    
    /**
     * @dev Log sleep session
     */
    function logSleep(uint256 _duration) external {
        require(hasWellnessData[msg.sender], "Wellness data not initialized");
        require(_duration > 0, "Duration must be greater than 0");
        require(_duration <= 24, "Sleep duration cannot exceed 24 hours");
        
        uint256 sleepId = userWellnessData[msg.sender].totalSleepSessions + 1;
        
        // Create new sleep session
        Sleep memory newSleep = Sleep({
            id: sleepId,
            duration: _duration,
            timestamp: block.timestamp,
            completed: true
        });
        
        // Store sleep in separate mapping
        userSleepSessions[msg.sender][sleepId] = newSleep;
        userWellnessData[msg.sender].totalSleepSessions++;
        
        // Give reward for sleep logging
        uint256 sleepReward = 15;
        userWellnessData[msg.sender].totalScore += sleepReward;
        
        // Update streak
        _updateStreak();
        
        // Update weekly goals
        _updateWeeklyGoals("sleep");
        
        // Update last activity timestamp
        userWellnessData[msg.sender].lastActivityTimestamp = block.timestamp;
        
        emit SleepLogged(msg.sender, _duration, block.timestamp);
        emit ScoreUpdated(msg.sender, userWellnessData[msg.sender].totalScore, sleepReward, block.timestamp);
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
        
        // If this is the first activity or more than 2 days have passed, reset streak
        if (lastActivity == 0 || (currentTime - lastActivity) > 2 days) {
            userWellnessData[msg.sender].streakCount = 1;
            userWellnessData[msg.sender].dailyStreakStart = currentTime;
        } else if ((currentTime - lastActivity) <= 1 days) {
            // If activity is within 1 day, increment streak
            userWellnessData[msg.sender].streakCount++;
        }
        
        emit StreakUpdated(msg.sender, userWellnessData[msg.sender].streakCount, currentTime);
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
        uint256 totalWorkouts,
        uint256 totalMeditations,
        uint256 totalMeals,
        uint256 totalSleepSessions
    ) {
        require(hasWellnessData[_user], "Wellness data not initialized");
        
        WellnessData memory data = userWellnessData[_user];
        return (
            data.streakCount,
            data.totalScore,
            data.lastActivityTimestamp,
            data.dailyStreakStart,
            data.totalWorkouts,
            data.totalMeditations,
            data.totalMeals,
            data.totalSleepSessions
        );
    }
    
    /**
     * @dev Get user's weekly goals
     */
    function getUserWeeklyGoals(address _user) external view returns (
        uint256 exerciseCurrent,
        uint256 exerciseTarget,
        uint256 meditationCurrent,
        uint256 meditationTarget,
        uint256 sleepCurrent,
        uint256 sleepTarget,
        bool exerciseCompleted,
        bool meditationCompleted,
        bool sleepCompleted
    ) {
        require(hasWellnessData[_user], "Wellness data not initialized");
        
        WeeklyGoals memory goals = userWellnessData[_user].weeklyGoals;
        return (
            goals.exerciseCurrent,
            goals.exerciseTarget,
            goals.meditationCurrent,
            goals.meditationTarget,
            goals.sleepCurrent,
            goals.sleepTarget,
            goals.exerciseCompleted,
            goals.meditationCompleted,
            goals.sleepCompleted
        );
    }
    
    /**
     * @dev Get a specific workout by ID
     */
    function getWorkout(address _user, uint256 _workoutId) external view returns (
        uint256 id,
        uint256 duration,
        uint256 sets,
        uint256 caloriesBurned,
        string memory activityType,
        string memory name,
        uint256 reward,
        uint256 timestamp,
        bool completed
    ) {
        require(hasWellnessData[_user], "Wellness data not initialized");
        require(_workoutId > 0 && _workoutId <= userWellnessData[_user].totalWorkouts, "Invalid workout ID");
        
        Workout memory workout = userWorkouts[_user][_workoutId];
        return (
            workout.id,
            workout.duration,
            workout.sets,
            workout.caloriesBurned,
            workout.activityType,
            workout.name,
            workout.reward,
            workout.timestamp,
            workout.completed
        );
    }
    
    /**
     * @dev Get a specific meditation by ID
     */
    function getMeditation(address _user, uint256 _meditationId) external view returns (
        uint256 id,
        uint256 duration,
        string memory name,
        uint256 reward,
        uint256 timestamp,
        bool completed
    ) {
        require(hasWellnessData[_user], "Wellness data not initialized");
        require(_meditationId > 0 && _meditationId <= userWellnessData[_user].totalMeditations, "Invalid meditation ID");
        
        Meditation memory meditation = userMeditations[_user][_meditationId];
        return (
            meditation.id,
            meditation.duration,
            meditation.name,
            meditation.reward,
            meditation.timestamp,
            meditation.completed
        );
    }
    
    /**
     * @dev Get a specific meal by ID
     */
    function getMeal(address _user, uint256 _mealId) external view returns (
        uint256 id,
        string memory mealType,
        string memory name,
        uint256 calories,
        uint256 protein,
        uint256 fat,
        uint256 carbs,
        uint256 timestamp
    ) {
        require(hasWellnessData[_user], "Wellness data not initialized");
        require(_mealId > 0 && _mealId <= userWellnessData[_user].totalMeals, "Invalid meal ID");
        
        Meal memory meal = userMeals[_user][_mealId];
        return (
            meal.id,
            meal.mealType,
            meal.name,
            meal.calories,
            meal.protein,
            meal.fat,
            meal.carbs,
            meal.timestamp
        );
    }
    
    /**
     * @dev Get a specific sleep session by ID
     */
    function getSleep(address _user, uint256 _sleepId) external view returns (
        uint256 id,
        uint256 duration,
        uint256 timestamp,
        bool completed
    ) {
        require(hasWellnessData[_user], "Wellness data not initialized");
        require(_sleepId > 0 && _sleepId <= userWellnessData[_user].totalSleepSessions, "Invalid sleep ID");
        
        Sleep memory sleep = userSleepSessions[_user][_sleepId];
        return (
            sleep.id,
            sleep.duration,
            sleep.timestamp,
            sleep.completed
        );
    }
    
    /**
     * @dev Check if user has wellness data initialized
     */
    function hasUserWellnessData(address _user) external view returns (bool) {
        return hasWellnessData[_user];
    }
    
    /**
     * @dev Get total count of wellness activities for a user
     */
    function getUserActivityCounts(address _user) external view returns (
        uint256 totalWorkouts,
        uint256 totalMeditations,
        uint256 totalMeals,
        uint256 totalSleepSessions
    ) {
        require(hasWellnessData[_user], "Wellness data not initialized");
        
        WellnessData memory data = userWellnessData[_user];
        return (
            data.totalWorkouts,
            data.totalMeditations,
            data.totalMeals,
            data.totalSleepSessions
        );
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
