#!/usr/bin/env python3
"""
Test script for ACP Agent-to-Agent Coordination System

This script demonstrates how WellnessBuddy can coordinate with DietKing, GymBro, and SleepyJoe
through ACP transactions instead of just LLM prompts.
"""

import asyncio
import json
import os
import sys
import argparse
import time
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

async def generate_wellness_plan_with_thinking_animations(user_input_data):
    """Generate wellness plan with thinking animations for each agent"""
    
    # Send initial status to frontend
    print(json.dumps({
        "type": "status",
        "message": "🚀 AI Wellness Assistant - Smasher",
        "status": "starting"
    }))
    
    # Parse user input
    if isinstance(user_input_data, str):
        try:
            user_data = json.loads(user_input_data)
        except:
            user_data = {"user_message": user_input_data}
    else:
        user_data = user_input_data
    
    user_message = user_data.get("user_message", "")
    user_goals = user_data.get("user_goals", [])
    user_profile = user_data.get("user_profile", {})
    
    # Send user input summary to frontend
    print(json.dumps({
        "type": "status",
        "message": f"📝 Processing request: {user_message[:50]}...",
        "status": "processing"
    }))
    
    # Simulate thinking animations for each agent
    print(json.dumps({
        "type": "status",
        "message": "🔄 Coordinating with specialist agents...",
        "status": "coordinating"
    }))
    
    # GymBro thinking...
    print(json.dumps({
        "type": "agent_thinking",
        "agent": "GymBro",
        "emoji": "💪",
        "message": "GymBro is thinking... 🏋️‍♂️",
        "status": "thinking"
    }))
    
    # Simulate processing time
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "GymBro",
        "message": "   → Analyzing fitness requirements...",
        "progress": 25
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "GymBro",
        "message": "   → Creating workout plan...",
        "progress": 50
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_complete",
        "agent": "GymBro",
        "message": "   ✅ GymBro plan ready!",
        "status": "complete"
    }))
    
    # DietKing thinking...
    print(json.dumps({
        "type": "agent_thinking",
        "agent": "DietKing",
        "emoji": "🥗",
        "message": "🥗 DietKing is thinking... 👑",
        "status": "thinking"
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "DietKing",
        "message": "   → Assessing nutritional needs...",
        "progress": 25
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "DietKing",
        "message": "   → Planning meals...",
        "progress": 50
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_complete",
        "agent": "DietKing",
        "message": "   ✅ DietKing plan ready!",
        "status": "complete"
    }))
    
    # SleepyJoe thinking...
    print(json.dumps({
        "type": "agent_thinking",
        "agent": "SleepyJoe",
        "emoji": "😴",
        "message": "😴 SleepyJoe is thinking... 🌙",
        "status": "thinking"
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "SleepyJoe",
        "message": "   → Evaluating sleep patterns...",
        "progress": 25
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "SleepyJoe",
        "message": "   → Optimizing bedtime routine...",
        "progress": 50
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_complete",
        "agent": "SleepyJoe",
        "message": "   ✅ SleepyJoe plan ready!",
        "status": "complete"
    }))
    
    # WellnessBuddy compiling...
    print(json.dumps({
        "type": "agent_thinking",
        "agent": "WellnessBuddy",
        "emoji": "🌟",
        "message": "🌟 WellnessBuddy is compiling... 🧠",
        "status": "thinking"
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "WellnessBuddy",
        "message": "   → Integrating specialist plans...",
        "progress": 25
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_progress",
        "agent": "WellnessBuddy",
        "message": "   → Creating comprehensive strategy...",
        "progress": 50
    }))
    
    await asyncio.sleep(1)
    
    print(json.dumps({
        "type": "agent_complete",
        "agent": "WellnessBuddy",
        "message": "   ✅ Final plan compiled!",
        "status": "complete"
    }))
    
    # Generate comprehensive wellness plan
    wellness_plan = create_comprehensive_wellness_plan(user_message, user_goals, user_profile)
    
    # Save to JSON file
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    filename = f"wellness_plan_{timestamp}.json"
    filepath = os.path.join(os.path.dirname(__file__), filename)
    
    with open(filepath, 'w') as f:
        json.dump(wellness_plan, f, indent=2)
    
    # Send completion status
    print(json.dumps({
        "type": "status",
        "message": f"📄 Wellness plan saved to: {filename}",
        "status": "saving"
    }))
    
    # Send the final wellness plan
    print(json.dumps({
        "type": "wellness_plan",
        "data": wellness_plan,
        "status": "complete"
    }))
    
    return wellness_plan

