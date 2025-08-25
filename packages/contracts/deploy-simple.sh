#!/bin/bash

# 🚀 Simple WellSpace Contract Deployment Script for Base Mainnet
# This script deploys all wellness contracts to Base mainnet without verification

set -e  # Exit on any error

echo "🚀 WellSpace Contract Deployment to Base Mainnet (Simple)"
echo "========================================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your private key and configuration."
    exit 1
fi

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Error: Foundry is not installed!"
    echo "Please install Foundry first: https://getfoundry.sh/"
    exit 1
fi

# Load environment variables
source .env

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file!"
    echo "Please add your private key (without 0x prefix) to .env"
    exit 1
fi

# Check if deployer address is set
if [ -z "$DEPLOYER_ADDRESS" ]; then
    echo "❌ Error: DEPLOYER_ADDRESS not set in .env file!"
    echo "Please add your deployer address to .env"
    exit 1
fi

echo "✅ Environment loaded successfully"
echo "📍 Deployer Address: $DEPLOYER_ADDRESS"
echo "🌐 Network: Base Mainnet (Chain ID: 8453)"
echo "🔗 RPC: https://mainnet.base.org"
echo "🔍 Explorer: https://basescan.org"
echo ""

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url https://mainnet.base.org)
echo "💎 Current Balance: $BALANCE ETH"

# Check if balance is sufficient (at least 0.1 ETH)
BALANCE_WEI=$(cast --to-wei $BALANCE)
if [ "$BALANCE_WEI" -lt 100000000000000000 ]; then
    echo "⚠️  Warning: Low balance detected!"
    echo "   Recommended: At least 0.1 ETH for deployment"
    echo "   Current: $BALANCE ETH"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

echo ""
echo "🔨 Building contracts..."
forge build --force

echo ""
echo "🚀 Deploying contracts to Base Mainnet..."
echo "This may take a few minutes..."

# Deploy using the mainnet script without verification
forge script script/DeployMainnet.s.sol \
    --rpc-url https://mainnet.base.org \
    --broadcast \
    --chain-id 8453

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the deployed contract addresses from above"
echo "2. Run ./update-env.sh to automatically update environment files"
echo "3. Restart your frontend application"
echo "4. Test the application on mainnet"
echo ""
echo "🔗 View your contracts on BaseScan: https://basescan.org"
echo "💰 Deployer: $DEPLOYER_ADDRESS"
echo ""
echo "💡 Note: Contracts are deployed but not verified on BaseScan."
echo "   You can verify them manually later if needed."
