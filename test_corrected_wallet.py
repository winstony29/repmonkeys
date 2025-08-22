from eth_account import Account

def test_corrected_wallet():
    # The corrected private key
    private_key = "efdbe3c4bb5c0c6e0c1bb2819384342dc999555117371bfc739f2a0cdc347e45"
    
    print("Testing Corrected Private Key")
    print("=" * 45)
    print(f"Private Key (first 10 chars): {private_key[:10]}...")
    
    try:
        # Create account from private key
        account = Account.from_key(private_key)
        derived_address = account.address
        
        print(f"Derived Address: {derived_address}")
        print(f"Expected Buyer:  0xbf931A12Dc11128aCC75C88947F94bcC5DC34380")
        print(f"Expected Seller: 0x94954916e3E39D3B32247476E1F45b4082162835")
        
        print("\nVerification Results:")
        print("-" * 30)
        
        # Check if derived address matches buyer address
        if derived_address.lower() == "0xbf931A12Dc11128aCC75C88947F94bcC5DC34380".lower():
            print("✅ Private key matches BUYER_AGENT_WALLET_ADDRESS")
            print("✅ This is the Compiler wallet with USDC!")
        else:
            print("❌ Private key does NOT match BUYER_AGENT_WALLET_ADDRESS")
        
        # Check if derived address matches seller address
        if derived_address.lower() == "0x94954916e3E39D3B32247476E1F45b4082162835".lower():
            print("✅ Private key matches SELLER_AGENT_WALLET_ADDRESS")
            print("✅ This is the WellnessBuddy wallet!")
        else:
            print("❌ Private key does NOT match SELLER_AGENT_WALLET_ADDRESS")
        
        print(f"\nRecommendation:")
        if derived_address.lower() == "0xbf931A12Dc11128aCC75C88947F94bcC5DC34380".lower():
            print("🎉 Perfect! This private key matches your Compiler wallet that has USDC.")
            print("   You can now run buyer operations with this configuration.")
        elif derived_address.lower() == "0x94954916e3E39D3B32247476E1F45b4082162835".lower():
            print("🎉 Perfect! This private key matches your WellnessBuddy wallet.")
            print("   You can run seller operations with this configuration.")
        else:
            print("❌ This private key doesn't match either wallet address.")
            print(f"   The private key corresponds to: {derived_address}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_corrected_wallet()
