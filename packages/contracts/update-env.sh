#!/bin/bash

# 🔄 Environment Update Script for WellSpace Contracts
# This script helps update environment files after contract deployment

set -e

echo "🔄 WellSpace Environment Update Script"
echo "======================================"
echo ""

# Check if deployment log exists
if [ ! -f "broadcast/DeployMainnet.s.sol/8453/run-latest.json" ]; then
    echo "❌ Error: Deployment log not found!"
    echo "Please run the deployment first: ./deploy-mainnet.sh"
    exit 1
fi

echo "📋 Reading deployment log..."
DEPLOY_LOG="broadcast/DeployMainnet.s.sol/8453/run-latest.json"

# Extract contract addresses from deployment log
WELL_TOKEN_ADDRESS=$(jq -r '.transactions[] | select(.contractName=="WellToken") | .contractAddress' "$DEPLOY_LOG")
WELLNESS_TRACKER_ADDRESS=$(jq -r '.transactions[] | select(.contractName=="WellnessTracker") | .contractAddress' "$DEPLOY_LOG")
WELLNESS_NFT_ADDRESS=$(jq -r '.transactions[] | select(.contractName=="WellnessNFT") | .contractAddress' "$DEPLOY_LOG")
USER_PROFILE_ADDRESS=$(jq -r '.transactions[] | select(.contractName=="UserProfile") | .contractAddress' "$DEPLOY_LOG")
REWARDS_ADDRESS=$(jq -r '.transactions[] | select(.contractName=="Rewards") | .contractAddress' "$DEPLOY_LOG")

echo "✅ Contract addresses extracted:"
echo "   WellToken: $WELL_TOKEN_ADDRESS"
echo "   WellnessTracker: $WELLNESS_TRACKER_ADDRESS"
echo "   WellnessNFT: $WELLNESS_NFT_ADDRESS"
echo "   UserProfile: $USER_PROFILE_ADDRESS"
echo "   Rewards: $REWARDS_ADDRESS"
echo ""

# Update contracts .env file
echo "📝 Updating contracts/.env..."
cat > .env << EOF
# Private key for contract deployment (without 0x prefix)
DEPLOYER_ADDRESS=0x938b9642dB80F48BD3E4eB8CEF0Da573495B8D2B
PRIVATE_KEY=0xdedddb47bb6274946044e2cfe311a403ef09ea292af59845275dc0a807000416

# RPC URLs
BASE_MAINNET_RPC=https://mainnet.base.org

# Smart Contract Addresses (Base Mainnet) - DEPLOYED
NEXT_PUBLIC_WELL_TOKEN_ADDRESS=$WELL_TOKEN_ADDRESS
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=$WELLNESS_TRACKER_ADDRESS
NEXT_PUBLIC_WELLNESS_NFT_ADDRESS=$WELLNESS_NFT_ADDRESS
NEXT_PUBLIC_USER_PROFILE_ADDRESS=$USER_PROFILE_ADDRESS
NEXT_PUBLIC_REWARDS_ADDRESS=$REWARDS_ADDRESS

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=8453

# Contract Features:
# - Enhanced WellnessTracker with detailed workout, meditation, meal, and sleep tracking
# - WellToken with Bitcoin-style halving mechanism
# - WellnessNFT for user profiles
# - UserProfile for onboarding data
# - Rewards system for distributing WELL tokens

# Base Mainnet Explorer: https://basescan.org
# Deployment completed successfully!
EOF

echo "✅ contracts/.env updated"

# Update playground .env file
echo "📝 Updating playground/.env..."
cat > ../playground/.env << EOF
# Environment Variables for WellSpace Playground
NEXT_PUBLIC_BASE_MAINNET_RPC=https://mainnet.base.org
NEXT_PUBLIC_WELL_TOKEN_ADDRESS=$WELL_TOKEN_ADDRESS
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=$WELLNESS_TRACKER_ADDRESS
NEXT_PUBLIC_WELLNESS_NFT_ADDRESS=$WELLNESS_NFT_ADDRESS
NEXT_PUBLIC_USER_PROFILE_ADDRESS=$USER_PROFILE_ADDRESS
NEXT_PUBLIC_REWARDS_ADDRESS=$REWARDS_ADDRESS
# Network Configuration
NEXT_PUBLIC_CHAIN_ID=8453
EOF

echo "✅ playground/.env updated"

echo ""
echo "🎉 Environment files updated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Restart your frontend application"
echo "2. Test the application on Base mainnet"
echo "3. Verify contracts on BaseScan: https://basescan.org"
echo ""
echo "🔗 Contract addresses:"
echo "   WellToken: $WELL_TOKEN_ADDRESS"
echo "   WellnessTracker: $WELLNESS_TRACKER_ADDRESS"
echo "   WellnessNFT: $WELLNESS_NFT_ADDRESS"
echo "   UserProfile: $USER_PROFILE_ADDRESS"
echo "   Rewards: $REWARDS_ADDRESS"
