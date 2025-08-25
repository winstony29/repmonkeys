#!/bin/bash

# ⚡ Quick Deploy Script for WellSpace Contracts
# Run this to deploy all contracts to Base mainnet

echo "⚡ Quick Deploy - WellSpace to Base Mainnet"
echo "============================================"
echo ""

# Build contracts
echo "🔨 Building contracts..."
forge build --force

echo ""
echo "🚀 Deploying to Base Mainnet..."
echo ""

# Deploy without verification
forge script script/DeployMainnet.s.sol \
    --rpc-url https://mainnet.base.org \
    --broadcast \
    --chain-id 8453

echo ""
echo "✅ Deployment complete! Run ./update-env.sh to update environment files."
