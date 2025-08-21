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
      { name: '_activityType', type: 'string' },
      { name: '_name', type: 'string' },
      { name: '_reward', type: 'uint256' }
    ],
    name: 'logActivity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: '_mealType', type: 'string' },
      { name: '_name', type: 'string' },
      { name: '_calories', type: 'uint256' }
    ],
    name: 'logMeal',
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
      {
        name: 'weeklyGoals',
        type: 'tuple',
        components: [
          { name: 'exerciseCurrent', type: 'uint256' },
          { name: 'exerciseTarget', type: 'uint256' },
          { name: 'meditationCurrent', type: 'uint256' },
          { name: 'meditationTarget', type: 'uint256' },
          { name: 'sleepCurrent', type: 'uint256' },
          { name: 'sleepTarget', type: 'uint256' },
          { name: 'exerciseCompleted', type: 'bool' },
          { name: 'meditationCompleted', type: 'bool' },
          { name: 'sleepCompleted', type: 'bool' }
        ]
      },
      { name: 'totalActivities', type: 'uint256' },
      { name: 'totalMeals', type: 'uint256' }
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

// Contract addresses (set via environment variables or fallback to deployed addresses)
export const CONTRACT_ADDRESSES = {
  WELLNESS_NFT: (process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS || '0x84b5fc5a47a4FcEe67793eB149032A4A981B5F04') as `0x${string}`,
  WELL_TOKEN: (process.env.NEXT_PUBLIC_WELL_TOKEN_ADDRESS || '0x3d1B85c7c772295B754A74e928eA9d3C29769c7e') as `0x${string}`,
  REWARDS: (process.env.NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS || '0x28Fd86Fe69bA36b9E12f5A8F0395D172Ac227D29') as `0x${string}`,
  USER_PROFILE: (process.env.NEXT_PUBLIC_USER_PROFILE_ADDRESS || '0x62513A440FCb39604Aa2B5Ae926f14DDa9E129Ca') as `0x${string}`,
  WELLNESS_TRACKER: (process.env.NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS || '0x6f6ec3ca1B207172625b32821bcBEE36c49b49fA') as `0x${string}`,
}

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
  chainId: 84532, // Base Sepolia testnet (where contracts are deployed)
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
