# ⚡ Quick Start Deployment

## 🚀 Deploy in 3 Simple Steps

### Step 1: Create Environment File
```bash
cd packages/contracts
cp env.example .env
```

Edit `.env` and add your private key:
```bash
PRIVATE_KEY=your_private_key_here
```

### Step 2: Get Testnet ETH
- Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- Connect your wallet
- Request 0.01 ETH

### Step 3: Test Private Key
```bash
# Test if private key is working
forge script script/TestPrivateKey.s.sol --rpc-url https://sepolia.base.org
```

### Step 4: Deploy Contract
```bash
./deploy.sh
```

## 🎯 What You'll Get

After successful deployment:
- ✅ Contract deployed to Base Sepolia
- ✅ Contract address displayed
- ✅ Ready to update frontend

## 📝 Update Frontend

Copy the contract address and update:
```bash
# In packages/playground/.env
NEXT_PUBLIC_WELLNESS_TRACKER_ADDRESS=0x... # Your deployed address
```

## 🔍 Verify Success

- Check deployment logs for contract address
- Visit https://sepolia.basescan.org to verify
- Restart frontend and test wellness data initialization

---

**Need help?** Check the full DEPLOYMENT_GUIDE.md for detailed instructions.
