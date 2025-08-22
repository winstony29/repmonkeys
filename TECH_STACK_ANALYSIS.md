# WellSpace Tech Stack Analysis

## Project Overview
WellSpace is a comprehensive wellness application that combines blockchain technology, AI-powered wellness recommendations, and social features through Farcaster integration. The application is built as a monorepo with multiple packages serving different purposes.

## Architecture Overview
- **Frontend**: Next.js 14 with React 18
- **Backend**: NestJS with TypeScript
- **Blockchain**: Solidity smart contracts on Base network
- **AI**: Custom wellness recommendation system
- **Social**: Farcaster Frame integration
- **Database**: Prisma ORM with PostgreSQL
- **Package Manager**: pnpm with workspace management

---

## 🚀 Frontend Technologies

### Core Framework
- **Next.js 14.2.26** - React framework with App Router, SSR, and API routes
- **React 18** - UI library with hooks and modern patterns
- **TypeScript 5.x** - Type-safe JavaScript development

### UI Components & Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI primitives
  - `@radix-ui/react-dropdown-menu` - Dropdown menu components
  - `@radix-ui/react-icons` - Icon library
  - `@radix-ui/react-label` - Label components
  - `@radix-ui/react-radio-group` - Radio button groups
  - `@radix-ui/react-select` - Select dropdowns
  - `@radix-ui/react-slot` - Slot pattern for component composition
  - `@radix-ui/react-switch` - Toggle switch components
  - `@radix-ui/react-tabs` - Tab navigation components
- **Lucide React 0.416.0** - Beautiful, customizable icons
- **class-variance-authority** - Type-safe CSS class variants
- **clsx** - Conditional className utility
- **tailwind-merge** - Tailwind CSS class merging utility
- **tailwindcss-animate** - Animation utilities for Tailwind

### State Management & Data Fetching
- **@tanstack/react-query 5.51.11** - Server state management and caching

---

## 🔗 Blockchain & Web3 Technologies

### Core Web3 Libraries
- **viem 2.27.2** - TypeScript interface for Ethereum
- **wagmi 2.16.0** - React hooks for Ethereum
- **@coinbase/onchainkit 0.38.19** - Coinbase's Web3 development toolkit

### Smart Contract Development
- **Foundry** - Ethereum development toolkit
  - Solidity 0.8.20 compiler
  - Forge testing framework
  - Script deployment system
- **OpenZeppelin Contracts** - Battle-tested smart contract library
  - ERC721 NFT standard implementation
  - Access control and ownership patterns
  - Security best practices

### Blockchain Networks
- **Base Network** - Coinbase's L2 solution
  - Base Sepolia (testnet)
  - Base Goerli (testnet)
  - Base Mainnet (production)

### NFT & Token Standards
- **ERC-721** - Non-fungible token standard for wellness profiles
- **ERC-20** - Fungible token standard for rewards
- **ERC-1155** - Multi-token standard support

---

## 🧠 Backend Technologies

### Core Framework
- **NestJS 10.x** - Progressive Node.js framework
  - Modular architecture with dependency injection
  - Decorator-based routing and middleware
  - Built-in validation and transformation

### Database & ORM
- **PostgreSQL** - Relational database for user data and wellness tracking

### Validation & Transformation
- **Built-in NestJS validation** - Request validation and transformation

### API Documentation
- **REST API endpoints** - Custom wellness API implementation

### Testing
- **Jest 29.5.0** - JavaScript testing framework

---

## 🤖 AI & Machine Learning

### Custom AI Service
- **Intent Recognition System** - Natural language processing for wellness requests
- **Specialist Agent Architecture** - Modular AI agents for different wellness domains
  - Workout Specialist Agent
  - Recipe Specialist Agent
  - Meditation Specialist Agent
  - Sleep Specialist Agent
- **Structured Response Generation** - Type-safe wellness recommendations

### AI Capabilities
- **Workout Plan Generation** - Personalized exercise routines
- **Recipe Recommendations** - Healthy meal suggestions with nutrition data
- **Meditation Guidance** - Mindfulness and breathing exercises
- **Sleep Optimization** - Sleep hygiene and routine recommendations

---

## 🌐 Social & Integration Technologies

### Farcaster Integration
- **@farcaster/miniapp-sdk 0.1.9** - Farcaster social protocol integration
- **WellnessFrame Component** - Interactive social media frame
- **Social Wellness Tracking** - Shareable wellness achievements

