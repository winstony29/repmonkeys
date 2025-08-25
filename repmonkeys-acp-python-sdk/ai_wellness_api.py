#!/usr/bin/env python3
"""
AI Wellness API - Integration with repmonkeys-acp-python-sdk
This script provides AI wellness advice using the multi-agent coordination system.
"""

import sys
import json
import asyncio
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

# Add the current directory to Python path to import local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from multi_agent_coordinator import MultiAgentCoordinator, AgentType, CoordinationRequest
except ImportError:
    print("Warning: Could not import multi_agent_coordinator, using fallback responses")
    MultiAgentCoordinator = None

# Load environment variables
load_dotenv()

class AIWellnessAPI:
    def __init__(self):
        self.openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
        self.coordinator = None
        
        if self.openrouter_api_key and MultiAgentCoordinator:
            try:
                self.coordinator = MultiAgentCoordinator(self.openrouter_api_key)
                print("✅ Multi-agent coordinator initialized successfully")
            except Exception as e:
                print(f"⚠️ Failed to initialize coordinator: {e}")
                self.coordinator = None
        else:
            print("⚠️ OpenRouter API key not found or coordinator unavailable")
    
    def analyze_user_message(self, user_message: str) -> Dict[str, Any]:
        """Analyze user message to determine wellness needs"""
        lower_message = user_message.lower()
        
        # Determine primary agent based on message content
        if any(word in lower_message for word in ['workout', 'exercise', 'gym', 'fitness', 'training']):
            primary_agent = AgentType.GYM_BRO
            consultation_needed = [AgentType.DIET_KING, AgentType.SLEEPY_JOE]
        elif any(word in lower_message for word in ['diet', 'nutrition', 'food', 'meal', 'eating']):
            primary_agent = AgentType.DIET_KING
            consultation_needed = [AgentType.GYM_BRO, AgentType.SLEEPY_JOE]
        elif any(word in lower_message for word in ['sleep', 'rest', 'bedtime', 'insomnia', 'tired']):
            primary_agent = AgentType.SLEEPY_JOE
            consultation_needed = [AgentType.GYM_BRO, AgentType.DIET_KING]
        elif any(word in lower_message for word in ['stress', 'anxiety', 'mental', 'wellness', 'health']):
            primary_agent = AgentType.WELLNESS_BUDDY
            consultation_needed = [AgentType.GYM_BRO, AgentType.DIET_KING, AgentType.SLEEPY_JOE]
        else:
            primary_agent = AgentType.WELLNESS_BUDDY
            consultation_needed = [AgentType.GYM_BRO, AgentType.DIET_KING, AgentType.SLEEPY_JOE]
        
        return {
            "primary_agent": primary_agent,
            "consultation_needed": consultation_needed,
            "analysis": {
                "detected_topics": self._extract_topics(lower_message),
                "urgency_level": self._assess_urgency(lower_message),
                "complexity": self._assess_complexity(lower_message)
            }
        }
    
    def _extract_topics(self, message: str) -> List[str]:
        """Extract wellness topics from user message"""
        topics = []
        topic_keywords = {
            'workout': ['workout', 'exercise', 'gym', 'fitness', 'training', 'strength', 'cardio'],
            'nutrition': ['diet', 'nutrition', 'food', 'meal', 'eating', 'calories', 'protein'],
            'sleep': ['sleep', 'rest', 'bedtime', 'insomnia', 'tired', 'energy'],
            'mental': ['stress', 'anxiety', 'mental', 'mindfulness', 'meditation'],
            'general': ['wellness', 'health', 'lifestyle', 'routine', 'goals']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in message for keyword in keywords):
                topics.append(topic)
        
        return topics if topics else ['general']
    
    def _assess_urgency(self, message: str) -> str:
        """Assess urgency level of user request"""
        urgent_words = ['urgent', 'emergency', 'help', 'crisis', 'desperate', 'immediately']
        if any(word in message for word in urgent_words):
            return "high"
        elif any(word in message for word in ['soon', 'quick', 'fast', 'asap']):
            return "medium"
        return "low"
    
    def _assess_complexity(self, message: str) -> str:
        """Assess complexity of user request"""
        complex_indicators = ['comprehensive', 'detailed', 'complete', 'thorough', 'all', 'everything']
        if any(word in message for word in complex_indicators):
            return "high"
        elif len(message.split()) > 20:
            return "medium"
        return "low"
    
    async def get_wellness_advice(self, user_message: str, user_goals: List[str] = None, user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get comprehensive wellness advice using multi-agent coordination"""
        
        if not self.coordinator:
            return self._get_fallback_response(user_message)
        
        try:
            # Analyze user message
            analysis = self.analyze_user_message(user_message)
            
            # Prepare user requirements
            user_requirements = {
                "user_message": user_message,
                "user_goals": user_goals or [],
                "user_profile": user_profile or {},
                "detected_topics": analysis["analysis"]["detected_topics"],
                "urgency_level": analysis["analysis"]["urgency_level"],
                "complexity": analysis["analysis"]["complexity"]
            }
            
            # Create coordination request
            request = CoordinationRequest(
                user_requirements=user_requirements,
                primary_agent=analysis["primary_agent"],
                consultation_needed=analysis["consultation_needed"],
                coordination_type="hierarchical"
            )
            
            # Get coordinated response
            print(f"🤖 Coordinating response with {request.primary_agent.value} and {[agent.value for agent in request.consultation_needed]}")
            
            result = await self.coordinator.coordinate_multi_agent_response(request)
            
            # Format the response for the frontend
            formatted_response = self._format_response(result, analysis)
            
            return formatted_response
            
        except Exception as e:
            print(f"❌ Error in multi-agent coordination: {e}")
            return self._get_fallback_response(user_message)
    
    def _format_response(self, result: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Format the multi-agent response for frontend consumption"""
        
        # Extract key information from the result
        if "integrated_plan" in result:
            main_content = result["integrated_plan"]
        elif "analysis" in result:
            main_content = result["analysis"]
        else:
            main_content = str(result)
        
        # Create a structured response
        formatted = {
            "coordinator": "Smasher",
            "status": "completed",
            "timestamp": result.get("timestamp", ""),
            "primary_agent": analysis["primary_agent"].value,
            "consulting_agents": [agent.value for agent in analysis["consultation_needed"]],
            "message": f"🎯 Comprehensive wellness plan delivered by {analysis['primary_agent'].value} with consultation from {', '.join([agent.value for agent in analysis['consultation_needed']])}",
            "analysis_summary": {
                "scenario": analysis["analysis"]["detected_topics"],
                "key_challenges": analysis["analysis"]["urgency_level"],
                "optimal_strategy": analysis["analysis"]["complexity"]
            },
            "recommendations": {
                "primary": {
                    "title": f"{analysis['primary_agent'].value} Analysis",
                    "content": main_content,
                    "agent": analysis["primary_agent"].value
                }
            },
            "raw_response": result
        }
        
        # Add specific recommendations if available
        if "priority_actions" in result:
            formatted["recommendations"]["priority_actions"] = result["priority_actions"]
        
        if "timeline" in result:
            formatted["recommendations"]["timeline"] = result["timeline"]
        
        return formatted
    
    def _get_fallback_response(self, user_message: str) -> Dict[str, Any]:
        """Provide fallback response when coordination fails"""
        lower_message = user_message.lower()
        
        if any(word in lower_message for word in ['workout', 'exercise', 'gym']):
            content = "💪 Based on your workout goals, I recommend a balanced approach:\n\n🏃‍♂️ **Cardio**: 3-4 sessions per week, 30-45 minutes\n🏋️‍♂️ **Strength Training**: 3 sessions per week, focusing on compound movements\n🧘‍♀️ **Recovery**: Include stretching and rest days\n\nStart with 3 days per week and gradually increase intensity. Remember, consistency beats perfection!"
        elif any(word in lower_message for word in ['diet', 'nutrition', 'food']):
            content = "🥗 Here's your personalized nutrition plan:\n\n🍳 **Breakfast**: Protein + complex carbs (eggs + oatmeal)\n🥙 **Lunch**: Lean protein + vegetables + healthy fats\n🍽️ **Dinner**: Light protein + vegetables\n🍎 **Snacks**: Nuts, fruits, or Greek yogurt\n\nAim for 3 meals + 2 snacks daily. Stay hydrated with 8+ glasses of water!"
        elif any(word in lower_message for word in ['sleep', 'rest', 'bedtime']):
            content = "😴 Sleep optimization strategy:\n\n⏰ **Bedtime**: Aim for 7-9 hours, go to bed at the same time daily\n🌙 **Environment**: Dark, cool (65-68°F), quiet room\n📱 **Habits**: No screens 1 hour before bed, read or meditate instead\n☕ **Avoid**: Caffeine after 2 PM, heavy meals before bed\n\nQuality sleep is your foundation for wellness!"
        elif any(word in lower_message for word in ['stress', 'anxiety', 'mental']):
            content = "🧘‍♀️ Mental wellness approach:\n\n💆‍♂️ **Daily Practice**: 10-15 minutes meditation or deep breathing\n🏃‍♀️ **Physical Activity**: Exercise releases endorphins\n📝 **Journaling**: Write down thoughts and gratitude\n🎯 **Mindfulness**: Stay present, one task at a time\n\nRemember, mental health is just as important as physical health!"
        else:
            content = "🌟 Here's your comprehensive wellness advice:\n\n🎯 **Set Clear Goals**: Define what wellness means to you\n📊 **Track Progress**: Monitor your habits and improvements\n🔄 **Stay Consistent**: Small daily actions create lasting change\n🎉 **Celebrate Wins**: Acknowledge your progress, no matter how small\n\nYou're on the right path! Keep going! 💪"
        
        return {
            "coordinator": "Smasher (Fallback)",
            "status": "fallback",
            "message": "🌟 Here's your personalized wellness advice!",
            "recommendations": {
                "primary": {
                    "title": "Wellness Recommendation",
                    "content": content,
                    "agent": "Fallback System"
                }
            },
            "note": "This response was generated using fallback logic. The multi-agent coordination system is currently unavailable."
        }

def main():
    """Main function to handle command line calls from the API"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input data provided"}))
        sys.exit(1)
    
    try:
        # Parse input data
        input_data = json.loads(sys.argv[1])
        user_message = input_data.get("user_message", "")
        user_goals = input_data.get("user_goals", [])
        user_profile = input_data.get("user_profile", {})
        
        if not user_message:
            print(json.dumps({"error": "User message is required"}))
            sys.exit(1)
        
        # Initialize API
        api = AIWellnessAPI()
        
        # Get wellness advice
        async def get_advice():
            return await api.get_wellness_advice(user_message, user_goals, user_profile)
        
        # Run async function
        result = asyncio.run(get_advice())
        
        # Output result as JSON
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError:
        print(json.dumps({"error": "Invalid JSON input"}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
