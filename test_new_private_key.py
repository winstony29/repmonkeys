from eth_account import Account

def test_new_private_key():
    # The new private key from your .env file
    private_key = "e6fb549320989c5c635f8e68110f6c286aec1d88bd17b2b1111bfc015ce03745"
    buyer_address = "0xbf931A12Dc11128aCC75C88947F94bcC5DC34380"
    
    print("Testing New Private Key")
    print("=" * 40)
    print(f"Private Key (first 10 chars): {private_key[:10]}...")
    
    try:
        # Create account from private key
        account = Account.from_key(private_key)
        derived_address = account.address
        
        print(f"Derived Address: {derived_address}")
        print(f"Expected Buyer:  {buyer_address}")
        
        print("\nVerification Results:")
        print("-" * 30)
        
        # Check if derived address matches buyer address
        if derived_address.lower() == buyer_address.lower():
            print("✅ Private key matches BUYER_AGENT_WALLET_ADDRESS")
            print("✅ This is the Compiler wallet with USDC!")
            print("🎉 Perfect! Your configuration is now correct!")
            print("   You can proceed with testing the buyer functionality.")
        else:
            print("❌ Private key does NOT match BUYER_AGENT_WALLET_ADDRESS")
            print(f"   The private key corresponds to: {derived_address}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_new_private_key()
