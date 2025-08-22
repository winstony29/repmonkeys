# 🚀 WellnessNFT Contract Deployment Guide

## 📋 Prerequisites

1. **Base Sepolia Testnet ETH**: You need some testnet ETH for gas fees
2. **Private Key**: A wallet private key (without 0x prefix)
3. **Foundry Installed**: Make sure you have Foundry installed

## 🔧 Step 1: Environment Setup

Create a `.env` file in the `packages/contracts` directory:

```bash
# Private key for contract deployment (without 0x prefix)
# IMPORTANT: Use a test wallet with some Base Sepolia ETH for gas fees
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_SEPOLIA_RPC=https://sepolia.base.org

# Etherscan API key for contract verification (optional)
ETHERSCAN_API_KEY_BASE_SEPOLIA=your_api_key_here

# Deployment Configuration
CHAIN_ID=84532
CHAIN_NAME=base-sepolia
```

## 💰 Step 2: Get Base Sepolia Testnet ETH

1. **Visit Base Sepolia Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. **Connect your wallet** (the one you'll use for deployment)
3. **Request testnet ETH** (usually 0.01 ETH is sufficient)

## 🚀 Step 3: Deploy the Updated Contract

Navigate to the contracts directory and run the deployment:

```bash
cd packages/contracts

# Deploy to Base Sepolia testnet
forge script script/DeployWellnessNFT.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY_BASE_SEPOLIA \
  --chain-id 84532
```

## 📝 Step 4: Update Frontend Environment

After successful deployment, copy the deployed contract address and update your frontend `.env` file:

```bash
# In packages/playground/.env
NEXT_PUBLIC_WELLNESS_NFT_ADDRESS=0x... # Your new deployed contract address
```

## ✅ Step 5: Verify Deployment

1. **Check the deployment logs** for the contract address
2. **Verify on Base Sepolia Explorer**: https://sepolia.basescan.org
3. **Test the contract functions** using the explorer

## 🔍 Step 6: Test Contract Functions

You can test the contract using Foundry:

```bash
# Test the contract
forge test

# Run specific test
forge test --match-test testWellnessNFT
```

## 🆕 New Features in Updated Contract

### User Minting Function
- **`mintWellnessNFT(string memory uri)`**: Allows users to mint their own NFTs
- **No owner restriction**: Users can mint directly
- **Profile tracking**: Prevents duplicate NFTs per user

### Enhanced View Functions
- **`totalSupply()`**: Get total number of NFTs minted
- **`getUserNFTs(address user)`**: Get all NFTs for a specific user

### Events
- **`NFTMinted(address indexed user, uint256 indexed tokenId, string uri)`**: Emitted when NFTs are minted

## 🚨 Important Notes

### Migration from Old Contract
If you're updating an existing contract:

1. **Deploy the new contract** to a new address
2. **Update frontend environment** with new address
3. **Test user minting** functionality
4. **Consider data migration** if needed

### Gas Optimization
The updated contract includes:
- Efficient storage patterns
- Optimized loops for user NFT queries
- Event emission for better tracking

## 🎯 Success Criteria

- ✅ Contract deployed to Base Sepolia
- ✅ User minting function working
- ✅ Frontend environment updated
- ✅ NFT generation and minting working
- ✅ Blockchain integration verified

## 🔗 Next Steps

1. **Test user minting** with the frontend
2. **Verify NFT metadata** storage
3. **Test IPFS integration** (when implemented)
4. **Monitor gas usage** and optimize if needed

---

**Need Help?** Check the console logs for any error messages during deployment.
