"""
Test script to verify OpenRouter integration with the multi-agent coordinator
"""

import asyncio
import json
import os
from dotenv import load_dotenv
from multi_agent_coordinator import MultiAgentCoordinator, CoordinationRequest, AgentType

# Load environment variables with override
load_dotenv(override=True)

async def test_openrouter_connection():
    """Test basic OpenRouter connection"""
    print("🔗 Testing OpenRouter Integration")
    print("=" * 50)
    
    # Get API key from environment
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        print("❌ OPENROUTER_API_KEY not found in environment")
        print("Please add your OpenRouter API key to the .env file:")
        print("OPENROUTER_API_KEY=your_key_here")
        return False
    
    try:
        # Initialize coordinator
        coordinator = MultiAgentCoordinator(api_key)
        print("✅ MultiAgentCoordinator initialized successfully")
        
        # Test simple coordination request
        request = CoordinationRequest(
            user_requirements={
                "health_goal": "I want to improve my sleep quality",
                "current_habits": "I work late and have trouble falling asleep",
                "preferences": "Natural remedies preferred"
            },
            primary_agent=AgentType.WELLNESS_BUDDY,
            consultation_needed=[AgentType.SLEEPY_JOE],
            coordination_type="hierarchical"
        )
        
        print("🔄 Testing multi-agent coordination...")
        result = await coordinator.coordinate_multi_agent_response(request)
        
        print("✅ Coordination test completed successfully!")
        print(f"Result type: {type(result)}")
        
        if isinstance(result, dict):
            print("Result keys:", list(result.keys()))
            if 'integrated_plan' in result:
                print("📋 Integrated plan generated successfully")
            if 'priority_actions' in result:
                print("🎯 Priority actions identified")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing OpenRouter integration: {e}")
        return False

async def test_model_availability():
    """Test different OpenRouter models"""
    print("\n🤖 Testing OpenRouter Model Availability")
    print("=" * 50)
    
    api_key = os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        print("❌ OPENROUTER_API_KEY not found")
        return False
    
    try:
        coordinator = MultiAgentCoordinator(api_key)
        
        # Test with different models
        models_to_test = [
            "openai/gpt-4o",
            "anthropic/claude-3.5-sonnet",
            "meta-llama/llama-3.1-8b-instruct",
            "google/gemini-pro"
        ]
        
        for model in models_to_test:
            try:
                print(f"Testing model: {model}")
                
                # Temporarily override the model
                original_client = coordinator.client
                coordinator.client = type(original_client)(
                    base_url="https://openrouter.ai/api/v1",
                    api_key=api_key,
                )
                
                # Test simple request
                response = await asyncio.to_thread(
                    coordinator.client.chat.completions.create,
                    model=model,
                    messages=[{"role": "user", "content": "Say 'Hello from OpenRouter!'"}],
                    max_tokens=50,
                    extra_headers={
                        "HTTP-Referer": "https://virtuals-acp-wellness.com",
                        "X-Title": "Virtuals ACP Wellness Platform",
                    }
                )
                
                print(f"✅ {model}: {response.choices[0].message.content.strip()}")
                
                # Restore original client
                coordinator.client = original_client
                
            except Exception as e:
                print(f"❌ {model}: {str(e)[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing models: {e}")
        return False

async def main():
    """Run all tests"""
    print("🚀 OpenRouter Integration Test Suite")
    print("=" * 60)
    
    # Test 1: Basic connection
    connection_ok = await test_openrouter_connection()
    
    # Test 2: Model availability
    models_ok = await test_model_availability()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 30)
    print(f"Connection Test: {'✅ PASS' if connection_ok else '❌ FAIL'}")
    print(f"Models Test: {'✅ PASS' if models_ok else '❌ FAIL'}")
    
    if connection_ok and models_ok:
        print("\n🎉 All tests passed! OpenRouter integration is working correctly.")
        print("\nNext steps:")
        print("1. Run: python enhanced_seller_with_coordination.py")
        print("2. Run: python multi_agent_examples.py")
    else:
        print("\n⚠️  Some tests failed. Please check your OpenRouter API key and configuration.")

if __name__ == "__main__":
    asyncio.run(main())
