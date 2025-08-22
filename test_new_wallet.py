from eth_account import Account

def test_new_wallet():
    # The new private key from your .env file
    private_key = "18f2b7cc2584f6a51789bb3c0410e2fce5fea2f73b9ae31762db92c31010c1ce"
    
    print("Testing New Private Key")
    print("=" * 40)
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
            print("✅ This wallet has USDC and can be used for buying services")
        else:
            print("❌ Private key does NOT match BUYER_AGENT_WALLET_ADDRESS")
        
        # Check if derived address matches seller address
        if derived_address.lower() == "0x94954916e3E39D3B32247476E1F45b4082162835".lower():
            print("✅ Private key matches SELLER_AGENT_WALLET_ADDRESS")
        else:
            print("❌ Private key does NOT match SELLER_AGENT_WALLET_ADDRESS")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_new_wallet()
