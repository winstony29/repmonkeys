// Contract ABIs for the wellness application

export const wellnessNFTAbi = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'uri', type: 'string' }
    ],
    name: 'safeMint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'uri', type: 'string' }],
    name: 'mintWellnessNFT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'userHasProfile',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserTokenId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserNFTs',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export const wellTokenAbi = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

export const rewardsAbi = [
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'distributeReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getUserTotalRewards',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export const userProfileAbi = [
  {
    inputs: [
      { name: '_goals', type: 'string[]' },
      { name: '_imageTheme', type: 'string' },
      { name: '_customPrompt', type: 'string' },
      { name: '_profileImageUrl', type: 'string' }
    ],
    name: 'createProfile',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_newGoals', type: 'string[]' }],
    name: 'updateGoals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_newStreak', type: 'uint256' }],
    name: 'updateStreak',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_newScore', type: 'uint256' }],
    name: 'updateScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_newImageUrl', type: 'string' }],
    name: 'updateProfileImage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    name: 'setNftTokenId',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'updateActivity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'hasUserOnboarded',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserProfile',
    outputs: [
      { name: 'hasOnboarded', type: 'bool' },
      { name: 'goals', type: 'string[]' },
      { name: 'preferredImageTheme', type: 'string' },
      { name: 'customPrompt', type: 'string' },
      { name: 'streakCount', type: 'uint256' },
      { name: 'totalScore', type: 'uint256' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'lastActive', type: 'uint256' },
      { name: 'profileImageUrl', type: 'string' },
      { name: 'nftTokenId', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserGoals',
    outputs: [{ name: '', type: 'string[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserStats',
    outputs: [
      { name: 'streak', type: 'uint256' },
      { name: 'score', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getProfileImageUrl',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getNftTokenId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export const wellnessTrackerAbi = [
  {
    inputs: [],
    name: 'initializeWellnessData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_duration', type: 'uint256' },
      { name: '_sets', type: 'uint256' },
      { name: '_caloriesBurned', type: 'uint256' },
      { name: '_activityType', type: 'string' },
      { name: '_name', type: 'string' },
      { name: '_reward', type: 'uint256' }
    ],
    name: 'logWorkout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_duration', type: 'uint256' },
      { name: '_name', type: 'string' },
      { name: '_reward', type: 'uint256' }
    ],
    name: 'logMeditation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_mealType', type: 'string' },
      { name: '_name', type: 'string' },
      { name: '_calories', type: 'uint256' },
      { name: '_protein', type: 'uint256' },
      { name: '_fat', type: 'uint256' },
      { name: '_carbs', type: 'uint256' }
    ],
    name: 'logMeal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_duration', type: 'uint256' }
    ],
    name: 'logSleep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'resetWeeklyGoals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'hasUserWellnessData',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserWellnessData',
    outputs: [
      { name: 'streakCount', type: 'uint256' },
      { name: 'totalScore', type: 'uint256' },
      { name: 'lastActivityTimestamp', type: 'uint256' },
      { name: 'dailyStreakStart', type: 'uint256' },
      { name: 'totalWorkouts', type: 'uint256' },
      { name: 'totalMeditations', type: 'uint256' },
      { name: 'totalMeals', type: 'uint256' },
      { name: 'totalSleepSessions', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: '_user', type: 'address' }],
    name: 'getUserWeeklyGoals',
    outputs: [
      { name: 'exerciseCurrent', type: 'uint256' },
      { name: 'exerciseTarget', type: 'uint256' },
      { name: 'meditationCurrent', type: 'uint256' },
      { name: 'meditationTarget', type: 'uint256' },
      { name: 'sleepCurrent', type: 'uint256' },
      { name: 'sleepTarget', type: 'uint256' },
      { name: 'exerciseCompleted', type: 'bool' },
      { name: 'meditationCompleted', type: 'bool' },
      { name: 'sleepCompleted', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_count', type: 'uint256' }
    ],
    name: 'getUserRecentActivities',
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'activityType', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'reward', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'completed', type: 'bool' }
        ]
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_count', type: 'uint256' }
    ],
    name: 'getUserRecentMeals',
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'mealType', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'calories', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// Enhanced logging for environment variable debugging
console.log('🔍 Environment Variable Debug - Server Side:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - Current working directory:', process.cwd());
console.log('  - Raw process.env keys:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));

// Log each environment variable individually
const envVars = [
  'NEXT_PUBLIC_WELLNESS_NFT_ADDRESS',
  'NEXT_PUBLIC_WELL_TOKEN_ADDRESS',
  'NEXT_PUBLIC_REWARDS_ADDRESS',
  'NEXT_PUBLIC_USER_PROFILE_ADDRESS',
  'NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`  - ${varName}: ${value ? `${value.slice(0, 10)}...` : 'UNDEFINED'}`);
});

