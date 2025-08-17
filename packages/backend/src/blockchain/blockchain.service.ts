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
  }
] as const;

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
    account: privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`),
  });
  
  // Contract addresses (these will be set after deployment)
  private wellnessNFTAddress: `0x${string}` | null = null;
  private wellTokenAddress: `0x${string}` | null = null;
  
  constructor() {
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
      
      return formatEther(BigInt(mockBalance * 10**18));
    } catch (error) {
      this.logger.error(`Failed to get balance: ${error.message}`);
      throw new Error(`Balance check failed: ${error.message}`);
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

