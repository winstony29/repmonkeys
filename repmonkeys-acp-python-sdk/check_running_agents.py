#!/usr/bin/env python3
"""
Check what agents are actually running by searching for their wallet addresses
"""

import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def check_running_agents():
    """Check what agents are actually running by wallet address"""
    
    print("🔍 Checking Running Agents by Wallet Address")
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
    
    # Get wallet addresses from .env
    wallet_addresses = [
        ("WellnessBuddy", env.SELLER_AGENT_WALLET_ADDRESS),
        ("DietKing", env.DIETKING_WALLET_ADDRESS),
        ("GymBro", env.GYMBRO_WALLET_ADDRESS),
        ("SleepyJoe", env.SLEEPYJOE_WALLET_ADDRESS)
    ]
    
    print("\n🔍 Searching for agents by wallet address:")
    
    for agent_name, wallet_address in wallet_addresses:
        if not wallet_address:
            print(f"❌ {agent_name}: No wallet address configured")
            continue
            
        print(f"\n🔍 Looking for {agent_name} with wallet: {wallet_address}")
        
        try:
            # Try to find agent by searching with a broad keyword
            agents = acp.browse_agents(
                keyword="a",  # Broad search
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=100,  # Get many agents
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
                print(f"   This wallet address is not registered on the ACP network")
                
        except Exception as e:
            print(f"❌ Error searching for {agent_name}: {e}")
    
    print("\n🔍 Summary:")
    print("If agents are not found by wallet address, they may not be properly registered")
    print("or the wallet addresses in .env don't match the registered agents.")

if __name__ == "__main__":
    check_running_agents()
