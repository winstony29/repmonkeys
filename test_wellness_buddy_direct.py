import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus

load_dotenv(override=True)

def test_wellness_buddy_direct():
    from virtuals_acp.env import EnvSettings
    env = EnvSettings()
    
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        entity_id=env.BUYER_ENTITY_ID
    )
    
    print("🔍 Testing direct search for WellnessBuddy...")
    print(f"WellnessBuddy wallet: {env.SELLER_AGENT_WALLET_ADDRESS}")
    
    # Try searching for WellnessBuddy directly
    try:
        agents = acp.browse_agents(
            keyword="WellnessBuddy",
            sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
            top_k=10,
            graduation_status=ACPGraduationStatus.ALL,
            online_status=ACPOnlineStatus.ALL
        )
        
        print(f"Found {len(agents)} agents with 'WellnessBuddy' keyword:")
        for agent in agents:
            print(f"  - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
            print(f"    Wallet: {agent.wallet_address}")
            print(f"    Description: {agent.description}")
            print(f"    Offerings: {len(agent.offerings)}")
            for offering in agent.offerings:
                print(f"      * {offering.name} - ${offering.price_usd}")
        
        # Also try searching for agents with the exact wallet address
        print(f"\n🔍 Searching for agents with wallet: {env.SELLER_AGENT_WALLET_ADDRESS}")
        for agent in agents:
            if agent.wallet_address.lower() == env.SELLER_AGENT_WALLET_ADDRESS.lower():
                print(f"🎯 FOUND WELLNESSBUDDY!")
                print(f"  - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                return True
        
        print("❌ WellnessBuddy not found in direct search")
        
    except Exception as e:
        print(f"Error in direct search: {e}")
    
    # Try searching with different online status filters
    print(f"\n🔍 Testing with different online status filters...")
    
    for online_status in [ACPOnlineStatus.ONLINE, ACPOnlineStatus.OFFLINE, ACPOnlineStatus.ALL]:
        try:
            agents = acp.browse_agents(
                keyword="WellnessBuddy",
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=10,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=online_status
            )
            
            print(f"Online status {online_status}: Found {len(agents)} agents")
            for agent in agents:
                if agent.wallet_address.lower() == env.SELLER_AGENT_WALLET_ADDRESS.lower():
                    print(f"🎯 FOUND WELLNESSBUDDY with status {online_status}!")
                    print(f"  - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                    return True
                    
        except Exception as e:
            print(f"Error with status {online_status}: {e}")
    
    print("\n❌ WellnessBuddy not found in any search")
    print("\nPossible causes:")
    print("1. WellnessBuddy is registered but not currently online")
    print("2. The enhanced seller script is not properly registering online status")
    print("3. There's a network mismatch (testnet vs mainnet)")
    print("4. The agent registration needs to be refreshed")
    
    return False

if __name__ == "__main__":
    test_wellness_buddy_direct()
