"""
Multi-Agent LLM Coordination Examples

This file demonstrates different patterns for multi-agent coordination:
1. Hierarchical Coordination (Primary + Consultants)
2. Parallel Coordination (All agents simultaneously)
3. Sequential Coordination (Chain of consultations)
4. Consensus Building (Voting/agreement)
"""

import asyncio
import json
import os
from dotenv import load_dotenv
from multi_agent_coordinator import MultiAgentCoordinator, CoordinationRequest, AgentType

# Load environment variables
load_dotenv(override=True)

async def example_hierarchical_coordination():
    """Example: WellnessBuddy as primary, consulting specialists"""
    print("🏥 Hierarchical Coordination Example")
    print("=" * 50)
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found in environment")
    coordinator = MultiAgentCoordinator(openrouter_api_key=api_key)
    
    request = CoordinationRequest(
        user_requirements={
            "health_goal": "I want to lose 20 pounds while building muscle and improving sleep quality",
            "current_habits": "I work 12-hour shifts, eat mostly fast food, sleep 5-6 hours, no exercise",
            "preferences": "I prefer natural approaches, have 1 hour daily for exercise, vegetarian diet",
            "constraints": "Limited time, budget constraints, noisy apartment"
        },
        primary_agent=AgentType.WELLNESS_BUDDY,
        consultation_needed=[AgentType.DIET_KING, AgentType.GYM_BRO, AgentType.SLEEPY_JOE],
        coordination_type="hierarchical"
    )
    
    result = await coordinator.coordinate_multi_agent_response(request)
    return result

async def example_parallel_coordination():
    """Example: All agents working simultaneously"""
    print("🔄 Parallel Coordination Example")
    print("=" * 50)
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found in environment")
    coordinator = MultiAgentCoordinator(openrouter_api_key=api_key)
    
    request = CoordinationRequest(
        user_requirements={
            "health_goal": "Comprehensive wellness transformation",
            "current_habits": "Sedentary lifestyle, poor diet, irregular sleep",
            "preferences": "Holistic approach, sustainable changes",
            "timeline": "6-month transformation"
        },
        primary_agent=AgentType.WELLNESS_BUDDY,
        consultation_needed=[AgentType.DIET_KING, AgentType.GYM_BRO, AgentType.SLEEPY_JOE],
        coordination_type="parallel"
    )
    
    result = await coordinator.coordinate_multi_agent_response(request)
    return result

async def example_sequential_coordination():
    """Example: Chain of consultations (Wellness → Diet → Fitness → Sleep)"""
    print("⛓️ Sequential Coordination Example")
    print("=" * 50)
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found in environment")
    coordinator = MultiAgentCoordinator(openrouter_api_key=api_key)
    
    # Step 1: Wellness assessment
    wellness_request = CoordinationRequest(
        user_requirements={
            "health_goal": "Improve overall wellness and energy levels",
            "current_habits": "Stressful job, poor sleep, inconsistent eating",
            "preferences": "Natural remedies, gradual changes"
        },
        primary_agent=AgentType.WELLNESS_BUDDY,
        consultation_needed=[],
        coordination_type="sequential"
    )
    
    wellness_result = await coordinator.coordinate_multi_agent_response(wellness_request)
    
    # Step 2: Diet consultation (building on wellness assessment)
    diet_request = CoordinationRequest(
        user_requirements={
            "health_goal": "Optimize nutrition for energy and wellness",
            "wellness_assessment": wellness_result,
            "preferences": "Natural foods, meal prep friendly"
        },
        primary_agent=AgentType.DIET_KING,
        consultation_needed=[AgentType.WELLNESS_BUDDY],
        coordination_type="sequential"
    )
    
    diet_result = await coordinator.coordinate_multi_agent_response(diet_request)
    
    # Step 3: Fitness consultation (building on diet plan)
    fitness_request = CoordinationRequest(
        user_requirements={
            "health_goal": "Build strength and endurance",
            "diet_plan": diet_result,
            "wellness_assessment": wellness_result,
            "preferences": "Home workouts, progressive training"
        },
        primary_agent=AgentType.GYM_BRO,
        consultation_needed=[AgentType.WELLNESS_BUDDY, AgentType.DIET_KING],
        coordination_type="sequential"
    )
    
    fitness_result = await coordinator.coordinate_multi_agent_response(fitness_request)
    
    # Step 4: Sleep optimization (integrating all previous plans)
    sleep_request = CoordinationRequest(
        user_requirements={
            "health_goal": "Optimize sleep for recovery and wellness",
            "wellness_assessment": wellness_result,
            "diet_plan": diet_result,
            "fitness_plan": fitness_result,
            "preferences": "Natural sleep aids, environment optimization"
        },
        primary_agent=AgentType.SLEEPY_JOE,
        consultation_needed=[AgentType.WELLNESS_BUDDY, AgentType.DIET_KING, AgentType.GYM_BRO],
        coordination_type="sequential"
    )
    
    sleep_result = await coordinator.coordinate_multi_agent_response(sleep_request)
    
    return {
        "wellness_assessment": wellness_result,
        "diet_plan": diet_result,
        "fitness_plan": fitness_result,
        "sleep_plan": sleep_result,
        "integrated_approach": "Sequential coordination completed"
    }

