#!/bin/bash

# 🚀 WellnessTracker Contract Deployment Script
# This script deploys the WellnessTracker contract to Base Sepolia testnet

echo "🚀 Starting WellnessTracker contract deployment to Base Sepolia..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your PRIVATE_KEY"
    echo "Example:"
    echo "PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Load environment variables
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

echo "✅ Environment loaded successfully"
echo "📍 Deploying to: Base Sepolia (Chain ID: 84532)"
echo "🔗 RPC URL: https://sepolia.base.org"

# Deploy the contract
echo "🚀 Deploying WellnessTracker contract..."
forge script script/DeployWellnessTracker.s.sol \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --chain-id 84532 \
    --private-key $PRIVATE_KEY

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Copy the deployed contract address from above"
echo "2. Update packages/playground/.env with:"
echo "   NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=<CONTRACT_ADDRESS>"
echo "3. Restart your frontend application"
echo ""
echo "🔍 Verify deployment at: https://sepolia.basescan.org"
