from eth_account import Account
from dotenv import load_dotenv
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def test_actual_config():
    env = EnvSettings()
    
    print("Testing Actual Configuration from .env")
    print("=" * 50)
    
    private_key = env.WHITELISTED_WALLET_PRIVATE_KEY
    buyer_address = env.BUYER_AGENT_WALLET_ADDRESS
    seller_address = env.SELLER_AGENT_WALLET_ADDRESS
    
    print(f"Private Key (first 10 chars): {private_key[:10]}...")
    print(f"Buyer Address: {buyer_address}")
    print(f"Seller Address: {seller_address}")
    print(f"Buyer Entity ID: {env.BUYER_ENTITY_ID}")
    print(f"Seller Entity ID: {env.SELLER_ENTITY_ID}")
    
    try:
        # Create account from private key
        account = Account.from_key(private_key)
        derived_address = account.address
        
        print(f"\nDerived Address: {derived_address}")
        
        print("\nVerification Results:")
        print("-" * 30)
        
        # Check if derived address matches buyer address
        if derived_address.lower() == buyer_address.lower():
            print("✅ Private key matches BUYER_AGENT_WALLET_ADDRESS")
        else:
            print("❌ Private key does NOT match BUYER_AGENT_WALLET_ADDRESS")
        
        # Check if derived address matches seller address
        if derived_address.lower() == seller_address.lower():
            print("✅ Private key matches SELLER_AGENT_WALLET_ADDRESS")
        else:
            print("❌ Private key does NOT match SELLER_AGENT_WALLET_ADDRESS")
        
        print(f"\nCurrent Setup:")
        print(f"  - Using wallet: {derived_address}")
        print(f"  - Buyer agent: {buyer_address}")
        print(f"  - Seller agent: {seller_address}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_actual_config()
