# 🚀 WellnessTracker Contract Deployment Guide

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

## 🚀 Step 3: Deploy the Contract

Navigate to the contracts directory and run the deployment:

```bash
cd packages/contracts

# Deploy to Base Sepolia testnet
forge script script/DeployWellnessTracker.s.sol \
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
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=0x... # Your deployed contract address
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
forge test --match-test testWellnessTracker
```

## 🚨 Troubleshooting

### Common Issues:

1. **Insufficient Gas**: Make sure you have enough Base Sepolia ETH
2. **Wrong Network**: Ensure you're on Base Sepolia (Chain ID: 84532)
3. **Private Key Format**: Remove the 0x prefix from your private key
4. **RPC Issues**: Try alternative RPC endpoints if needed

### Alternative RPC Endpoints:

```bash
# If the main RPC fails, try these:
https://base-sepolia.public.blastapi.io
https://base-sepolia.drpc.org
https://sepolia.base.org
```

## 📊 Expected Output

After successful deployment, you should see:

```
WellnessTracker deployed at: 0x1234...5678
Deployer: 0xabcd...efgh
```

## 🔗 Next Steps

1. **Update frontend environment variables**
2. **Restart the frontend application**
3. **Test wellness data initialization**
4. **Verify on-chain data storage**

## 🎯 Success Criteria

- ✅ Contract deployed to Base Sepolia
- ✅ Contract address obtained
- ✅ Frontend environment updated
- ✅ Wellness data initialization working
- ✅ Activities and meals stored on-chain

---

**Need Help?** Check the console logs for any error messages during deployment.
