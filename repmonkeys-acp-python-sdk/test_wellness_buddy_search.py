import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus

load_dotenv(override=True)

def search_for_wellness_buddy():
    from virtuals_acp.env import EnvSettings
    env = EnvSettings()
    
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        entity_id=env.BUYER_ENTITY_ID
    )
    
    print("🔍 Searching for WellnessBuddy by wallet address...")
    print(f"WellnessBuddy wallet: {env.SELLER_AGENT_WALLET_ADDRESS}")
    
    # Try different search keywords
    search_keywords = ["wellness", "buddy", "health", "fitness", "diet", "sleep"]
    
    for keyword in search_keywords:
        print(f"\n🔍 Searching with keyword: '{keyword}'")
        try:
            agents = acp.browse_agents(
                keyword=keyword,
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=20,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            print(f"Found {len(agents)} agents with keyword '{keyword}':")
            wellness_buddy_found = False
            
            for agent in agents:
                if agent.wallet_address.lower() == env.SELLER_AGENT_WALLET_ADDRESS.lower():
                    print(f"🎯 FOUND WELLNESSBUDDY!")
                    print(f"  - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                    print(f"    Wallet: {agent.wallet_address}")
                    print(f"    Description: {agent.description}")
                    print(f"    Offerings: {len(agent.offerings)}")
                    for offering in agent.offerings:
                        print(f"      * {offering.name} - ${offering.price_usd}")
                    wellness_buddy_found = True
                else:
                    print(f"  - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                    print(f"    Wallet: {agent.wallet_address}")
                    print(f"    Description: {agent.description}")
                    print(f"    Offerings: {len(agent.offerings)}")
                    for offering in agent.offerings:
                        print(f"      * {offering.name} - ${offering.price_usd}")
            
            if wellness_buddy_found:
                return  # Found it, no need to continue searching
                
        except Exception as e:
            print(f"Error searching with keyword '{keyword}': {e}")
    
    # Try searching for any agent with the specific wallet address
    print(f"\n🔍 Searching for any agent with wallet: {env.SELLER_AGENT_WALLET_ADDRESS}")
    try:
        # Try a broader search
        all_agents = acp.browse_agents(
            keyword="a",  # Use a common letter to get more results
            sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
            top_k=100,
            graduation_status=ACPGraduationStatus.ALL,
            online_status=ACPOnlineStatus.ALL
        )
        
        print(f"Found {len(all_agents)} total agents in broader search:")
        wellness_buddy_found = False
        
        for agent in all_agents:
            if agent.wallet_address.lower() == env.SELLER_AGENT_WALLET_ADDRESS.lower():
                print(f"🎯 FOUND WELLNESSBUDDY!")
                print(f"  - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                print(f"    Wallet: {agent.wallet_address}")
                print(f"    Description: {agent.description}")
                print(f"    Offerings: {len(agent.offerings)}")
                for offering in agent.offerings:
                    print(f"      * {offering.name} - ${offering.price_usd}")
                wellness_buddy_found = True
                break
        
        if not wellness_buddy_found:
            print("❌ WellnessBuddy not found even in broader search!")
            
    except Exception as e:
        print(f"Error in broader search: {e}")
    
    print("\n❌ WellnessBuddy not found in any search results!")
    print("This could mean:")
    print("1. WellnessBuddy is not properly registered")
    print("2. WellnessBuddy is not online")
    print("3. There's a wallet address mismatch")
    print("4. The agent needs to be re-registered")
    print("5. The agent name doesn't match the search keywords")
    print("\n💡 Suggestion: Try restarting the WellnessBuddy agent (enhanced_seller_with_coordination.py)")

if __name__ == "__main__":
    search_for_wellness_buddy()
