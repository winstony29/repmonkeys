import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus

load_dotenv(override=True)

def list_available_agents():
    from virtuals_acp.env import EnvSettings
    env = EnvSettings()
    
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        entity_id=env.BUYER_ENTITY_ID
    )
    
    print("🔍 Listing all available agents...")
    
    # Try to get agents with different keywords
    keywords = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]
    all_agents = []
    
    for keyword in keywords:
        try:
            agents = acp.browse_agents(
                keyword=keyword,
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=10,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            all_agents.extend(agents)
            print(f"Keyword '{keyword}': Found {len(agents)} agents")
        except Exception as e:
            print(f"Keyword '{keyword}': Error - {e}")
    
    # Remove duplicates based on agent ID
    unique_agents = {}
    for agent in all_agents:
        if agent.id not in unique_agents:
            unique_agents[agent.id] = agent
    
    print(f"\n📊 Total unique agents found: {len(unique_agents)}")
    print("\nAvailable agents with offerings:")
    
    agents_with_offerings = []
    for agent_id, agent in unique_agents.items():
        if len(agent.offerings) > 0:
            agents_with_offerings.append(agent)
            print(f"  - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
            print(f"    Wallet: {agent.wallet_address}")
            print(f"    Description: {agent.description}")
            print(f"    Offerings: {len(agent.offerings)}")
            for offering in agent.offerings:
                print(f"      * {offering.name} - ${offering.price_usd}")
            print()
    
    print(f"\n🎯 Agents with offerings: {len(agents_with_offerings)}")
    
    if len(agents_with_offerings) > 0:
        print("\n💡 You can test with any of these agents by modifying the buyer script")
        print("   to search for their name instead of 'WellnessBuddy'")

if __name__ == "__main__":
    list_available_agents()