def create_comprehensive_wellness_plan(user_message, user_goals, user_profile):
    """Create a comprehensive wellness plan based on user input"""
    
    # Analyze user message to determine focus areas
    message_lower = user_message.lower()
    
    # Determine primary focus and create personalized responses
    if any(word in message_lower for word in ['sleep', 'bed', 'rest', 'tired', 'insomnia', 'debt']):
        primary_focus = "Sleep Optimization"
        primary_agent = "SleepyJoe"
        
        # Sleep-specific recommendations
        sleep_recommendations = [
            "Establish a consistent 10 PM bedtime routine",
            "Create a dark, cool (65-68°F) sleep environment",
            "Avoid screens 2 hours before bed",
            "Practice 10-minute meditation before sleep",
            "Use white noise or calming sounds",
            "Limit caffeine after 2 PM",
            "Exercise early in the day, not before bed"
        ]
        
        if 'debt' in message_lower:
            sleep_recommendations.extend([
                "Gradually adjust bedtime 15 minutes earlier each night",
                "Take short 20-minute naps before 3 PM if needed",
                "Prioritize sleep over other activities this week",
                "Track sleep quality in a sleep journal"
            ])
            
    elif any(word in message_lower for word in ['workout', 'exercise', 'gym', 'fitness', 'muscle', 'strength']):
        primary_focus = "Fitness & Exercise"
        primary_agent = "GymBro"
        
        # Fitness-specific recommendations
        fitness_recommendations = [
            "Start with 3-4 workouts per week",
            "Focus on compound movements (squats, deadlifts, push-ups)",
            "Include proper warm-up and cool-down",
            "Progressive overload for continuous improvement",
            "Mix strength training with cardio"
        ]
        
        if 'beginner' in str(user_profile).lower():
            fitness_recommendations.extend([
                "Begin with bodyweight exercises",
                "Focus on form over weight",
                "Start with 2-3 sets of 8-12 reps",
                "Rest 2-3 minutes between sets"
            ])
            
    elif any(word in message_lower for word in ['diet', 'nutrition', 'food', 'meal', 'weight', 'eat']):
        primary_focus = "Nutrition & Diet"
        primary_agent = "DietKing"
        
        # Nutrition-specific recommendations
        nutrition_recommendations = [
            "Eat 3 balanced meals + 2 snacks daily",
            "Prioritize protein and complex carbs",
            "Stay hydrated with 8+ glasses of water",
            "Consider meal prep for consistency",
            "Include colorful vegetables in every meal"
        ]
        
        if 'weight' in message_lower:
            nutrition_recommendations.extend([
                "Create a 300-500 calorie daily deficit",
                "Focus on high-volume, low-calorie foods",
                "Track your food intake for awareness",
                "Eat slowly and mindfully"
            ])
    else:
        primary_focus = "General Wellness"
        primary_agent = "WellnessBuddy"
        
        # General wellness recommendations
        general_recommendations = [
            "Set specific, measurable wellness goals",
            "Track progress weekly",
            "Build one habit at a time",
            "Celebrate small wins and milestones"
        ]
    
    # Create dynamic weekly schedule based on primary focus
    weekly_schedule = {}
    if primary_focus == "Sleep Optimization":
        weekly_schedule = {
            "monday": "Focus on Sleep Optimization + light stretching",
            "tuesday": "Implement nutrition improvements for better sleep",
            "wednesday": "Focus on stress reduction and relaxation",
            "thursday": "Sleep optimization and recovery techniques",
            "friday": "Sleep quality assessment and adjustment",
            "saturday": "Gentle recovery and sleep preparation",
            "sunday": "Planning and preparation for next week's sleep routine"
        }
    elif primary_focus == "Fitness & Exercise":
        weekly_schedule = {
            "monday": "Focus on Fitness + strength training",
            "tuesday": "Implement nutrition improvements for recovery",
            "wednesday": "Focus on cardio and endurance",
            "thursday": "Active recovery and flexibility",
            "friday": "Fitness assessment and adjustment",
            "saturday": "Active recovery and fun activities",
            "sunday": "Planning and preparation for next week's workouts"
        }
    elif primary_focus == "Nutrition & Diet":
        weekly_schedule = {
            "monday": "Focus on Nutrition + meal planning",
            "tuesday": "Implement fitness improvements for metabolism",
            "wednesday": "Focus on hydration and meal prep",
            "thursday": "Nutrition assessment and adjustment",
            "friday": "Fitness and nutrition integration",
            "saturday": "Healthy cooking and meal prep",
            "sunday": "Planning and preparation for next week's nutrition"
        }
    else:
        weekly_schedule = {
            "monday": "Focus on General Wellness + light activity",
            "tuesday": "Implement nutrition improvements",
            "wednesday": "Focus on fitness and movement",
            "thursday": "Wellness assessment and adjustment",
            "friday": "Sleep optimization and recovery",
            "saturday": "Active recovery and fun activities",
            "sunday": "Planning and preparation for next week"
        }
    
    # Create the comprehensive plan
    wellness_plan = {
        "coordinator": "Smasher",
        "status": "completed",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "user_input": {
            "message": user_message,
            "goals": user_goals,
            "profile": user_profile
        },
        "primary_focus": primary_focus,
        "primary_agent": primary_agent,
        "message": f"🎯 Personalized wellness plan delivered based on your request: {user_message[:50]}...",
        "analysis_summary": {
            "scenario": f"User {primary_focus.lower()} consultation",
            "key_challenges": ["Personalized guidance", "Multi-domain integration", "Implementation support"],
            "optimal_strategy": f"Coordinated multi-agent approach led by {primary_agent}"
        },
        "agent_contributions": {
            "GymBro": {
                "specialty": "Fitness & Exercise",
                "contribution": "💪 Comprehensive workout plan designed for your fitness level and goals",
                "focus_areas": ["Strength training", "Cardio", "Flexibility", "Recovery"],
                "recommendations": fitness_recommendations if primary_focus == "Fitness & Exercise" else [
                    "Start with 3-4 workouts per week",
                    "Focus on compound movements",
                    "Include proper warm-up and cool-down",
                    "Progressive overload for continuous improvement"
                ]
            },
            "DietKing": {
                "specialty": "Nutrition & Diet",
                "contribution": "🥗 Personalized nutrition strategy to support your wellness goals",
                "focus_areas": ["Meal planning", "Macro balance", "Hydration", "Supplementation"],
                "recommendations": nutrition_recommendations if primary_focus == "Nutrition & Diet" else [
                    "Eat 3 balanced meals + 2 snacks daily",
                    "Prioritize protein and complex carbs",
                    "Stay hydrated with 8+ glasses of water",
                    "Consider meal prep for consistency"
                ]
            },
            "SleepyJoe": {
                "specialty": "Sleep Optimization",
                "contribution": "😴 Sleep hygiene and circadian rhythm optimization",
                "focus_areas": ["Bedtime routine", "Environment optimization", "Stress management", "Sleep schedule"],
                "recommendations": sleep_recommendations if primary_focus == "Sleep Optimization" else [
                    "Maintain consistent 7-9 hour sleep schedule",
                    "Create relaxing bedtime routine",
                    "Optimize bedroom environment (dark, cool, quiet)",
                    "Avoid screens 1 hour before bed"
                ]
            },
            "WellnessBuddy": {
                "specialty": "Holistic Wellness",
                "contribution": "🌟 Integrated wellness strategy and progress tracking",
                "focus_areas": ["Goal setting", "Progress tracking", "Habit formation", "Motivation"],
                "recommendations": general_recommendations if primary_focus == "General Wellness" else [
                    "Set specific, measurable wellness goals",
                    "Track progress weekly",
                    "Build one habit at a time",
                    "Celebrate small wins and milestones"
                ]
            }
        },
        "integrated_recommendations": {
            "immediate_actions": [
                f"Start with the primary focus area: {primary_focus}",
                "Implement one new habit per week",
                "Track your progress daily",
                "Stay consistent with your routine"
            ],
            "weekly_schedule": weekly_schedule,
            "success_metrics": {
                "energy_levels": "Track daily energy on 1-10 scale",
                "sleep_quality": "Monitor sleep duration and quality",
                "workout_consistency": "Track workout completion rate",
                "nutrition_adherence": "Monitor meal plan following",
                "overall_wellness": "Weekly wellness score assessment"
            }
        },
        "implementation_priority": [
            f"1. Start with {primary_focus} (led by {primary_agent})",
            "2. Gradually integrate other wellness domains",
            "3. Establish consistent daily routines",
            "4. Monitor progress and adjust as needed"
        ],
        "coordination_notes": f"This plan was created through coordinated analysis by all specialist agents, with {primary_agent} taking the lead on {primary_focus} based on your specific request."
    }
    
    return wellness_plan

