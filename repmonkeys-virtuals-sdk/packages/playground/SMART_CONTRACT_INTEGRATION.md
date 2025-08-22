# 🚀 Smart Contract Integration for Wellness Data

## Overview
This document describes the complete integration of the `WellnessTracker` smart contract with the frontend application, enabling on-chain storage of all wellness data including activities, meals, streaks, scores, and weekly goals.

## 🏗️ Smart Contract Architecture

### WellnessTracker.sol
- **Purpose**: Stores comprehensive wellness data on-chain
- **Features**: Activity tracking, meal logging, streak management, weekly goals, score tracking
- **Data Structures**: Activities, Meals, WeeklyGoals, WellnessData
- **Key Functions**: `logActivity()`, `logMeal()`, `getUserWellnessData()`, `resetWeeklyGoals()`

### Data Flow
1. **User Action** → Frontend State Update (immediate UI response)
2. **Smart Contract Call** → On-chain data storage
3. **localStorage Backup** → Fallback data persistence
4. **Real-time Sync** → Contract data loading and display

## 🔗 Frontend Integration

### Contract Hooks
```typescript
// Wellness data from smart contract
const { data: wellnessData } = useReadContract({
  address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
  abi: wellnessTrackerAbi,
  functionName: 'getUserWellnessData',
  args: address ? [address] : undefined,
});

// Recent activities from smart contract
const { data: contractActivities } = useReadContract({
  address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
  abi: wellnessTrackerAbi,
  functionName: 'getUserRecentActivities',
  args: address ? [address, BigInt(10)] : undefined,
});
```

### Key Functions

#### 1. Activity Logging
```typescript
const logActivity = async (type: string, name: string, reward: number) => {
  // Update local state immediately
  setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
  setTotalScore(prev => prev + reward);
  setStreakCount(prev => prev + 1);
  
  // Save to smart contract if available
  if (address && hasWellnessData) {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'logActivity',
        args: [type, name, BigInt(reward)],
      });
      console.log('✅ Activity logged to smart contract');
    } catch (error) {
      console.log('🔄 Falling back to localStorage only');
    }
  }
  
  // Always save to localStorage as backup
  // ... localStorage logic
};
```

#### 2. Meal Logging
```typescript
const addMeal = async () => {
  // Save meal to smart contract if available
  if (address && hasWellnessData) {
    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
        abi: wellnessTrackerAbi,
        functionName: 'logMeal',
        args: [newMeal.type, newMeal.name, BigInt(newMeal.calories)],
      });
      console.log('✅ Meal logged to smart contract');
    } catch (error) {
      console.log('🔄 Falling back to localStorage only');
    }
  }
};
```

#### 3. Wellness Data Initialization
```typescript
const initializeWellnessData = async () => {
  try {
    await writeContract({
      address: CONTRACT_ADDRESSES.WELLNESS_TRACKER,
      abi: wellnessTrackerAbi,
      functionName: 'initializeWellnessData',
      args: [],
    });
    setWellnessDataInitialized(true);
    console.log('✅ Wellness data initialized on smart contract');
  } catch (error) {
    setContractError('Failed to initialize wellness data');
  }
};
```

## 📊 Data Synchronization

### Smart Contract Priority
1. **Primary**: All data stored on-chain via smart contracts
2. **Backup**: localStorage as fallback when contracts unavailable
3. **Real-time**: Contract data automatically loads and updates UI

### Data Loading Flow
```typescript
// 1. Load wellness data from smart contract
useEffect(() => {
  if (wellnessData && Array.isArray(wellnessData)) {
    const [streakCount, totalScore, weeklyGoals] = wellnessData;
    setStreakCount(Number(streakCount));
    setTotalScore(Number(totalScore));
    // ... update other state
  }
}, [wellnessData]);

// 2. Load activities from smart contract
useEffect(() => {
  if (contractActivities && Array.isArray(contractActivities)) {
    const formattedActivities = contractActivities.map(activity => ({
      id: Number(activity[0]),
      type: activity[1],
      name: activity[2],
      reward: Number(activity[3]),
      timestamp: Number(activity[4]),
      completed: activity[5]
    }));
    setActivities(formattedActivities);
  }
}, [contractActivities]);

// 3. Fallback to localStorage if smart contract fails
useEffect(() => {
  if (address && !isOnboarded && !isCheckingContract) {
    const savedData = localStorage.getItem(`wellspace_user_${address}`);
    if (savedData) {
      // ... load from localStorage
    }
  }
}, [address, isOnboarded, isCheckingContract]);
```

