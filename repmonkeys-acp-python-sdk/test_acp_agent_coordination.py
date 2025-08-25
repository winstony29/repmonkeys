#!/usr/bin/env python3
"""
Test script for ACP Agent-to-Agent Coordination System

This script demonstrates how WellnessBuddy can coordinate with DietKing, GymBro, and SleepyJoe
through ACP transactions instead of just LLM prompts.
"""

import asyncio
import json
import os
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

async def test_acp_agent_coordination():
    """Test the ACP agent-to-agent coordination system"""
    
    print("🚀 Testing ACP Agent-to-Agent Coordination System")
    print("=" * 60)
    
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
    
    # Test 1: Check if all agents are discoverable
    print("\n🔍 Test 1: Agent Discovery")
    print("-" * 30)
    
    agents_to_find = ["WellnessBuddy", "DietKing", "GymBro", "SleepyJoe"]
    found_agents = {}
    
    for agent_name in agents_to_find:
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
                found_agents[agent_name] = {
                    "id": agent.id,
                    "wallet": agent.wallet_address,
                    "online": agent.metrics.get('isOnline', False),
                    "offerings": len(agent.offerings)
                }
                print(f"✅ Found {agent_name}: {agent.id} (Online: {agent.metrics.get('isOnline', False)})")
            else:
                print(f"❌ {agent_name} not found")
                
        except Exception as e:
            print(f"❌ Error finding {agent_name}: {e}")
    
    # Test 2: Simulate agent-to-agent coordination
    print("\n🤝 Test 2: Agent-to-Agent Coordination Simulation")
    print("-" * 50)
    
    # Sample wellness request that would trigger multi-agent coordination
    wellness_request = {
        "health_goal": "comprehensive wellness improvement",
        "specific_needs": ["weight loss", "muscle building", "sleep optimization"],
        "current_issues": ["poor sleep quality", "stress", "inconsistent diet"],
        "preferences": ["home workouts", "budget-friendly", "vegetarian options"]
    }
    
    print("📋 Wellness Request:")
    print(json.dumps(wellness_request, indent=2))
    
    # Simulate the coordination process
    print("\n🔄 Coordination Process:")
    
    # Step 1: WellnessBuddy receives request
    print("1. WellnessBuddy receives wellness request")
    
    # Step 2: WellnessBuddy analyzes requirements
    print("2. WellnessBuddy analyzes requirements and identifies needed specialists")
    
    consultations_needed = []
    if any(word in json.dumps(wellness_request).lower() for word in ['diet', 'nutrition', 'meal', 'food', 'weight']):
        consultations_needed.append("DietKing")
        print("   → Needs DietKing for nutrition planning")
    
    if any(word in json.dumps(wellness_request).lower() for word in ['fitness', 'workout', 'exercise', 'muscle', 'strength']):
        consultations_needed.append("GymBro")
        print("   → Needs GymBro for fitness planning")
    
    if any(word in json.dumps(wellness_request).lower() for word in ['sleep', 'rest', 'insomnia', 'bedtime']):
        consultations_needed.append("SleepyJoe")
        print("   → Needs SleepyJoe for sleep optimization")
    
    # Step 3: Create ACP jobs to specialists
    print(f"\n3. Creating ACP jobs to specialists: {consultations_needed}")
    
    agent_jobs = {}
    for specialist in consultations_needed:
        if specialist in found_agents:
            print(f"   ✅ Would create ACP job to {specialist}")
            agent_jobs[specialist] = {
                "job_id": f"job_{specialist.lower()}_{hash(specialist)}",
                "status": "created",
                "specialist_wallet": found_agents[specialist]["wallet"]
            }
        else:
            print(f"   ❌ Cannot create job to {specialist} (not found)")
    
    # Step 4: Simulate specialist responses
    print("\n4. Specialists process requests and provide deliverables")
    
    specialist_responses = {}
    for specialist, job_info in agent_jobs.items():
        print(f"   📤 {specialist} receives job {job_info['job_id']}")
        
        # Simulate specialist processing
        if specialist == "DietKing":
            response = {
                "nutrition_plan": "Personalized nutrition plan",
                "meal_suggestions": ["High-protein breakfast", "Balanced lunch", "Light dinner"],
                "supplementation": ["Multivitamin", "Omega-3", "Protein powder"],
                "calorie_target": 1800,
                "macro_breakdown": {"protein": "30%", "carbs": "40%", "fats": "30%"}
            }
        elif specialist == "GymBro":
            response = {
                "workout_plan": "Comprehensive fitness program",
                "exercise_routine": ["Strength training", "Cardio", "Flexibility"],
                "frequency": "4 times per week",
                "progression": "Progressive overload schedule",
                "equipment_needed": ["Resistance bands", "Dumbbells"]
            }
        elif specialist == "SleepyJoe":
            response = {
                "sleep_plan": "Sleep optimization strategy",
                "bedtime_routine": ["Relaxation techniques", "Environment optimization"],
                "circadian_rhythm": "Sleep schedule optimization",
                "sleep_duration": "7-8 hours",
                "environment_tips": ["Dark room", "Cool temperature", "White noise"]
            }
        
        specialist_responses[specialist] = response
        print(f"   📥 {specialist} delivers comprehensive plan")
    
    # Step 5: WellnessBuddy synthesizes responses
    print("\n5. WellnessBuddy synthesizes specialist responses")
    
    final_wellness_plan = {
        "wellness_plan": {
            "overview": "Comprehensive wellness plan coordinated through ACP network",
            "primary_coordinator": "WellnessBuddy",
            "consulting_agents": list(specialist_responses.keys()),
            "user_requirements": wellness_request
        },
        "agent_contributions": specialist_responses,
        "integrated_recommendations": {
            "nutrition": specialist_responses.get("DietKing", {}).get("nutrition_plan", "Basic nutrition guidance"),
            "fitness": specialist_responses.get("GymBro", {}).get("workout_plan", "Basic fitness guidance"),
            "sleep": specialist_responses.get("SleepyJoe", {}).get("sleep_plan", "Basic sleep guidance")
        },
        "implementation_priority": [
            "Establish sleep routine (SleepyJoe)",
            "Begin nutrition plan (DietKing)",
            "Start fitness program (GymBro)"
        ],
        "coordination_notes": "This plan was created through decentralized ACP agent-to-agent transactions, ensuring each specialist contributed their expertise through economic incentives."
    }
    
    print("   ✅ Final wellness plan synthesized")
    
    # Test 3: Display final results
    print("\n📊 Test 3: Final Results")
    print("-" * 20)
    
    print(f"Agents Found: {len(found_agents)}/{len(agents_to_find)}")
    for agent_name, info in found_agents.items():
        status = "🟢 Online" if info["online"] else "🔴 Offline"
        print(f"  {agent_name}: {status} ({info['offerings']} offerings)")
    
    print(f"\nCoordination Results:")
    print(f"  Specialists Consulted: {len(consultations_needed)}")
    print(f"  ACP Jobs Created: {len(agent_jobs)}")
    print(f"  Responses Received: {len(specialist_responses)}")
    
    print(f"\nFinal Plan Components:")
    for component, description in final_wellness_plan["integrated_recommendations"].items():
        print(f"  {component.title()}: {description}")
    
    # Test 4: Economic Analysis
    print("\n💰 Test 4: Economic Analysis")
    print("-" * 25)
    
    # Simulate economic transactions
    base_job_cost = 10  # USDC per specialist consultation
    total_cost = len(agent_jobs) * base_job_cost
    
    print(f"Economic Flow:")
    print(f"  User → WellnessBuddy: ${total_cost + 5} USDC (coordination fee)")
    print(f"  WellnessBuddy → Specialists: ${total_cost} USDC")
    for specialist in agent_jobs.keys():
        print(f"    → {specialist}: ${base_job_cost} USDC")
    print(f"  WellnessBuddy Profit: $5 USDC (coordination fee)")
    
    print(f"\nBenefits of ACP Coordination:")
    print("  ✅ Decentralized: No central authority needed")
    print("  ✅ Incentivized: Each agent earns for their expertise")
    print("  ✅ Transparent: All transactions on-chain")
    print("  ✅ Scalable: Any agent can hire any other agent")
    print("  ✅ Quality: Economic incentives ensure quality work")
    
    return final_wellness_plan

def main():
    """Main function to run the test"""
    try:
        # Run the async test
        result = asyncio.run(test_acp_agent_coordination())
        
        print("\n🎉 ACP Agent-to-Agent Coordination Test Completed!")
        print("=" * 60)
        
        # Save results to file
        with open("acp_coordination_test_results.json", "w") as f:
            json.dump(result, f, indent=2)
        print("📄 Results saved to acp_coordination_test_results.json")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
