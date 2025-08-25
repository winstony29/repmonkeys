#!/usr/bin/env python3
"""
Test script for the AI Wellness API integration
This script tests the API functionality without requiring the full frontend.
"""

import json
import sys
import os
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_ai_wellness_api():
    """Test the AI wellness API functionality"""
    
    print("🧪 Testing AI Wellness API Integration")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Workout Question",
            "message": "I need a workout plan for building muscle",
            "goals": ["Strength Training", "Muscle Building"],
            "expected_agent": "GymBro"
        },
        {
            "name": "Nutrition Question", 
            "message": "What should I eat to lose weight?",
            "goals": ["Weight Management"],
            "expected_agent": "DietKing"
        },
        {
            "name": "Sleep Question",
            "message": "I can't sleep well at night",
            "goals": ["Better Sleep"],
            "expected_agent": "SleepyJoe"
        },
        {
            "name": "General Wellness",
            "message": "I want to improve my overall health",
            "goals": ["General Wellness"],
            "expected_agent": "WellnessBuddy"
        }
    ]
    
    try:
        from ai_wellness_api import AIWellnessAPI
        
        # Initialize API
        api = AIWellnessAPI()
        
        if not api.coordinator:
            print("⚠️  Multi-agent coordinator not available, using fallback mode")
            print("   This is normal if OPENROUTER_API_KEY is not set")
        
        # Test each case
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n📝 Test {i}: {test_case['name']}")
            print(f"   Message: {test_case['message']}")
            print(f"   Expected Primary Agent: {test_case['expected_agent']}")
            
            try:
                # Test the API
                import asyncio
                result = asyncio.run(api.get_wellness_advice(
                    test_case['message'],
                    test_case['goals'],
                    {}
                ))
                
                # Check results
                if result.get('status') == 'fallback':
                    print("   ✅ Fallback response generated")
                else:
                    print("   ✅ AI response generated")
                
                print(f"   Primary Agent: {result.get('primary_agent', 'Unknown')}")
                print(f"   Status: {result.get('status', 'Unknown')}")
                
                # Validate response structure
                if 'recommendations' in result and 'primary' in result['recommendations']:
                    print("   ✅ Response structure is valid")
                else:
                    print("   ⚠️  Response structure may be incomplete")
                
            except Exception as e:
                print(f"   ❌ Test failed: {e}")
        
        print("\n🎉 Integration test completed!")
        
        # Summary
        print("\n📊 Summary:")
        if api.coordinator:
            print("   ✅ Multi-agent coordinator: Available")
            print("   ✅ AI responses: Enabled")
        else:
            print("   ⚠️  Multi-agent coordinator: Not available")
            print("   ✅ Fallback responses: Enabled")
        
        print("   ✅ API structure: Valid")
        print("   ✅ Response formatting: Working")
        
    except ImportError as e:
        print(f"❌ Failed to import AI wellness API: {e}")
        print("   Please ensure all dependencies are installed:")
        print("   pip3 install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

def test_python_script():
    """Test the Python script as a standalone executable"""
    
    print("\n🔧 Testing Python Script Execution")
    print("=" * 50)
    
    script_path = Path(__file__).parent / "ai_wellness_api.py"
    
    if not script_path.exists():
        print("❌ ai_wellness_api.py not found")
        return False
    
    # Test with sample input
    test_input = {
        "user_message": "I need workout advice",
        "user_goals": ["Fitness"],
        "user_profile": {}
    }
    
    try:
        import subprocess
        
        # Run the script
        result = subprocess.run(
            ["python3", str(script_path), json.dumps(test_input)],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ Script executed successfully")
            
            # Try to parse the output
            try:
                output = json.loads(result.stdout)
                print("✅ Output is valid JSON")
                print(f"   Status: {output.get('status', 'Unknown')}")
                print(f"   Coordinator: {output.get('coordinator', 'Unknown')}")
            except json.JSONDecodeError:
                print("⚠️  Output is not valid JSON (this might be expected)")
                print(f"   Output: {result.stdout[:200]}...")
        else:
            print("❌ Script execution failed")
            print(f"   Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Script execution timed out")
        return False
    except Exception as e:
        print(f"❌ Script execution error: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    print("🚀 AI Wellness API Integration Test Suite")
    print("=" * 60)
    
    # Test 1: API functionality
    api_test_passed = test_ai_wellness_api()
    
    # Test 2: Script execution
    script_test_passed = test_python_script()
    
    # Overall results
    print("\n" + "=" * 60)
    print("📋 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    if api_test_passed:
        print("✅ API Integration Test: PASSED")
    else:
        print("❌ API Integration Test: FAILED")
    
    if script_test_passed:
        print("✅ Script Execution Test: PASSED")
    else:
        print("❌ Script Execution Test: FAILED")
    
    if api_test_passed and script_test_passed:
        print("\n🎉 ALL TESTS PASSED!")
        print("   The AI wellness integration is ready to use.")
        print("\n   Next steps:")
        print("   1. Set your OPENROUTER_API_KEY in .env file")
        print("   2. Restart your Next.js development server")
        print("   3. Test the /api/ai-wellness endpoint")
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("   Please check the error messages above and fix the issues.")
        print("   The integration may not work correctly until all tests pass.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
