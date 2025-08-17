# Wellness App - Decentralized Health & Wellness on Base

A comprehensive decentralized wellness application built on the Base blockchain, featuring a two-token economy, AI-powered wellness agents, and NFT-based user profiles.

## 🏗️ Architecture Overview

### Tech Stack
- **Blockchain**: Base (EVM Compatible)
- **Smart Contracts**: Solidity + Foundry
- **Backend**: NestJS (Node.js) + TypeScript
- **Frontend**: Next.js + OnchainKit (Coinbase Wallet Miniapp)
- **Blockchain Integration**: viem + wagmi
- **Wallet Integration**: OnchainKit + Coinbase Wallet

### Core Components
- **Two-Token Economy**: USDC (operational) + $WELL (rewards)
- **AI Agent Model**: Hub-and-spoke architecture with specialized wellness agents
- **User Identity**: ERC-721 NFTs with Sogni AI generated artwork
- **Monorepo Structure**: pnpm workspaces for efficient development
- **Miniapp Architecture**: Built for Coinbase Wallet integration

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Foundry (for smart contracts)
- Coinbase Wallet (for testing the miniapp)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd wellness-app
pnpm install:all
```

2. **Set up environment variables**
```bash
# Copy environment templates
cp packages/contracts/env.example packages/contracts/.env
cp packages/backend/env.example packages/backend/.env
cp packages/miniapp/env.example packages/miniapp/.env

# Edit with your values
# - Private key for contract deployment
# - RPC URLs for Base networks
# - Contract addresses after deployment
```

3. **Deploy smart contracts**
```bash
# Build contracts
pnpm build:contracts

# Deploy to Base Goerli testnet
pnpm deploy:contracts
```

4. **Start backend server**
```bash
pnpm dev:backend
```

5. **Start miniapp**
```bash
pnpm dev:miniapp
```

## 📱 User Flow

1. **Wallet Connection**: Users connect their Coinbase Wallet using OnchainKit
2. **Onboarding**: Users select wellness goals and create their profile
3. **Profile Creation**: AI generates personalized wellness profile, Sogni AI creates artwork
4. **NFT Minting**: Profile is minted as NFT on Base blockchain
5. **Token Rewards**: Users receive initial $WELL tokens
6. **Wellness Journey**: AI agents provide personalized recommendations

## 🔧 Development

### Project Structure
```
/wellness-app
  /packages
    /contracts          # Smart contracts (Foundry)
    /backend           # NestJS API server
    /miniapp           # Next.js miniapp with OnchainKit
  - package.json       # Root workspace config
  - pnpm-workspace.yaml
```

### Smart Contracts
- **WellToken.sol**: ERC-20 token with fixed supply (1B tokens)
- **WellnessNFT.sol**: ERC-721 profile NFTs
- **Rewards.sol**: Token distribution and rewards management

### Backend Services
- **BlockchainService**: Smart contract interactions via viem
- **AiService**: Hub-and-spoke wellness agent orchestration
- **UserService**: User profile management
- **AuthService**: Wallet-based authentication

### Miniapp Features
- **OnchainKit Integration**: Seamless Coinbase Wallet connection
- **Onboarding Flow**: Multi-step profile creation
- **Dashboard**: Token balance, AI chat, wellness tracking
- **AI Wellness Assistant**: Natural language wellness queries
- **Responsive Design**: Optimized for mobile and desktop

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/nonce` - Generate authentication nonce
- `POST /api/auth/verify` - Verify wallet signature
- `GET /api/auth/status/:walletAddress` - Check auth status

### User Management
- `POST /api/user` - Create user profile
- `GET /api/user/:walletAddress` - Get user profile
- `PUT /api/user/:walletAddress/goals` - Update wellness goals

### Blockchain Operations
- `POST /api/blockchain/mint-nft` - Mint wellness profile NFT
- `POST /api/blockchain/award-tokens` - Award $WELL tokens
- `GET /api/blockchain/balance/:userAddress` - Get token balance

### AI Wellness
- `POST /api/ai/wellness-request` - Get AI wellness recommendations

## 🔐 Security Features

- **Wallet Authentication**: Nonce-based signature verification
- **Access Control**: Owner-only functions for critical operations
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Secure error responses without sensitive data

## 🧪 Testing

### Smart Contracts
```bash
cd packages/contracts
forge test
```

### Backend
```bash
cd packages/backend
pnpm test
```

### Miniapp
```bash
cd packages/miniapp
pnpm dev
# Open in browser and test with Coinbase Wallet
```

## 🚢 Deployment

### Smart Contracts
```bash
# Base Goerli testnet
pnpm deploy:contracts

# Base mainnet (when ready)
pnpm deploy:contracts:mainnet
```

### Backend
```bash
cd packages/backend
pnpm build
pnpm start:prod
```

### Miniapp
```bash
cd packages/miniapp
pnpm build
# Deploy to your preferred hosting platform
# (Vercel, Netlify, etc.)
```

## 🔮 Future Enhancements

- **IPFS Integration**: Decentralized metadata storage
- **Advanced AI Models**: Integration with specialized wellness AI services
- **Social Features**: Community challenges and leaderboards
- **DeFi Integration**: Staking, yield farming with $WELL tokens
- **Cross-chain**: Multi-chain support beyond Base
- **Enhanced Miniapp**: More Coinbase Wallet integrations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions and support:
- Create an issue in the repository
- Join our community Discord
- Check the documentation

---

**Built with ❤️ for the Base ecosystem and wellness community**
