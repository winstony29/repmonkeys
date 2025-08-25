#!/usr/bin/env python3
"""
Check what agents are available on the ACP network
"""

import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def check_available_agents():
    """Check what agents are available on the ACP network"""
    
    print("🔍 Checking Available Agents on ACP Network")
    print("=" * 50)
    
    # Initialize environment
    env = EnvSettings()
    
    # Initialize ACP client
    from virtuals_acp.configs import BASE_SEPOLIA_CONFIG, BASE_MAINNET_CONFIG
    
    chain_env = os.getenv('CHAIN_ENV', 'base-sepolia')
    if chain_env == 'base-sepolia':
        config = BASE_SEPOLIA_CONFIG
        print("🔗 Using Base Sepolia testnet")
    else:
        config = BASE_MAINNET_CONFIG
        print("🔗 Using Base Mainnet")
    
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        entity_id=env.BUYER_ENTITY_ID,
        config=config
    )
    
    # Check for our specific agents
    our_agents = ["WellnessBuddy", "DietKing", "GymBro", "SleepyJoe"]
    
    print(f"\n🔍 Searching for our agents:")
    for agent_name in our_agents:
        try:
            agents = acp.browse_agents(
                keyword=agent_name,
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            if agents:
                agent = agents[0]
                print(f"✅ {agent_name}: ID {agent.id}, Online: {agent.metrics.get('isOnline', False)}, Offerings: {len(agent.offerings)}")
                print(f"   Wallet: {agent.wallet_address}")
                print(f"   Description: {agent.description[:100]}...")
            else:
                print(f"❌ {agent_name}: Not found")
                
        except Exception as e:
            print(f"❌ Error finding {agent_name}: {e}")
    
    # Check for any agents with similar names
    print(f"\n🔍 Searching for agents with similar names:")
    similar_keywords = ["gym", "fitness", "sleep", "nutrition", "wellness", "health"]
    
    for keyword in similar_keywords:
        try:
            agents = acp.browse_agents(
                keyword=keyword,
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=3,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            if agents:
                print(f"\n📋 Agents with '{keyword}' keyword:")
                for agent in agents:
                    print(f"   - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                    print(f"     Wallet: {agent.wallet_address}")
                    print(f"     Offerings: {len(agent.offerings)}")
                
        except Exception as e:
            print(f"❌ Error searching for '{keyword}': {e}")
    
    # Check for all available agents (limited search)
    print(f"\n🔍 General agent search (first 10):")
    try:
        agents = acp.browse_agents(
            keyword="a",  # Search for anything
            sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
            top_k=10,
            graduation_status=ACPGraduationStatus.ALL,
            online_status=ACPOnlineStatus.ALL
        )
        
        if agents:
            print(f"Found {len(agents)} agents:")
            for agent in agents:
                print(f"   - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                print(f"     Wallet: {agent.wallet_address}")
                print(f"     Offerings: {len(agent.offerings)}")
        else:
            print("No agents found")
            
    except Exception as e:
        print(f"❌ Error in general search: {e}")

if __name__ == "__main__":
    check_available_agents()