async def example_consensus_building():
    """Example: All agents vote on the best approach"""
    print("🗳️ Consensus Building Example")
    print("=" * 50)
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found in environment")
    coordinator = MultiAgentCoordinator(openrouter_api_key=api_key)
    
    request = CoordinationRequest(
        user_requirements={
            "health_goal": "Find the most effective wellness strategy",
            "current_habits": "Mixed approach needed",
            "preferences": "Evidence-based recommendations",
            "constraints": "Need consensus from all specialists"
        },
        primary_agent=AgentType.WELLNESS_BUDDY,
        consultation_needed=[AgentType.DIET_KING, AgentType.GYM_BRO, AgentType.SLEEPY_JOE],
        coordination_type="consensus"
    )
    
    result = await coordinator.coordinate_multi_agent_response(request)
    return result

async def example_specialized_consultation():
    """Example: Specific consultation for complex cases"""
    print("🎯 Specialized Consultation Example")
    print("=" * 50)
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not found in environment")
    coordinator = MultiAgentCoordinator(openrouter_api_key=api_key)
    
    # Case: Athlete with sleep issues
    athlete_request = CoordinationRequest(
        user_requirements={
            "health_goal": "Optimize performance and recovery for competitive athlete",
            "current_habits": "Intense training 6 days/week, strict diet, 6-7 hours sleep",
            "preferences": "Performance-focused, data-driven approach",
            "special_considerations": "Competition schedule, travel, stress management"
        },
        primary_agent=AgentType.GYM_BRO,
        consultation_needed=[AgentType.DIET_KING, AgentType.SLEEPY_JOE],
        coordination_type="hierarchical"
    )
    
    result = await coordinator.coordinate_multi_agent_response(athlete_request)
    return result

# Run examples
async def run_all_examples():
    """Run all coordination examples"""
    examples = [
        ("Hierarchical", example_hierarchical_coordination),
        ("Parallel", example_parallel_coordination),
        ("Sequential", example_sequential_coordination),
        ("Consensus", example_consensus_building),
        ("Specialized", example_specialized_consultation)
    ]
    
    results = {}
    
    for name, example_func in examples:
        try:
            print(f"\n{'='*60}")
            print(f"Running {name} Coordination Example")
            print(f"{'='*60}")
            
            result = await example_func()
            results[name] = result
            
            print(f"✅ {name} coordination completed")
            print(f"Result type: {type(result)}")
            if isinstance(result, dict):
                print(f"Keys: {list(result.keys())}")
            
        except Exception as e:
            print(f"❌ Error in {name} example: {e}")
            results[name] = {"error": str(e)}
    
    return results

if __name__ == "__main__":
    print("🤖 Multi-Agent LLM Coordination Examples")
    print("Make sure to set your OpenRouter API key in the .env file")
    print("=" * 60)
    
    # Run examples
    results = asyncio.run(run_all_examples())
    
    # Save results
    with open("coordination_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📊 Results saved to coordination_results.json")
    print("🎉 All examples completed!")
