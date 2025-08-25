import asyncio
import json
import threading
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AgentType(Enum):
    WELLNESS_BUDDY = "WellnessBuddy"
    DIET_KING = "DietKing"
    GYM_BRO = "GymBro"
    SLEEPY_JOE = "SleepyJoe"

@dataclass
class AgentExpertise:
    agent_type: AgentType
    specialties: List[str]
    capabilities: List[str]
    consultation_prompt: str

@dataclass
class CoordinationRequest:
    user_requirements: Dict[str, Any]
    primary_agent: AgentType
    consultation_needed: List[AgentType]
    coordination_type: str  # "sequential", "parallel", "hierarchical"

class MultiAgentCoordinator:
    def __init__(self, openrouter_api_key: str):
        self.openrouter_api_key = openrouter_api_key
        # Initialize OpenAI client with OpenRouter configuration
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=openrouter_api_key,
        )
        
        # Define agent expertise profiles
        self.agent_expertise = {
            AgentType.WELLNESS_BUDDY: AgentExpertise(
                agent_type=AgentType.WELLNESS_BUDDY,
                specialties=["general wellness", "stress management", "lifestyle optimization"],
                capabilities=["holistic assessment", "cross-domain recommendations"],
                consultation_prompt="You are a wellness coordinator. Analyze the user's needs and determine which specialist agents should be consulted."
            ),
            AgentType.DIET_KING: AgentExpertise(
                agent_type=AgentType.DIET_KING,
                specialties=["nutrition", "meal planning", "diet optimization"],
                capabilities=["calorie calculation", "macro tracking", "dietary restrictions"],
                consultation_prompt="You are a nutrition specialist. Provide detailed dietary recommendations based on user goals and preferences."
            ),
            AgentType.GYM_BRO: AgentExpertise(
                agent_type=AgentType.GYM_BRO,
                specialties=["fitness", "workout planning", "strength training"],
                capabilities=["exercise programming", "form guidance", "progressive overload"],
                consultation_prompt="You are a fitness specialist. Create personalized workout plans based on user fitness level and goals."
            ),
            AgentType.SLEEPY_JOE: AgentExpertise(
                agent_type=AgentType.SLEEPY_JOE,
                specialties=["sleep optimization", "sleep hygiene", "circadian rhythm"],
                capabilities=["sleep analysis", "bedtime routines", "sleep environment optimization"],
                consultation_prompt="You are a sleep specialist. Provide sleep optimization strategies based on user's sleep patterns and environment."
            )
        }
    
    async def coordinate_multi_agent_response(self, request: CoordinationRequest) -> Dict[str, Any]:
        """
        Coordinate multiple agents to provide a comprehensive response
        """
        print(f"🤖 Multi-Agent Coordination: {request.primary_agent.value} consulting {[agent.value for agent in request.consultation_needed]}")
        
        # Step 1: Primary agent analysis
        primary_analysis = await self._get_agent_analysis(
            request.primary_agent, 
            request.user_requirements
        )
        
        # Step 2: Get consultations from other agents
        consultations = {}
        for agent_type in request.consultation_needed:
            consultation = await self._get_agent_consultation(
                agent_type, 
                request.user_requirements,
                primary_analysis
            )
            consultations[agent_type.value] = consultation
        
        # Step 3: Synthesize comprehensive response
        final_response = await self._synthesize_response(
            request.user_requirements,
            primary_analysis,
            consultations
        )
        
        return final_response
    
    async def _get_agent_analysis(self, agent_type: AgentType, requirements: Dict[str, Any]) -> Dict[str, Any]:
        """Get analysis from a specific agent"""
        expertise = self.agent_expertise[agent_type]
        
        prompt = f"""
        {expertise.consultation_prompt}
        
        User Requirements:
        {json.dumps(requirements, indent=2)}
        
        Provide a detailed analysis including:
        1. Assessment of user needs
        2. Specific recommendations
        3. Implementation steps
        4. Expected outcomes
        5. Any concerns or considerations
        
        Format your response as JSON with keys: assessment, recommendations, implementation, outcomes, considerations
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="openai/gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                extra_headers={
                    "HTTP-Referer": "https://virtuals-acp-wellness.com",  # Optional: Site URL for rankings
                    "X-Title": "Virtuals ACP Wellness Platform",  # Optional: Site title for rankings
                }
            )
            
            content = response.choices[0].message.content
            # Try to parse as JSON, fallback to text
            try:
                return json.loads(content)
            except:
                return {"analysis": content}
                
        except Exception as e:
            print(f"Error getting analysis from {agent_type.value}: {e}")
            return {"error": f"Failed to get analysis from {agent_type.value}"}
    
    async def _get_agent_consultation(self, agent_type: AgentType, requirements: Dict[str, Any], primary_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Get consultation from an agent with context from primary analysis"""
        expertise = self.agent_expertise[agent_type]
        
        prompt = f"""
        {expertise.consultation_prompt}
        
        User Requirements:
        {json.dumps(requirements, indent=2)}
        
        Primary Agent Analysis:
        {json.dumps(primary_analysis, indent=2)}
        
        Provide a consultation that:
        1. Builds upon the primary analysis
        2. Adds your specialized expertise
        3. Identifies potential conflicts or synergies
        4. Suggests integration strategies
        
        Focus on your specialties: {', '.join(expertise.specialties)}
        
        Format your response as JSON with keys: consultation, synergies, conflicts, integration_suggestions
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="openai/gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                extra_headers={
                    "HTTP-Referer": "https://virtuals-acp-wellness.com",  # Optional: Site URL for rankings
                    "X-Title": "Virtuals ACP Wellness Platform",  # Optional: Site title for rankings
                }
            )
            
            content = response.choices[0].message.content
            try:
                return json.loads(content)
            except:
                return {"consultation": content}
                
        except Exception as e:
            print(f"Error getting consultation from {agent_type.value}: {e}")
            return {"error": f"Failed to get consultation from {agent_type.value}"}
    
    async def _synthesize_response(self, requirements: Dict[str, Any], primary_analysis: Dict[str, Any], consultations: Dict[str, Any]) -> Dict[str, Any]:
        """Synthesize all agent inputs into a comprehensive response"""
        
        prompt = f"""
        You are a wellness coordination expert. Synthesize the following multi-agent analysis into a comprehensive wellness plan.
        
        User Requirements:
        {json.dumps(requirements, indent=2)}
        
        Primary Analysis:
        {json.dumps(primary_analysis, indent=2)}
        
        Agent Consultations:
        {json.dumps(consultations, indent=2)}
        
        Create a comprehensive wellness plan that:
        1. Integrates all specialist recommendations
        2. Resolves any conflicts between agents
        3. Provides a cohesive implementation strategy
        4. Includes priority actions and timeline
        5. Addresses potential challenges
        
        Format your response as JSON with keys: integrated_plan, priority_actions, timeline, challenges, success_metrics
        """
        
        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="openai/gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                extra_headers={
                    "HTTP-Referer": "https://virtuals-acp-wellness.com",  # Optional: Site URL for rankings
                    "X-Title": "Virtuals ACP Wellness Platform",  # Optional: Site title for rankings
                }
            )
            
            content = response.choices[0].message.content
            try:
                return json.loads(content)
            except:
                return {"integrated_plan": content}
                
        except Exception as e:
            print(f"Error synthesizing response: {e}")
            return {"error": "Failed to synthesize multi-agent response"}

# Example usage
async def example_coordination():
    coordinator = MultiAgentCoordinator(openrouter_api_key="your-openrouter-api-key")
    
    request = CoordinationRequest(
        user_requirements={
            "health_goal": "I want to lose weight while building muscle and improving sleep",
            "current_habits": "I work long hours, eat mostly fast food, and get 5-6 hours of sleep",
            "preferences": "I prefer natural approaches and have 1 hour daily for exercise"
        },
        primary_agent=AgentType.WELLNESS_BUDDY,
        consultation_needed=[AgentType.DIET_KING, AgentType.GYM_BRO, AgentType.SLEEPY_JOE],
        coordination_type="hierarchical"
    )
    
    result = await coordinator.coordinate_multi_agent_response(request)
    return result

if __name__ == "__main__":
    # Run example
    result = asyncio.run(example_coordination())
    print(json.dumps(result, indent=2))
