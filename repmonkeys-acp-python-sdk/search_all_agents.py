#!/usr/bin/env python3
"""
Search for all agents on the ACP network to find GymBro and SleepyJoe
"""

import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def search_all_agents():
    """Search for all agents and look for GymBro and SleepyJoe"""
    
    print("🔍 Comprehensive Agent Search")
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
    
    # Search for all agents (no keyword filter)
    print("\n🔍 Searching for ALL agents (no keyword filter):")
    try:
        all_agents = acp.browse_agents(
            keyword="",  # Empty keyword to get all agents
            sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
            top_k=50,  # Get more agents
            graduation_status=ACPGraduationStatus.ALL,
            online_status=ACPOnlineStatus.ALL
        )
        
        print(f"Found {len(all_agents)} total agents:")
        
        # Look for our specific agents
        found_agents = []
        for agent in all_agents:
            agent_name_lower = agent.name.lower()
            if any(keyword in agent_name_lower for keyword in ['gym', 'bro', 'sleepy', 'joe', 'diet', 'king', 'wellness', 'buddy']):
                found_agents.append(agent)
                print(f"🎯 POTENTIAL MATCH: {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                print(f"   Wallet: {agent.wallet_address}")
                print(f"   Description: {agent.description[:100]}...")
                print(f"   Offerings: {len(agent.offerings)}")
                print()
        
        if not found_agents:
            print("❌ No agents found with gym/bro/sleepy/joe/diet/king/wellness/buddy keywords")
            
    except Exception as e:
        print(f"❌ Error searching all agents: {e}")
    
    # Try specific searches for variations
    print("\n🔍 Trying specific search variations:")
    search_variations = [
        "gym", "bro", "gymbro", "gym bro", "fitness", "workout",
        "sleepy", "joe", "sleepyjoe", "sleepy joe", "sleep", "rest",
        "diet", "king", "dietking", "diet king", "nutrition", "food",
        "wellness", "buddy", "wellnessbuddy", "wellness buddy", "health"
    ]
    
    for variation in search_variations:
        try:
            agents = acp.browse_agents(
                keyword=variation,
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            if agents:
                print(f"📋 Found {len(agents)} agents with '{variation}' keyword:")
                for agent in agents:
                    print(f"   - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                    print(f"     Wallet: {agent.wallet_address}")
                    
        except Exception as e:
            print(f"❌ Error searching for '{variation}': {e}")
    
    # Check wallet addresses from .env
    print("\n🔍 Checking configured wallet addresses:")
    print(f"GymBro wallet in .env: {env.GYMBRO_WALLET_ADDRESS}")
    print(f"SleepyJoe wallet in .env: {env.SLEEPYJOE_WALLET_ADDRESS}")
    print(f"DietKing wallet in .env: {env.DIETKING_WALLET_ADDRESS}")
    print(f"WellnessBuddy wallet in .env: {env.SELLER_AGENT_WALLET_ADDRESS}")

if __name__ == "__main__":
    search_all_agents()