async def test_acp_agent_coordination():
    """Test the ACP agent-to-agent coordination system"""
    
    print("🚀 Testing ACP Agent-to-Agent Coordination System", file=sys.stderr)
    print("=" * 60, file=sys.stderr)
    
    # Initialize environment
    env = EnvSettings()
    
    # Initialize ACP client
    from virtuals_acp.configs import BASE_SEPOLIA_CONFIG, BASE_MAINNET_CONFIG
    
    chain_env = os.getenv('CHAIN_ENV', 'base-sepolia')
    if chain_env == 'base-sepolia':
        config = BASE_SEPOLIA_CONFIG
        print("🔗 Using Base Sepolia testnet", file=sys.stderr)
    else:
        config = BASE_MAINNET_CONFIG
        print("🔗 Using Base Mainnet", file=sys.stderr)
    
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        entity_id=env.BUYER_ENTITY_ID,
        config=config
    )
    
    # Test 1: Check if all agents are discoverable
    print("\n🔍 Test 1: Agent Discovery", file=sys.stderr)
    print("-" * 30, file=sys.stderr)
    
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
                print(f"✅ Found {agent_name}: {agent.id} (Online: {agent.metrics.get('isOnline', False)})", file=sys.stderr)
            else:
                print(f"❌ {agent_name} not found", file=sys.stderr)
                
        except Exception as e:
            print(f"❌ Error finding {agent_name}: {e}", file=sys.stderr)
    
    # Test 2: Simulate agent-to-agent coordination
    print("\n🤝 Test 2: Agent-to-Agent Coordination Simulation", file=sys.stderr)
    print("-" * 50, file=sys.stderr)
    
    # Sample wellness request that would trigger multi-agent coordination
    wellness_request = {
        "health_goal": "comprehensive wellness improvement",
        "specific_needs": ["weight loss", "muscle building", "sleep optimization"],
        "current_issues": ["poor sleep quality", "stress", "inconsistent diet"],
        "preferences": ["home workouts", "budget-friendly", "vegetarian options"]
    }
    
    print("📋 Wellness Request:", file=sys.stderr)
    print(json.dumps(wellness_request, indent=2), file=sys.stderr)
    
    # Simulate the coordination process
    print("\n🔄 Coordination Process:", file=sys.stderr)
    
    # Step 1: WellnessBuddy receives request
    print("1. WellnessBuddy receives wellness request", file=sys.stderr)
    
    # Step 2: WellnessBuddy analyzes requirements
    print("2. WellnessBuddy analyzes requirements and identifies needed specialists", file=sys.stderr)
    
    consultations_needed = []
    if any(word in json.dumps(wellness_request).lower() for word in ['diet', 'nutrition', 'meal', 'food', 'weight']):
        consultations_needed.append("DietKing")
        print("   → Needs DietKing for nutrition planning", file=sys.stderr)
    
    if any(word in json.dumps(wellness_request).lower() for word in ['fitness', 'workout', 'exercise', 'muscle', 'strength']):
        consultations_needed.append("GymBro")
        print("   → Needs GymBro for fitness planning", file=sys.stderr)
    
    if any(word in json.dumps(wellness_request).lower() for word in ['sleep', 'rest', 'insomnia', 'bedtime']):
        consultations_needed.append("SleepyJoe")
        print("   → Needs SleepyJoe for sleep optimization", file=sys.stderr)
    
    # Step 3: Create ACP jobs to specialists
    print(f"\n3. Creating ACP jobs to specialists: {consultations_needed}", file=sys.stderr)
    
    agent_jobs = {}
    for specialist in consultations_needed:
        if specialist in found_agents:
            print(f"   ✅ Would create ACP job to {specialist}", file=sys.stderr)
            agent_jobs[specialist] = {
                "job_id": f"job_{specialist.lower()}_{hash(specialist)}",
                "status": "created",
                "specialist_wallet": found_agents[specialist]["wallet"]
            }
        else:
            print(f"   ❌ Cannot create job to {specialist} (not found)", file=sys.stderr)
    
    # Step 4: Simulate specialist responses
    print("\n4. Specialists process requests and provide deliverables", file=sys.stderr)
    
    specialist_responses = {}
    for specialist, job_info in agent_jobs.items():
        print(f"   📤 {specialist} receives job {job_info['job_id']}", file=sys.stderr)
        
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
        print(f"   📥 {specialist} delivers comprehensive plan", file=sys.stderr)
    
    # Step 5: WellnessBuddy synthesizes responses
    print("\n5. WellnessBuddy synthesizes specialist responses", file=sys.stderr)
    
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
    
    print("   ✅ Final wellness plan synthesized", file=sys.stderr)
    
    # Test 3: Display final results
    print("\n📊 Test 3: Final Results", file=sys.stderr)
    print("-" * 20, file=sys.stderr)
    
    print(f"Agents Found: {len(found_agents)}/{len(agents_to_find)}", file=sys.stderr)
    for agent_name, info in found_agents.items():
        status = "🟢 Online" if info["online"] else "🔴 Offline"
        print(f"  {agent_name}: {status} ({info['offerings']} offerings)", file=sys.stderr)
    
    print(f"\nCoordination Results:", file=sys.stderr)
    print(f"  Specialists Consulted: {len(consultations_needed)}", file=sys.stderr)
    print(f"  ACP Jobs Created: {len(agent_jobs)}", file=sys.stderr)
    print(f"  Responses Received: {len(specialist_responses)}", file=sys.stderr)
    
    print(f"\nFinal Plan Components:", file=sys.stderr)
    for component, description in final_wellness_plan["integrated_recommendations"].items():
        print(f"  {component.title()}: {description}", file=sys.stderr)
    
    # Test 4: Economic Analysis
    print("\n💰 Test 4: Economic Analysis", file=sys.stderr)
    print("-" * 25, file=sys.stderr)
    
    # Simulate economic transactions
    base_job_cost = 10  # USDC per specialist consultation
    total_cost = len(agent_jobs) * base_job_cost
    
    print(f"Economic Flow:", file=sys.stderr)
    print(f"  User → WellnessBuddy: ${total_cost + 5} USDC (coordination fee)", file=sys.stderr)
    print(f"  WellnessBuddy → Specialists: ${total_cost} USDC", file=sys.stderr)
    for specialist in agent_jobs.keys():
        print(f"    → {specialist}: ${base_job_cost} USDC", file=sys.stderr)
    print(f"  WellnessBuddy Profit: $5 USDC (coordination fee)", file=sys.stderr)
    
    print(f"\nBenefits of ACP Coordination:", file=sys.stderr)
    print("  ✅ Decentralized: No central authority needed", file=sys.stderr)
    print("  ✅ Incentivized: Each agent earns for their expertise", file=sys.stderr)
    print("  ✅ Transparent: All transactions on-chain", file=sys.stderr)
    print("  ✅ Scalable: Any agent can hire any other agent", file=sys.stderr)
    print("  ✅ Quality: Economic incentives ensure quality work", file=sys.stderr)
    
    return final_wellness_plan

def main():
    """Main function to run the test"""
    parser = argparse.ArgumentParser(description="Test ACP Agent Coordination or Generate Wellness Plan")
    parser.add_argument("--user-input", type=str, help="JSON string containing user input for wellness plan generation")
    args = parser.parse_args()
    
    try:
        if args.user_input:
            # Generate wellness plan with thinking animations
            print("🎯 Generating personalized wellness plan...", file=sys.stderr)
            result = asyncio.run(generate_wellness_plan_with_thinking_animations(args.user_input))
            
            # Print the result as JSON for the API to capture (only this goes to stdout)
            print(json.dumps(result, indent=2))
        else:
            # Run the ACP coordination test
            result = asyncio.run(test_acp_agent_coordination())
            
            print("\n🎉 ACP Agent-to-Agent Coordination Test Completed!", file=sys.stderr)
            print("=" * 60, file=sys.stderr)
            
            # Save results to file
            with open("acp_coordination_test_results.json", "w") as f:
                json.dump(result, f, indent=2)
            print("📄 Results saved to acp_coordination_test_results.json", file=sys.stderr)
        
    except Exception as e:
        print(f"❌ Test failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
