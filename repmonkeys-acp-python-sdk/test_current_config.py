from eth_account import Account

def test_current_config():
    # Current configuration from .env
    private_key = "5e7becb28fa7a8bb534a9b04d73e24f6d3122231f86f90b127c3a5849ea14bda"
    buyer_address = "0xF569001627326b65D80f77dF63206DC0CEdE37C4"
    seller_address = "0x94954916e3E39D3B32247476E1F45b4082162835"
    
    print("Testing Current Configuration")
    print("=" * 50)
    print(f"Private Key (first 10 chars): {private_key[:10]}...")
    
    try:
        # Create account from private key
        account = Account.from_key(private_key)
        derived_address = account.address
        
        print(f"Derived Address: {derived_address}")
        print(f"Buyer Address:   {buyer_address}")
        print(f"Seller Address:  {seller_address}")
        
        print("\nVerification Results:")
        print("-" * 30)
        
        # Check if derived address matches buyer address
        if derived_address.lower() == buyer_address.lower():
            print("✅ Private key matches BUYER_AGENT_WALLET_ADDRESS")
            print("✅ Configuration is correct for buyer operations!")
        else:
            print("❌ Private key does NOT match BUYER_AGENT_WALLET_ADDRESS")
        
        # Check if derived address matches seller address
        if derived_address.lower() == seller_address.lower():
            print("✅ Private key matches SELLER_AGENT_WALLET_ADDRESS")
            print("✅ Configuration is correct for seller operations!")
        else:
            print("❌ Private key does NOT match SELLER_AGENT_WALLET_ADDRESS")
        
        if derived_address.lower() == buyer_address.lower():
            print("\n🎉 Perfect! Your configuration is now correct!")
            print("   You can proceed with testing the buyer functionality.")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_current_config()


