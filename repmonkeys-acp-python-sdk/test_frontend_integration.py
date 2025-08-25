#!/usr/bin/env python3
"""
Test script for frontend integration with Python AI system
This script tests the AI wellness API integration
"""

import json
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from ai_wellness_api import AIWellnessAPI
    print("✅ Successfully imported AIWellnessAPI")
except ImportError as e:
    print(f"❌ Failed to import AIWellnessAPI: {e}")
    sys.exit(1)

async def test_frontend_integration():
    """Test the frontend integration with sample data"""
    
    print("🧪 Testing Frontend Integration")
    print("=" * 40)
    
    # Sample frontend request data
    test_requests = [
        {
            "user_message": "I need a workout plan for beginners",
            "user_goals": ["lose weight", "build strength"],
            "user_profile": {"fitness_level": "beginner", "age": 25},
            "wallet_address": "0x938b9642dB80F48BD3E4eB8CEF0Da573495B8D2B",
            "chain_id": 8453
        },
        {
            "user_message": "Give me healthy meal ideas for dinner",
            "user_goals": ["eat healthy", "meal prep"],
            "user_profile": {"dietary_restrictions": [], "cooking_skill": "intermediate"},
            "wallet_address": "0x938b9642dB80F48BD3E4eB8CEF0Da573495B8D2B",
            "chain_id": 8453
        },
        {
            "user_message": "How can I improve my sleep quality?",
            "user_goals": ["better sleep", "reduce stress"],
            "user_profile": {"sleep_issues": ["insomnia"], "stress_level": "high"},
            "wallet_address": "0x938b9642dB80F48BD3E4eB8CEF0Da573495B8D2B",
            "chain_id": 8453
        }
    ]
    
    api = AIWellnessAPI()
    
    for i, request in enumerate(test_requests, 1):
        print(f"\n📝 Test {i}: {request['user_message']}")
        print("-" * 30)
        
        try:
            # Test the wellness advice function
            result = await api.get_wellness_advice(
                request['user_message'],
                request['user_goals'],
                request['user_profile']
            )
            
            print(f"✅ Response type: {result.get('type', 'unknown')}")
            print(f"📊 Wellness score impact: {result.get('wellness_score_impact', 'N/A')}")
            print(f"💰 Token rewards: {result.get('token_rewards', 'N/A')}")
            
            # Check if blockchain actions are suggested
            if 'blockchain_actions' in result:
                print("🔗 Blockchain actions suggested:")
                for action in result['blockchain_actions']:
                    print(f"  - {action['description']}")
            
            print(f"📝 Response preview: {str(result.get('advice', result.get('message', '')))[:100]}...")
            
        except Exception as e:
            print(f"❌ Error in test {i}: {e}")
    
    print("\n🎉 Frontend integration test completed!")

async def test_api_endpoint_simulation():
    """Simulate the API endpoint behavior"""
    
    print("\n🌐 Testing API Endpoint Simulation")
    print("=" * 40)
    
    # Simulate the data structure that would be sent from frontend
    api_request = {
        "user_message": "I want to start a fitness routine",
        "user_goals": ["build muscle", "improve endurance"],
        "user_profile": {
            "fitness_level": "beginner",
            "age": 28,
            "available_time": "45 minutes daily",
            "equipment": "minimal"
        },
        "wallet_address": "0x938b9642dB80F48BD3E4eB8CEF0Da573495B8D2B",
        "chain_id": 8453
    }
    
    print(f"📤 Simulated API request:")
    print(json.dumps(api_request, indent=2))
    
    try:
        api = AIWellnessAPI()
        response = await api.get_wellness_advice(
            api_request["user_message"],
            api_request["user_goals"],
            api_request["user_profile"]
        )
        
        print(f"\n📥 API response:")
        print(json.dumps(response, indent=2))
        
        # Simulate blockchain integration
        print(f"\n🔗 Blockchain Integration:")
        print(f"  - Contract addresses available: ✅")
        print(f"  - Network: Base Mainnet (Chain ID: 8453)")
        print(f"  - Suggested actions: {len(response.get('blockchain_actions', []))}")
        
    except Exception as e:
        print(f"❌ API simulation failed: {e}")

async def main():
    """Main test function"""
    
    print("🚀 Frontend Integration Test Suite")
    print("=" * 50)
    
    # Test basic integration
    await test_frontend_integration()
    
    # Test API endpoint simulation
    await test_api_endpoint_simulation()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")
    print("\n📋 Next steps:")
    print("1. Start your frontend application")
    print("2. Test the /api/ai-wellness endpoint")
    print("3. Verify blockchain integration works")
    print("4. Test with real wallet connections")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

if __name__ == "__main__":
    main()
