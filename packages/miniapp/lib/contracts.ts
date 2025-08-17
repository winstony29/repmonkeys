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

// Contract addresses (set via environment variables)
export const CONTRACT_ADDRESSES = {
  WELLNESS_NFT: process.env.NEXT_PUBLIC_WELLNESS_NFT_ADDRESS as `0x${string}`,
  WELL_TOKEN: process.env.NEXT_PUBLIC_WELL_TOKEN_ADDRESS as `0x${string}`,
  REWARDS: process.env.NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS as `0x${string}`,
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