## 🎯 User Experience Features

### Status Banners
1. **Contract Error Banner**: Shows when smart contracts are unavailable
2. **Initialization Banner**: Prompts user to initialize on-chain data
3. **Success Banner**: Confirms when wellness data is active on-chain
4. **Temporary Success**: Shows when data is first initialized

### Smart Contract Indicators
- **Green Circle**: User has wellness data initialized
- **Yellow Circle**: User needs to initialize wellness data
- **Status Messages**: Real-time feedback on contract operations

### Fallback Handling
- **Graceful Degradation**: App works with localStorage when contracts fail
- **Automatic Retry**: "Retry Connection" button for contract health checks
- **Data Persistence**: No data loss during contract issues

## 🔧 Configuration

### Environment Variables
```bash
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=0x1234567890123456789012345678901234567890
```

### Contract Addresses
```typescript
export const CONTRACT_ADDRESSES = {
  WELLNESS_TRACKER: process.env.NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS || '0x1234...',
  // ... other contracts
};
```

## 📝 Logging and Debugging

### Console Logs
- **📝 Transaction submitted**: Smart contract calls
- **✅ Success messages**: Contract operations completed
- **🔄 Fallback messages**: localStorage usage when contracts fail
- **📊 Data loading**: Contract data retrieval
- **🔍 Debug info**: Comprehensive contract status

### Debug Information
```typescript
console.log('🔍 Debug - Has wellness data:', hasWellnessData);
console.log('🔍 Debug - Wellness data:', wellnessData);
console.log('🔍 Debug - Contract activities:', contractActivities);
console.log('🔍 Debug - Contract meals:', contractMeals);
```

## 🚀 Deployment Steps

### 1. Deploy Smart Contract
```bash
cd packages/contracts
forge script script/DeployWellnessTracker.s.sol --rpc-url <RPC_URL> --broadcast
```

### 2. Update Environment Variables
```bash
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
```

### 3. Verify Contract
```bash
forge verify-contract <CONTRACT_ADDRESS> src/WellnessTracker.sol --chain-id <CHAIN_ID>
```

## ✅ Benefits of On-Chain Storage

1. **🔒 Immutability**: All wellness data permanently stored
2. **🌐 Transparency**: Public blockchain verification
3. **🛡️ Security**: No data manipulation or loss
4. **🔗 Interoperability**: Can be used by other dApps
5. **💰 True Rewards**: On-chain token distribution
6. **📊 Analytics**: Public wellness statistics
7. **🎯 Ownership**: Users truly own their data

## 🔄 Migration from localStorage

### Current State
- **Activities**: ✅ Stored on-chain + localStorage backup
- **Meals**: ✅ Stored on-chain + localStorage backup  
- **Streaks**: ✅ Stored on-chain + localStorage backup
- **Scores**: ✅ Stored on-chain + localStorage backup
- **Weekly Goals**: ✅ Stored on-chain + localStorage backup

### Data Flow
1. **User Action** → Update local state (immediate)
2. **Smart Contract** → Store on-chain (primary)
3. **localStorage** → Backup storage (fallback)
4. **Contract Read** → Load latest data (sync)

## 🎉 Success Metrics

- **Smart Contract Integration**: ✅ Complete
- **Data Persistence**: ✅ On-chain + localStorage fallback
- **User Experience**: ✅ Seamless with status indicators
- **Error Handling**: ✅ Graceful degradation
- **Real-time Sync**: ✅ Contract data loading
- **Fallback System**: ✅ localStorage backup

## 🚧 Future Enhancements

1. **Batch Operations**: Multiple activities in single transaction
2. **Gas Optimization**: Efficient contract calls
3. **Data Compression**: Optimize storage costs
4. **Cross-chain**: Multi-chain wellness data
5. **Privacy**: Zero-knowledge proofs for sensitive data
6. **Analytics**: On-chain wellness insights

---

**Status**: ✅ **FULLY INTEGRATED** - All wellness data now stored on-chain with robust fallback system