// Contract addresses (set via environment variables only - no fallbacks)
export const CONTRACT_ADDRESSES = {
  WELLNESS_NFT: process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS as `0x${string}`,
  WELL_TOKEN: process.env.NEXT_PUBLIC_WELL_TOKEN_ADDRESS as `0x${string}`,
  REWARDS: process.env.NEXT_PUBLIC_REWARDS_ADDRESS as `0x${string}`,
  USER_PROFILE: process.env.NEXT_PUBLIC_USER_PROFILE_ADDRESS as `0x${string}`,
  WELLNESS_TRACKER: process.env.NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS as `0x${string}`,
}

// Log the final contract addresses object
console.log('🔍 Final CONTRACT_ADDRESSES object:');
Object.entries(CONTRACT_ADDRESSES).forEach(([key, value]) => {
  console.log(`  - ${key}: ${value || 'UNDEFINED'}`);
});

// Validate that all required environment variables are set
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'NEXT_PUBLIC_WELLNESS_NFT_ADDRESS',
    'NEXT_PUBLIC_WELL_TOKEN_ADDRESS', 
    'NEXT_PUBLIC_REWARDS_ADDRESS',
    'NEXT_PUBLIC_USER_PROFILE_ADDRESS',
    'NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Some environment variables appear undefined:', missingVars);
    console.log('📝 Note: This can happen during Next.js SSR/hydration - variables may still load correctly');
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ All required environment variables are set');
};

// Run validation when this module is imported
if (typeof window !== 'undefined') {
  // Only validate in browser environment
  try {
    // Check if we're in development mode and log what we can see
    console.log('🔍 Environment Check - Browser Environment:');
    console.log('  - NEXT_PUBLIC_WELLNESS_NFT_ADDRESS:', process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS);
    console.log('  - NEXT_PUBLIC_WELL_TOKEN_ADDRESS:', process.env.NEXT_PUBLIC_WELL_TOKEN_ADDRESS);
    console.log('  - NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS:', process.env.NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS);
    console.log('  - NEXT_PUBLIC_USER_PROFILE_ADDRESS:', process.env.NEXT_PUBLIC_USER_PROFILE_ADDRESS);
    console.log('  - NEXT_PUBLIC_REWARDS_ADDRESS:', process.env.NEXT_PUBLIC_REWARDS_ADDRESS);
    
    // Temporarily disable validation to see if variables are loaded
    console.log('🔍 Contract Addresses Object:');
    console.log('  - WELLNESS_NFT:', CONTRACT_ADDRESSES.WELLNESS_NFT);
    console.log('  - WELL_TOKEN:', CONTRACT_ADDRESSES.WELL_TOKEN);
    console.log('  - WELLNESS_TRACKER:', CONTRACT_ADDRESSES.WELLNESS_TRACKER);
    console.log('  - USER_PROFILE:', CONTRACT_ADDRESSES.USER_PROFILE);
    console.log('  - REWARDS:', CONTRACT_ADDRESSES.REWARDS);
    
    // Only validate if we have the variables
    if (process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS) {
      validateEnvironmentVariables();
    } else {
      console.warn('⚠️ Environment variables not loaded yet - this is normal during development');
    }
  } catch (error) {
    console.error('Environment validation failed:', error);
  }
}

