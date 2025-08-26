# 🚀 WellSpace Contract Deployment Guide

## Overview
This guide will help you deploy your wellness contracts to Base mainnet and configure your frontend application.

## Prerequisites
- [Foundry](https://getfoundry.sh/) installed
- Base mainnet ETH in your wallet (at least 0.1 ETH for deployment)
- Private key for deployment

## Step 1: Deploy Contracts to Base Mainnet

### 1.1 Navigate to contracts directory
```bash
cd packages/contracts
```

### 1.2 Create environment file
```bash
cp env.example .env
```

### 1.3 Configure your .env file
```bash
# Add your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Add your deployer address
DEPLOYER_ADDRESS=your_wallet_address_here
```

### 1.4 Deploy contracts
```bash
# Make the script executable
chmod +x deploy-mainnet.sh

# Run deployment
./deploy-mainnet.sh
```

### 1.5 Save contract addresses
After successful deployment, you'll see output like:
```
Contract Addresses:
WellToken: 0x...
WellnessTracker: 0x...
WellnessNFT: 0x...
UserProfile: 0x...
Rewards: 0x...
```

**Save these addresses!** You'll need them for the next step.

## Step 2: Update Frontend Environment

### 2.1 Navigate to playground directory
```bash
cd ../playground
```

### 2.2 Create/update your .env file
```bash
# Copy the example
cp env.example .env.local

# Update with your deployed contract addresses
NEXT_PUBLIC_WELLNESS_NFT_ADDRESS=0x... # From deployment
NEXT_PUBLIC_WELL_TOKEN_ADDRESS=0x...    # From deployment
NEXT_PUBLIC_REWARDS_CONTRACT_ADDRESS=0x... # From deployment
NEXT_PUBLIC_USER_PROFILE_ADDRESS=0x...  # From deployment
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=0x... # From deployment

# Optional: Use a reliable RPC provider (recommended)
NEXT_PUBLIC_ALCHEMY_BASE_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
# OR
NEXT_PUBLIC_INFURA_BASE_URL=https://base-mainnet.infura.io/v3/YOUR_PROJECT_ID

# Network configuration
NEXT_PUBLIC_CHAIN_ID=8453
```

## Step 3: Test Your Application

### 3.1 Start the development server
```bash
npm run dev
# or
pnpm dev
```

### 3.2 Check contract connectivity
Open your browser console and look for the contract connectivity test results. You should see:
- ✅ Base Mainnet RPC connection successful
- ✅ Contract [NAME] exists at [ADDRESS] for each contract

### 3.3 Common Issues & Solutions

#### Rate Limiting (429 errors)
If you see "Too Many Requests" errors:
1. Use Alchemy or Infura RPC instead of the public Base RPC
2. Set `NEXT_PUBLIC_ALCHEMY_BASE_URL` in your .env file
3. Get free API keys from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)

#### Contracts Not Found
If contracts show "No contract code found":
1. Verify contracts were deployed successfully
2. Check that addresses in .env match deployment output
3. Ensure you're on Base mainnet (Chain ID: 8453)

#### Wrong Network
If MetaMask shows wrong network:
1. Add Base mainnet to MetaMask:
   - Network Name: Base
   - RPC URL: https://mainnet.base.org
   - Chain ID: 8453
   - Currency Symbol: ETH
   - Block Explorer: https://basescan.org

## Step 4: Production Deployment

### 4.1 Build for production
```bash
npm run build
# or
pnpm build
```

### 4.2 Deploy to Vercel/Netlify
- Connect your repository
- Set environment variables in your deployment platform
- Deploy!

## Troubleshooting

### Check Contract Deployment
Visit [BaseScan](https://basescan.org) and search for your contract addresses to verify they're deployed.

### Verify Contract Code
Use the contract connectivity test in your browser console to check if contracts are accessible.

### RPC Issues
- Public RPC endpoints have rate limits
- Use Alchemy, Infura, or QuickNode for production
- Free tiers are usually sufficient for development

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure contracts are deployed to the correct network
4. Check that you have sufficient ETH for gas fees

## Next Steps
After successful deployment:
1. Test all contract functions
2. Verify NFT minting works
3. Test reward distribution
4. Deploy to production
5. Share your dApp with the community! 🎉

---

**Remember**: Never commit your private keys or .env files to version control!
