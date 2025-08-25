import threading
import time
import asyncio
import json
import os
from datetime import datetime, timedelta
from collections import deque
from typing import Optional
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable
from virtuals_acp.env import EnvSettings
from multi_agent_coordinator import MultiAgentCoordinator, CoordinationRequest, AgentType

load_dotenv(override=True)

class EnhancedWellnessSeller:
    def __init__(self, use_thread_lock: bool = True):
        self.env = EnvSettings()
        self.use_thread_lock = use_thread_lock
        
        # Initialize multi-agent coordinator
        openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
        if not openrouter_api_key:
            print("⚠️  Warning: OPENROUTER_API_KEY not set. Using rule-based fallback.")
            self.coordinator = None
        else:
            self.coordinator = MultiAgentCoordinator(openrouter_api_key)
        
        # Job processing setup
        self.job_queue = deque()
        self.job_queue_lock = threading.Lock()
        self.job_event = threading.Event()
        
        # Start job worker
        threading.Thread(target=self._job_worker, daemon=True).start()
        
        # Initialize ACP client with correct configuration
        from virtuals_acp.configs import BASE_SEPOLIA_CONFIG, BASE_MAINNET_CONFIG
        
        # Determine which configuration to use
        chain_env = os.getenv('CHAIN_ENV', 'base-sepolia')
        if chain_env == 'base-sepolia':
            config = BASE_SEPOLIA_CONFIG
            print("🔗 Using Base Sepolia testnet")
        else:
            config = BASE_MAINNET_CONFIG
            print("🔗 Using Base Mainnet")
        
        self.acp_client = VirtualsACP(
            wallet_private_key=self.env.WHITELISTED_WALLET_PRIVATE_KEY,
            agent_wallet_address=self.env.SELLER_AGENT_WALLET_ADDRESS,
            on_new_task=self._on_new_task,
            entity_id=self.env.SELLER_ENTITY_ID,
            config=config
        )
    
    def _safe_append_job(self, job, memo_to_sign: Optional[ACPMemo] = None):
        if self.use_thread_lock:
            print(f"[safe_append_job] Acquiring lock to append job {job.id}")
            with self.job_queue_lock:
                print(f"[safe_append_job] Lock acquired, appending job {job.id} to queue")
                self.job_queue.append((job, memo_to_sign))
        else:
            self.job_queue.append((job, memo_to_sign))
    
    def _safe_pop_job(self):
        if self.use_thread_lock:
            print(f"[safe_pop_job] Acquiring lock to pop job")
            with self.job_queue_lock:
                if self.job_queue:
                    job, memo_to_sign = self.job_queue.popleft()
                    print(f"[safe_pop_job] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[safe_pop_job] Queue is empty after acquiring lock")
        else:
            if self.job_queue:
                job, memo_to_sign = self.job_queue.popleft()
                print(f"[safe_pop_job] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[safe_pop_job] Queue is empty (no lock)")
        return None, None
    
    def _job_worker(self):
        while True:
            self.job_event.wait()
            while True:
                job, memo_to_sign = self._safe_pop_job()
                if not job:
                    break
                # Process each job in its own thread to avoid blocking
                threading.Thread(target=self._handle_job_with_delay, args=(job, memo_to_sign), daemon=True).start()
            if self.use_thread_lock:
                with self.job_queue_lock:
                    if not self.job_queue:
                        self.job_event.clear()
            else:
                if not self.job_queue:
                    self.job_event.clear()
    
    def _handle_job_with_delay(self, job, memo_to_sign):
        try:
            self._process_job(job, memo_to_sign)
            time.sleep(2)
        except Exception as e:
            print(f"❌ Error processing job: {e}")
    
    def _on_new_task(self, job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"[on_new_task] Received job {job.id} (phase: {job.phase})")
        self._safe_append_job(job, memo_to_sign)
        self.job_event.set()
    
    def _extract_service_requirements(self, job: ACPJob) -> dict:
        """Extract service requirements from job memos"""
        service_requirement = {}
        try:
            for memo in job.memos:
                if memo.content and memo.content.startswith('{"name":'):
                    content_data = json.loads(memo.content)
                    if 'serviceRequirement' in content_data:
                        service_requirement = content_data['serviceRequirement']
                        break
        except:
            pass
        return service_requirement
    
    def _determine_consultation_needed(self, service_requirements: dict) -> list:
        """Determine which agents should be consulted based on requirements"""
        consultations = []
        
        # Analyze requirements to determine needed expertise
        requirements_text = json.dumps(service_requirements).lower()
        
        if any(word in requirements_text for word in ['diet', 'DietKing', 'nutrition', 'meal', 'food', 'weight']):
            consultations.append(AgentType.DIET_KING)
        
        if any(word in requirements_text for word in ['fitness', 'GymBro', 'workout', 'exercise', 'muscle', 'strength']):
            consultations.append(AgentType.GYM_BRO)
        
        if any(word in requirements_text for word in ['sleep', 'SleepyJoe', 'bedtime', 'rest', 'insomnia']):
            consultations.append(AgentType.SLEEPY_JOE)
        
        # Always include WellnessBuddy for coordination
        if AgentType.WELLNESS_BUDDY not in consultations:
            consultations.append(AgentType.WELLNESS_BUDDY)
        
        return consultations
    
    async def _get_coordinated_response(self, service_requirements: dict) -> dict:
        """Get coordinated response from multiple agents"""
        if not self.coordinator:
            # Fallback to rule-based response
            return self._get_rule_based_response(service_requirements)
        
        # Determine which agents to consult based on requirements
        consultations = self._determine_consultation_needed(service_requirements)
        
        # Try ACP-based coordination first, fallback to LLM coordination
        try:
            acp_response = await self._get_acp_coordinated_response(service_requirements, consultations)
            if acp_response:
                return acp_response
        except Exception as e:
            print(f"⚠️ ACP coordination failed, falling back to LLM: {e}")
        
        # Fallback to LLM coordination
        try:
            # Create coordination request
            request = CoordinationRequest(
                user_requirements=service_requirements,
                primary_agent=AgentType.WELLNESS_BUDDY,
                consultation_needed=consultations,
                coordination_type="hierarchical"
            )
            
            # Get coordinated response
            result = await self.coordinator.coordinate_multi_agent_response(request)
            return result
            
        except Exception as e:
            print(f"Error in coordinated response: {e}")
            return self._get_rule_based_response(service_requirements)
    
    async def _get_acp_coordinated_response(self, service_requirements: dict, consultations: list) -> dict:
        """Get coordinated response through ACP agent-to-agent transactions"""
        
        agent_responses = {}
        
        for agent_type in consultations:
            if agent_type != AgentType.WELLNESS_BUDDY:
                try:
                    # Create ACP job to other agent
                    job_id = await self._create_agent_job(agent_type, service_requirements)
                    if job_id:
                        # Wait for response (simplified - in production would need proper job monitoring)
                        response = await self._wait_for_agent_response(job_id, agent_type)
                        if response:
                            agent_responses[agent_type.value] = response
                except Exception as e:
                    print(f"❌ Error with {agent_type.value}: {e}")
        
        # Synthesize responses
        return self._synthesize_acp_responses(service_requirements, agent_responses)
    
    async def _create_agent_job(self, agent_type: AgentType, requirements: dict) -> str:
        """Create an ACP job from WellnessBuddy to another agent"""
        
        # Map agent types to their wallet addresses
        agent_wallets = {
            AgentType.DIET_KING: self.env.DIETKING_WALLET_ADDRESS,
            AgentType.GYM_BRO: self.env.GYMBRO_WALLET_ADDRESS,
            AgentType.SLEEPY_JOE: self.env.SLEEPYJOE_WALLET_ADDRESS
        }
        
        target_wallet = agent_wallets.get(agent_type)
        if not target_wallet:
            print(f"❌ Unknown agent type: {agent_type}")
            return None
        
        try:
            # Find the target agent in ACP network
            target_agents = self.acp_client.browse_agents(
                keyword=agent_type.value,
                top_k=1
            )
            
            if target_agents:
                target_agent = target_agents[0]
                if target_agent.offerings:
                    offering = target_agent.offerings[0]
                    
                    # Create job from WellnessBuddy to target agent
                    job_id = offering.initiate_job(
                        service_requirement=requirements,
                        evaluator_address=self.env.SELLER_AGENT_WALLET_ADDRESS,  # WellnessBuddy evaluates
                        expired_at=datetime.now() + timedelta(hours=1)
                    )
                    
                    print(f"✅ Created ACP job {job_id} to {agent_type.value}")
                    return job_id
                else:
                    print(f"❌ {agent_type.value} has no offerings")
            else:
                print(f"❌ Could not find {agent_type.value} in ACP network")
                
        except Exception as e:
            print(f"❌ Error creating job to {agent_type.value}: {e}")
        
        return None
    
    async def _wait_for_agent_response(self, job_id: str, agent_type: AgentType) -> dict:
        """Wait for agent response (simplified implementation)"""
        
        # In a real implementation, this would monitor the job status
        # For now, we'll simulate a response based on agent type
        
        agent_responses = {
            AgentType.DIET_KING: {
                "nutrition_plan": "Personalized nutrition plan from DietKing",
                "meal_suggestions": ["High-protein breakfast", "Balanced lunch", "Light dinner"],
                "supplementation": ["Multivitamin", "Omega-3", "Protein powder"]
            },
            AgentType.GYM_BRO: {
                "workout_plan": "Comprehensive fitness program from GymBro",
                "exercise_routine": ["Strength training", "Cardio", "Flexibility"],
                "progression": "Progressive overload schedule"
            },
            AgentType.SLEEPY_JOE: {
                "sleep_plan": "Sleep optimization strategy from SleepyJoe",
                "bedtime_routine": ["Relaxation techniques", "Environment optimization"],
                "circadian_rhythm": "Sleep schedule optimization"
            }
        }
        
        # Simulate processing time
        await asyncio.sleep(2)
        
        return agent_responses.get(agent_type, {})
    
    def _synthesize_acp_responses(self, service_requirements: dict, agent_responses: dict) -> dict:
        """Synthesize responses from ACP agents"""
        
        synthesis = {
            "wellness_plan": {
                "overview": "Comprehensive wellness plan coordinated through ACP network",
                "primary_coordinator": "WellnessBuddy",
                "consulting_agents": list(agent_responses.keys()),
                "user_requirements": service_requirements
            },
            "agent_contributions": agent_responses,
            "integrated_recommendations": {
                "nutrition": agent_responses.get("DietKing", {}).get("nutrition_plan", "Basic nutrition guidance"),
                "fitness": agent_responses.get("GymBro", {}).get("workout_plan", "Basic fitness guidance"),
                "sleep": agent_responses.get("SleepyJoe", {}).get("sleep_plan", "Basic sleep guidance")
            },
            "implementation_priority": [
                "Establish sleep routine (SleepyJoe)",
                "Begin nutrition plan (DietKing)",
                "Start fitness program (GymBro)"
            ],
            "coordination_notes": "This plan was created through decentralized ACP agent-to-agent transactions, ensuring each specialist contributed their expertise through economic incentives."
        }
        
        return synthesis
    
    def _get_rule_based_response(self, service_requirements: dict) -> dict:
        """Fallback rule-based response when LLM is not available"""
        # Your existing rule-based logic here
        agent_type = "WellnessBuddy"
        
        if 'health_goal' in service_requirements:
            goal = service_requirements['health_goal'].lower()
            if 'sleep' in goal:
                return {
                    "integrated_plan": "Sleep optimization plan",
                    "priority_actions": ["Establish bedtime routine", "Optimize sleep environment"],
                    "timeline": "2-4 weeks",
                    "challenges": ["Work schedule conflicts"],
                    "success_metrics": ["Improved sleep quality", "Increased sleep duration"]
                }
            elif 'stress' in goal:
                return {
                    "integrated_plan": "Stress management plan",
                    "priority_actions": ["Practice breathing exercises", "Schedule relaxation time"],
                    "timeline": "1-2 weeks",
                    "challenges": ["Time constraints"],
                    "success_metrics": ["Reduced stress levels", "Better mood"]
                }
        
        return {
            "integrated_plan": "General wellness plan",
            "priority_actions": ["Start with small changes", "Track progress"],
            "timeline": "4-6 weeks",
            "challenges": ["Consistency"],
            "success_metrics": ["Overall wellness improvement"]
        }
    
    def _process_job(self, job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            print(f"Accepting job {job.id}")
            job.respond(True)
            
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"Delivering coordinated response for job {job.id}")
            
            # Extract service requirements
            service_requirements = self._extract_service_requirements(job)
            
            # Get coordinated response (async)
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                coordinated_response = loop.run_until_complete(
                    self._get_coordinated_response(service_requirements)
                )
            finally:
                loop.close()
            
            # Create deliverable
            deliverable = IDeliverable(
                type="json",
                value=coordinated_response,
                description="Multi-agent coordinated wellness plan"
            )
            
            print(f"Generated coordinated deliverable: {deliverable.description}")
            job.deliver(deliverable)
            
        elif job.phase == ACPJobPhase.COMPLETED:
            print("Job completed", job)
        elif job.phase == ACPJobPhase.REJECTED:
            print("Job rejected", job)
    
    def run(self):
        """Start the enhanced seller"""
        print("🤖 Enhanced Wellness Seller with Multi-Agent Coordination")
        print("=" * 60)
        if self.coordinator:
            print("✅ OpenRouter LLM coordination enabled")
        else:
            print("⚠️  Using rule-based fallback (no OpenRouter API key)")
        print("Waiting for new tasks...")
        print("Press Ctrl+C to stop")
        
        try:
            threading.Event().wait()
        except KeyboardInterrupt:
            print("\nStopping enhanced seller...")

if __name__ == "__main__":
    seller = EnhancedWellnessSeller()
    seller.run()
