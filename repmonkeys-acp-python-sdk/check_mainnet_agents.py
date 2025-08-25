#!/usr/bin/env python3
"""
Check if agents are registered on mainnet
"""

import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def check_mainnet_agents():
    """Check if agents are registered on mainnet"""
    
    print("🔍 Checking Agents on Mainnet")
    print("=" * 50)
    
    # Initialize environment
    env = EnvSettings()
    
    # Initialize ACP client with mainnet config
    from virtuals_acp.configs import BASE_MAINNET_CONFIG
    
    print("🔗 Using Base Mainnet")
    
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        entity_id=env.BUYER_ENTITY_ID,
        config=BASE_MAINNET_CONFIG
    )
    
    # Get wallet addresses from .env
    wallet_addresses = [
        ("WellnessBuddy", env.SELLER_AGENT_WALLET_ADDRESS),
        ("DietKing", env.DIETKING_WALLET_ADDRESS),
        ("GymBro", env.GYMBRO_WALLET_ADDRESS),
        ("SleepyJoe", env.SLEEPYJOE_WALLET_ADDRESS)
    ]
    
    print("\n🔍 Searching for agents by name on mainnet:")
    
    # Search by agent names
    agent_names = ["WellnessBuddy", "DietKing", "GymBro", "SleepyJoe"]
    
    for agent_name in agent_names:
        print(f"\n🔍 Looking for {agent_name} by name:")
        
        try:
            agents = acp.browse_agents(
                keyword=agent_name,
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            if agents:
                print(f"✅ Found {len(agents)} agents with name '{agent_name}':")
                for agent in agents:
                    print(f"   - {agent.name} (ID: {agent.id}) - Online: {agent.metrics.get('isOnline', False)}")
                    print(f"     Wallet: {agent.wallet_address}")
                    print(f"     Offerings: {len(agent.offerings)}")
            else:
                print(f"❌ No agents found with name '{agent_name}'")
                
        except Exception as e:
            print(f"❌ Error searching for '{agent_name}': {e}")
    
    print("\n🔍 Searching for agents by wallet address on mainnet:")
    
    for agent_name, wallet_address in wallet_addresses:
        if not wallet_address:
            print(f"❌ {agent_name}: No wallet address configured")
            continue
            
        print(f"\n🔍 Looking for {agent_name} with wallet: {wallet_address}")
        
        try:
            # Try to find agent by searching with a broad keyword
            agents = acp.browse_agents(
                keyword="test",  # Use a common keyword
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=50,  # Get many agents
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            # Look for agent with matching wallet
            found_agent = None
            for agent in agents:
                if agent.wallet_address.lower() == wallet_address.lower():
                    found_agent = agent
                    break
            
            if found_agent:
                print(f"✅ Found {agent_name}!")
                print(f"   Real Name: {found_agent.name}")
                print(f"   ID: {found_agent.id}")
                print(f"   Online: {found_agent.metrics.get('isOnline', False)}")
                print(f"   Wallet: {found_agent.wallet_address}")
                print(f"   Description: {found_agent.description[:100]}...")
                print(f"   Offerings: {len(found_agent.offerings)}")
            else:
                print(f"❌ {agent_name} not found with wallet {wallet_address}")
                print(f"   This wallet address is not registered on mainnet")
                
        except Exception as e:
            print(f"❌ Error searching for {agent_name}: {e}")
    
    print("\n🔍 Summary:")
    print("If agents are found on mainnet, you may need to switch CHAIN_ENV to 'base'")
    print("If agents are not found on mainnet either, they may not be registered yet.")

if __name__ == "__main__":
    check_mainnet_agents()
