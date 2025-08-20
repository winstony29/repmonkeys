import { Injectable, Logger } from '@nestjs/common';
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { baseGoerli } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Contract ABIs (simplified for now)
const WELLNESS_NFT_ABI = [
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
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'sleepDuration', type: 'uint256' },
      { name: 'sleepQuality', type: 'uint256' },
      { name: 'fitnessActivityType', type: 'string' },
      { name: 'fitnessDuration', type: 'uint256' }
    ],
    name: 'logWellnessActivity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;



// WELL Token ABI
const WELL_TOKEN_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  
  private readonly publicClient = createPublicClient({
    chain: baseGoerli,
    transport: http(process.env.BASE_GOERLI_RPC || 'https://goerli.base.org'),
  });
  
  private readonly walletClient = createWalletClient({
    chain: baseGoerli,
    transport: http(process.env.BASE_GOERLI_RPC || 'https://goerli.base.org'),
    account: process.env.PRIVATE_KEY ? privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`) : undefined,
  });
  
  // Contract addresses (these will be set after deployment)
  private wellnessNFTAddress: `0x${string}` | null = null;
  private wellTokenAddress: `0x${string}` | null = null;
  
  constructor() {
    this.logger.log('🔧 Initializing BlockchainService...');
    
    try {
      // Validate environment variables
      if (!process.env.PRIVATE_KEY) {
        this.logger.warn('⚠️ PRIVATE_KEY not set - blockchain operations will be limited');
      } else {
        this.logger.log('✅ Private key configured');
      }
      
      if (!process.env.BASE_GOERLI_RPC) {
        this.logger.log('📡 Using default Base Goerli RPC endpoint');
      } else {
        this.logger.log('📡 Using custom Base Goerli RPC endpoint');
      }
      
      this.logger.log('✅ BlockchainService initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize BlockchainService:', error.stack);
      throw error;
    }
    
    // In production, these would be loaded from environment variables or database
    this.wellnessNFTAddress = process.env.WELLNESS_NFT_ADDRESS as `0x${string}` || null;
    this.wellTokenAddress = process.env.WELL_TOKEN_ADDRESS as `0x${string}` || null;
  }
  
  /**
   * Mint a wellness profile NFT for a user
   * @param userAddress User's wallet address
   * @param metadataUri IPFS URI containing metadata
   */
  async mintNft(userAddress: string, metadataUri: string): Promise<string> {
    if (!this.wellnessNFTAddress) {
      throw new Error('WellnessNFT contract address not set');
    }
    
    try {
      this.logger.log(`Minting NFT for user ${userAddress} with URI: ${metadataUri}`);
      
      // Mock implementation for now - in production this would call the actual contract
      const mockTokenId = Math.floor(Math.random() * 1000000);
      this.logger.log(`Mock NFT minted with token ID: ${mockTokenId}`);
      
      return `Mock NFT minted successfully. Token ID: ${mockTokenId}`;
    } catch (error) {
      this.logger.error(`Failed to mint NFT: ${error.message}`);
      throw new Error(`NFT minting failed: ${error.message}`);
    }
  }
  
  /**
   * Award WELL tokens to a user
   * @param userAddress User's wallet address
   * @param amount Amount of tokens to award
   */
  async awardWellTokens(userAddress: string, amount: number): Promise<string> {
    if (!this.wellTokenAddress) {
      throw new Error('WellToken contract address not set');
    }
    
    try {
      this.logger.log(`Awarding ${amount} WELL tokens to user ${userAddress}`);
      
      // Mock implementation for now
      this.logger.log(`Mock: ${amount} WELL tokens awarded to ${userAddress}`);
      
      return `Successfully awarded ${amount} WELL tokens to ${userAddress}`;
    } catch (error) {
      this.logger.error(`Failed to award tokens: ${error.message}`);
      throw new Error(`Token award failed: ${error.message}`);
    }
  }
  
  /**
   * Get user's WELL token balance
   * @param userAddress User's wallet address
   */
  async getUserWellBalance(userAddress: string): Promise<string> {
    if (!this.wellTokenAddress) {
      throw new Error('WellToken contract address not set');
    }
    
    try {
      // Mock balance for now
      const mockBalance = Math.floor(Math.random() * 1000);
      this.logger.log(`Mock balance for ${userAddress}: ${mockBalance} WELL`);
      
      return formatEther(BigInt(mockBalance) * 10n ** 18n);
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`);
      throw new Error(`Balance check failed: ${error.message}`);
    }
  }
  
  /**
   * Log a user's wellness activity and optionally award WELL tokens
   */
  async logWellnessActivity(
    walletAddress: string,
    sleepDuration: number,
    sleepQuality: number,
    fitnessActivityType: string,
    fitnessDuration: number,
  ): Promise<{ message: string; rewardTokens: number }> {
    try {
      this.logger.log(
        `Logging wellness activity for ${walletAddress} | sleepDuration=${sleepDuration}, sleepQuality=${sleepQuality}, fitnessType=${fitnessActivityType}, fitnessDuration=${fitnessDuration}`,
      );

      // If we have an NFT address and a signer, try to log on-chain first
      if (this.wellnessNFTAddress && this.walletClient.account) {
        try {
          // In a full implementation, we'd look up the user's tokenId from chain.
          // For now, assume tokenId mapping exists off-chain or 1:1 with some derivation.
          // Placeholder: fetch tokenId via a view call if ABI exposed; otherwise, require client to pass it.
          // Here, we call the contract method and let it revert if not the owner.
          const args = [
            BigInt(1), // TODO: replace with actual tokenId lookup
            BigInt(Math.max(0, Math.floor(sleepDuration))),
            BigInt(Math.max(0, Math.floor(sleepQuality))),
            fitnessActivityType,
            BigInt(Math.max(0, Math.floor(fitnessDuration)))
          ] as const;

          const hash = await this.walletClient.writeContract({
            account: this.walletClient.account,
            chain: baseGoerli,
            address: this.wellnessNFTAddress,
            abi: WELLNESS_NFT_ABI,
            functionName: 'logWellnessActivity',
            args,
          });
          this.logger.log(`On-chain wellness activity tx submitted: ${hash}`);
        } catch (chainErr) {
          this.logger.warn(`On-chain log failed, continuing with off-chain scoring: ${chainErr.message}`);
        }
      } else {
        this.logger.warn('NFT address or signer not configured. Skipping on-chain log.');
      }

      // Simple mock scoring model for rewards (off-chain)
      const normalizedSleepQuality = Math.max(0, Math.min(100, sleepQuality));
      const sleepScore = Math.min(8, Math.max(0, sleepDuration)) * 2; // up to 16
      const qualityScore = (normalizedSleepQuality / 100) * 10; // up to 10
      const fitnessScore = Math.min(120, Math.max(0, fitnessDuration)) / 6; // up to 20
      const totalScore = sleepScore + qualityScore + fitnessScore; // up to ~46

      const rewardTokens = Math.floor(totalScore);

      // Optionally award tokens if contract address is configured
      if (this.wellTokenAddress) {
        await this.awardWellTokens(walletAddress, rewardTokens);
      } else {
        this.logger.warn('WellToken address not set. Skipping on-chain award.');
      }

      return {
        message: 'Wellness activity logged successfully',
        rewardTokens,
      };
    } catch (error) {
      this.logger.error(`Failed to log wellness activity: ${error.message}`);
      throw new Error(`Logging wellness activity failed: ${error.message}`);
    }
  }
  
  /**
   * Set contract addresses (for testing/deployment)
   */
  setContractAddresses(nftAddress: string, tokenAddress: string) {
    this.wellnessNFTAddress = nftAddress as `0x${string}`;
    this.wellTokenAddress = tokenAddress as `0x${string}`;
    this.logger.log(`Contract addresses set - NFT: ${nftAddress}, Token: ${tokenAddress}`);
  }
}

