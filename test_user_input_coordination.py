#!/usr/bin/env python3
"""
Test the full coordination flow with user input
"""

import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings
from virtuals_acp.configs import BASE_MAINNET_CONFIG

load_dotenv(override=True)

def test_user_input_coordination(user_input: str = "i am tired, what should i eat for dinner tonight?"):
    """Test the full coordination flow with user input"""
    
    print("🚀 Testing User Input Coordination Flow")
    print("=" * 60)
    
    # Initialize environment
    env = EnvSettings()
    
    # Initialize ACP client with mainnet config
    print("🔗 Connecting to Base Mainnet...")
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        entity_id=env.BUYER_ENTITY_ID,
        config=BASE_MAINNET_CONFIG
    )
    
    print(f"\n📝 User Input: '{user_input}'")
    print("\n🔍 Step 1: Agent Discovery")
    print("-" * 30)
    
    # Find all our agents
    agents_to_find = ["WellnessBuddy", "DietKing", "GymBro", "SleepyJoe"]
    found_agents = {}
    
    for agent_name in agents_to_find:
        try:
            agents = acp.browse_agents(
                keyword=agent_name,
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=1,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            if agents:
                agent = agents[0]
                found_agents[agent_name] = agent
                status = "🟢 Online" if agent.metrics.get('isOnline', False) else "🔴 Offline"
                print(f"✅ {agent_name}: {status} (ID: {agent.id})")
                print(f"   Wallet: {agent.wallet_address}")
                print(f"   Offerings: {len(agent.offerings)}")
            else:
                print(f"❌ {agent_name}: Not found")
                
        except Exception as e:
            print(f"❌ Error finding {agent_name}: {e}")
    
    print(f"\n🤝 Step 2: Coordination Analysis")
    print("-" * 30)
    
    # Analyze the user input to determine which specialists are needed
    user_input_lower = user_input.lower()
    
    specialists_needed = []
    if any(word in user_input_lower for word in ['eat', 'dinner', 'food', 'meal', 'nutrition']):
        specialists_needed.append("DietKing")
    
    if any(word in user_input_lower for word in ['tired', 'energy', 'workout', 'exercise']):
        specialists_needed.append("GymBro")
    
    if any(word in user_input_lower for word in ['tired', 'sleep', 'rest', 'bed']):
        specialists_needed.append("SleepyJoe")
    
    # Always include WellnessBuddy as the coordinator
    print(f"🎯 Primary Coordinator: WellnessBuddy")
    print(f"🔧 Specialists Needed: {', '.join(specialists_needed) if specialists_needed else 'None'}")
    
    print(f"\n🔄 Step 3: Simulated Coordination Process")
    print("-" * 30)
    
    # Simulate the coordination process
    print("1. WellnessBuddy receives user request")
    print(f"   Request: '{user_input}'")
    
    print("\n2. WellnessBuddy analyzes requirements:")
    for specialist in specialists_needed:
        if specialist in found_agents:
            status = "🟢 Available" if found_agents[specialist].metrics.get('isOnline', False) else "🔴 Offline"
            print(f"   → {specialist}: {status}")
        else:
            print(f"   → {specialist}: ❌ Not found")
    
    print("\n3. Simulated ACP Job Creation:")
    for specialist in specialists_needed:
        if specialist in found_agents and found_agents[specialist].offerings:
            offering = found_agents[specialist].offerings[0]
            print(f"   ✅ Would create job to {specialist}")
            print(f"      Offering: {offering.name}")
            print(f"      Price: {offering.price} USDC")
        else:
            print(f"   ❌ Cannot create job to {specialist} (no offerings)")
    
    print("\n4. Simulated Specialist Responses:")
    specialist_responses = {
        "DietKing": {
            "recommendation": "For a tired person, I recommend a light, nutritious dinner:",
            "suggestions": [
                "Grilled salmon with steamed vegetables",
                "Quinoa bowl with avocado and chickpeas",
                "Greek yogurt with berries and honey"
            ],
            "reasoning": "These options provide protein, healthy fats, and complex carbs without being too heavy."
        },
        "GymBro": {
            "recommendation": "Since you're tired, focus on gentle movement:",
            "suggestions": [
                "Light stretching before dinner",
                "10-minute walk after eating",
                "Gentle yoga poses for relaxation"
            ],
            "reasoning": "Light activity can help with digestion and energy levels without overexertion."
        },
        "SleepyJoe": {
            "recommendation": "To improve your sleep quality tonight:",
            "suggestions": [
                "Avoid caffeine after 2 PM",
                "Create a relaxing bedtime routine",
                "Keep your bedroom cool and dark"
            ],
            "reasoning": "Proper sleep hygiene will help you feel more rested tomorrow."
        }
    }
    
    for specialist in specialists_needed:
        if specialist in specialist_responses:
            response = specialist_responses[specialist]
            print(f"   📤 {specialist} provides consultation:")
            print(f"      {response['recommendation']}")
            for suggestion in response['suggestions']:
                print(f"      • {suggestion}")
            print(f"      💡 {response['reasoning']}")
    
    print("\n5. WellnessBuddy synthesizes final response:")
    print("   🎯 Final Recommendation:")
    print("   Based on your request for dinner when tired, here's your personalized plan:")
    print()
    print("   🍽️  Dinner Options:")
    print("   • Grilled salmon with steamed vegetables")
    print("   • Quinoa bowl with avocado and chickpeas")
    print("   • Greek yogurt with berries and honey")
    print()
    print("   🏃‍♂️  Light Activity:")
    print("   • Take a 10-minute walk after dinner")
    print("   • Do some gentle stretching")
    print()
    print("   😴 Sleep Preparation:")
    print("   • Avoid heavy foods close to bedtime")
    print("   • Create a relaxing evening routine")
    print()
    print("   💡 Why this works: Light, nutritious foods provide energy without being heavy, while gentle activity aids digestion and prepares your body for rest.")
    
    print(f"\n💰 Step 4: Economic Analysis")
    print("-" * 30)
    
    total_cost = 0
    if "WellnessBuddy" in found_agents and found_agents["WellnessBuddy"].offerings:
        coordinator_cost = found_agents["WellnessBuddy"].offerings[0].price
        total_cost += coordinator_cost
        print(f"   WellnessBuddy Coordination: {coordinator_cost} USDC")
    
    for specialist in specialists_needed:
        if specialist in found_agents and found_agents[specialist].offerings:
            specialist_cost = found_agents[specialist].offerings[0].price
            total_cost += specialist_cost
            print(f"   {specialist} Consultation: {specialist_cost} USDC")
    
    print(f"   Total Cost: {total_cost} USDC")
    
    print(f"\n✅ Coordination Test Completed Successfully!")
    print("=" * 60)

if __name__ == "__main__":
    test_user_input_coordination()