// Contract connectivity testing function
export const testContractConnectivity = async () => {
  console.log('🌐 Testing contract connectivity...');
  
  // Test Base Mainnet RPC connection
  try {
    // Use Alchemy RPC for better reliability (you can also use Infura or QuickNode)
    const rpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL || 'https://mainnet.base.org';
    console.log(`📡 Testing RPC connection to: ${rpcUrl}`);
    
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('⚠️ Rate limited by RPC provider. Consider using Alchemy or Infura for better reliability.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📡 RPC Response:', data);
    
    if (data.result === '0x2105') { // 8453 in hex (Base Mainnet)
      console.log('✅ Base Mainnet RPC connection successful');
    } else {
      console.error('❌ Unexpected chain ID from RPC. Expected: 0x2105, Got:', data.result);
    }
  } catch (error) {
    console.error('❌ RPC connection failed:', error);
    console.log('💡 Tip: Consider setting NEXT_PUBLIC_ALCHEMY_BASE_URL for better RPC reliability');
  }
  
  // Test each contract address
  for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
    if (address && typeof address === 'string' && address.startsWith('0x')) {
      console.log(`🔍 Testing contract ${name} at ${address}`);
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_ALCHEMY_BASE_URL || 'https://mainnet.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [address, 'latest'],
            id: 1
          })
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            console.warn(`⚠️ Rate limited while checking ${name} contract. Consider using Alchemy or Infura.`);
            continue; // Skip this contract check if rate limited
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.result && data.result !== '0x') {
          console.log(`✅ Contract ${name} exists at ${address}`);
        } else {
          console.error(`❌ No contract code found at ${address} for ${name}`);
          console.log(`💡 This contract may not be deployed yet. Run the deployment script to deploy to mainnet.`);
        }
      } catch (error) {
        console.error(`❌ Failed to check contract ${name}:`, error);
      }
    } else {
      console.error(`❌ Contract ${name} has undefined address`);
    }
  }
  
  // Check if any contracts are missing and provide guidance
  const deployedContracts = Object.entries(CONTRACT_ADDRESSES).filter(([name, address]) => 
    address && typeof address === 'string' && address.startsWith('0x')
  );
  
  if (deployedContracts.length === 0) {
    console.log('');
    console.log('🚨 No contracts found! Here\'s what you need to do:');
    console.log('1. Deploy contracts to Base mainnet using: cd packages/contracts && ./deploy-mainnet.sh');
    console.log('2. Update your .env file with the new contract addresses');
    console.log('3. Consider using a reliable RPC provider like Alchemy or Infura');
    console.log('   Set NEXT_PUBLIC_ALCHEMY_BASE_URL in your .env file');
  } else {
    console.log('');
    console.log('📋 Contract deployment status:');
    console.log(`   Found ${deployedContracts.length} contract addresses`);
    console.log('   Make sure all contracts are deployed to Base mainnet');
  }
};

// Utility function to format token amounts
export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  const divisor = BigInt(10 ** decimals)
  const whole = amount / divisor
  const fraction = amount % divisor
  
  if (fraction === 0n) {
    return whole.toString()
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0')
  const trimmedFraction = fractionStr.replace(/0+$/, '')
  
  return `${whole}.${trimmedFraction}`
}

// Utility function to parse token amounts
export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  const [whole, fraction = '0'] = amount.split('.')
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(whole + paddedFraction)
}

// Wellness-specific contract interactions
export const WELLNESS_CONTRACT_CONFIG = {
  chainId: 8453, // Base Mainnet (where contracts are deployed)
  contracts: {
    wellnessNFT: {
      address: CONTRACT_ADDRESSES.WELLNESS_NFT,
      abi: wellnessNFTAbi,
    },
    wellToken: {
      address: CONTRACT_ADDRESSES.WELL_TOKEN,
      abi: wellTokenAbi,
    },
    rewards: {
      address: CONTRACT_ADDRESSES.REWARDS,
      abi: rewardsAbi,
    },
    userProfile: {
      address: CONTRACT_ADDRESSES.USER_PROFILE,
      abi: userProfileAbi,
    },
  },
}
