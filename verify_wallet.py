from eth_account import Account
from dotenv import load_dotenv
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def verify_wallet():
    env = EnvSettings()
    
    print("Wallet Verification")
    print("=" * 50)
    
    # Get the private key from env
    private_key = env.WHITELISTED_WALLET_PRIVATE_KEY
    if not private_key:
        print("❌ WHITELISTED_WALLET_PRIVATE_KEY is not set")
        return
    
    # Remove 0x prefix if present
    if private_key.startswith("0x"):
        private_key = private_key[2:]
    
    print(f"Private Key (first 10 chars): {private_key[:10]}...")
    
    try:
        # Create account from private key
        account = Account.from_key(private_key)
        derived_address = account.address
        
        print(f"Derived Address: {derived_address}")
        print(f"Buyer Address:   {env.BUYER_AGENT_WALLET_ADDRESS}")
        print(f"Seller Address:  {env.SELLER_AGENT_WALLET_ADDRESS}")
        
        print("\nVerification Results:")
        print("-" * 30)
        
        # Check if derived address matches buyer address
        if derived_address.lower() == env.BUYER_AGENT_WALLET_ADDRESS.lower():
            print("✅ Private key matches BUYER_AGENT_WALLET_ADDRESS")
        else:
            print("❌ Private key does NOT match BUYER_AGENT_WALLET_ADDRESS")
        
        # Check if derived address matches seller address
        if derived_address.lower() == env.SELLER_AGENT_WALLET_ADDRESS.lower():
            print("✅ Private key matches SELLER_AGENT_WALLET_ADDRESS")
        else:
            print("❌ Private key does NOT match SELLER_AGENT_WALLET_ADDRESS")
        
        print(f"\nRecommendation:")
        if derived_address.lower() == env.BUYER_AGENT_WALLET_ADDRESS.lower():
            print("✅ Use BUYER_AGENT_WALLET_ADDRESS for buyer operations")
        elif derived_address.lower() == env.SELLER_AGENT_WALLET_ADDRESS.lower():
            print("✅ Use SELLER_AGENT_WALLET_ADDRESS for seller operations")
        else:
            print("❌ Private key doesn't match any configured wallet address")
            print(f"   You need to either:")
            print(f"   1. Update the private key to match one of your wallet addresses, OR")
            print(f"   2. Update the wallet addresses to match the private key")
        
    except Exception as e:
        print(f"❌ Error verifying wallet: {e}")

if __name__ == "__main__":
    verify_wallet()
