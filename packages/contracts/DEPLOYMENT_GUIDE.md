# 🚀 WellnessTracker Contract Deployment Guide

## 📋 Prerequisites

1. **Base Mainnet ETH**: You need some mainnet ETH for gas fees
2. **Private Key**: A wallet private key (without 0x prefix)
3. **Foundry Installed**: Make sure you have Foundry installed

## 🔧 Step 1: Environment Setup

Create a `.env` file in the `packages/contracts` directory:

```bash
# Private key for contract deployment (without 0x prefix)
# IMPORTANT: Use a wallet with some Base Mainnet ETH for gas fees
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_MAINNET_RPC=https://mainnet.base.org

# Contract verification (optional - using Sourcify or manual verification)

# Deployment Configuration
CHAIN_ID=8453
CHAIN_NAME=base-mainnet
```

## 💰 Step 2: Get Base Mainnet ETH

1. **Bridge ETH to Base**: Use the official Base bridge at https://bridge.base.org
2. **Or buy directly**: Purchase ETH on Coinbase and withdraw to Base
3. **Ensure sufficient balance**: You'll need ETH for gas fees (recommend at least 0.1 ETH)

## 🚀 Step 3: Deploy the Contract

Navigate to the contracts directory and run the deployment:

```bash
cd packages/contracts

# Deploy to Base mainnet
forge script script/DeployMainnet.s.sol \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --chain-id 8453
```

## 📝 Step 4: Update Frontend Environment

After successful deployment, copy the deployed contract address and update your frontend `.env` file:

```bash
# In packages/playground/.env
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=0x... # Your deployed contract address
```

## ✅ Step 5: Verify Deployment

1. **Check the deployment logs** for the contract address
2. **Verify on Base Mainnet Explorer**: https://basescan.org
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

1. **Insufficient Gas**: Make sure you have enough Base Mainnet ETH
2. **Wrong Network**: Ensure you're on Base Mainnet (Chain ID: 8453)
3. **Private Key Format**: Remove the 0x prefix from your private key
4. **RPC Issues**: Try alternative RPC endpoints if needed

### Alternative RPC Endpoints:

```bash
# If the main RPC fails, try these:
https://base.public.blastapi.io
https://base.drpc.org
https://mainnet.base.org
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

- ✅ Contract deployed to Base Mainnet
- ✅ Contract address obtained
- ✅ Frontend environment updated
- ✅ Wellness data initialization working
- ✅ Activities and meals stored on-chain

---

**Need Help?** Check the console logs for any error messages during deployment.