### External APIs
- **Reservoir SDK 2.4.25** - NFT marketplace integration (type definitions)
- **OnchainKit API** - Coinbase's Web3 infrastructure
- **Custom Wellness API** - Backend service integration
- **EAS GraphQL** - Ethereum Attestation Service integration (Base network)

---

## 🗄️ Database & Storage

### Primary Database
- **PostgreSQL** - Relational database for user data and wellness tracking
- **Custom database layer** - Direct database access implementation

### Blockchain Storage
- **IPFS** - Decentralized storage for NFT metadata
- **On-chain Storage** - Smart contract state management

---

## 🔧 Development Tools & Infrastructure

### Package Management
- **pnpm 10.6.3** - Fast, disk space efficient package manager
- **Workspace Management** - Monorepo structure with shared dependencies

### Build Tools
- **Next.js Build System** - Optimized production builds
- **TypeScript Compiler** - Type checking and compilation
- **PostCSS** - CSS processing and optimization

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

### Development Experience
- **Hot Reloading** - Fast development iteration
- **TypeScript Path Mapping** - Clean import paths
- **Environment Configuration** - Flexible environment management

---

## 🚀 Deployment & Hosting

### Frontend Hosting
- **Vercel** - Next.js deployment platform
- **Asset Optimization** - CDN and performance optimization

### Smart Contract Deployment
- **Foundry Scripts** - Automated deployment pipelines
- **Multi-network Support** - Testnet and mainnet deployment
- **Contract Verification** - Block explorer verification

### Backend Hosting
- **NestJS Production Builds** - Optimized Node.js deployment
- **Environment Configuration** - Flexible deployment settings

---

## 📱 User Experience Features

### Wellness Tracking
- **Activity Logging** - Exercise and meal tracking
- **Goal Setting** - Weekly wellness objectives
- **Streak Management** - Consistency tracking
- **Score System** - Gamified wellness metrics

### Social Features
- **Farcaster Frames** - Shareable wellness content
- **Achievement Sharing** - Social wellness milestones
- **Community Integration** - Social wellness support

### Blockchain Features
- **NFT Profiles** - Unique wellness identity tokens
- **Token Rewards** - Incentivized wellness participation
- **On-chain Achievements** - Immutable wellness records

---

## 🔒 Security & Privacy

### Authentication
- **Wallet-based Auth** - Web3 wallet authentication
- **Signature Verification** - Cryptographic proof of ownership
- **Nonce Protection** - Replay attack prevention

### Smart Contract Security
- **OpenZeppelin Audits** - Battle-tested security patterns
- **Access Control** - Role-based permissions
- **Input Validation** - Secure parameter handling

### Data Protection
- **User Privacy** - Minimal data collection
- **Secure Storage** - Encrypted sensitive data
- **API Security** - Rate limiting and validation

---

## 📊 Performance & Scalability

### Frontend Optimization
- **Next.js Optimization** - Automatic code splitting
- **Image Optimization** - WebP and responsive images
- **Bundle Analysis** - Optimized JavaScript bundles

### Backend Performance
- **NestJS Caching** - Response caching strategies
- **Database Optimization** - Efficient query patterns
- **Async Processing** - Non-blocking operations

### Blockchain Efficiency
- **Gas Optimization** - Efficient smart contract execution
- **Batch Operations** - Reduced transaction costs
- **L2 Scaling** - Base network performance benefits

---

## 🔮 Future Technology Roadmap

### Potential Future Integrations
- **Advanced AI Models** - Enhanced wellness recommendations
- **Cross-chain Support** - Multi-blockchain compatibility
- **Mobile Applications** - React Native or Flutter apps

### Scalability Improvements
- **Microservices Architecture** - Service decomposition
- **Event-driven Architecture** - Asynchronous processing
- **Distributed Caching** - Redis or similar caching layer
- **Load Balancing** - Horizontal scaling support

---

## 📚 Learning Resources

### Key Technologies to Master
1. **Next.js 14** - App Router and Server Components
2. **NestJS** - Enterprise Node.js patterns
3. **Solidity & Foundry** - Smart contract development
4. **Web3 Integration** - Wallet and blockchain interaction
5. **AI Integration** - Intent recognition and response generation

### Recommended Study Path
1. **Frontend Fundamentals** - React, TypeScript, Tailwind CSS
2. **Backend Development** - Node.js, NestJS, Prisma
3. **Blockchain Basics** - Ethereum, Solidity, Web3
4. **AI Integration** - Natural language processing, agent architecture
5. **DevOps & Deployment** - CI/CD, monitoring, scaling

---

*This document provides a comprehensive overview of the WellSpace application's technology stack. For specific implementation details, refer to the individual package documentation and source code.*
