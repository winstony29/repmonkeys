import threading
import time
import json
import os
from collections import deque
from typing import Optional
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

class DietKingSeller:
    def __init__(self, use_thread_lock: bool = True):
        self.env = EnvSettings()
        self.use_thread_lock = use_thread_lock
        
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
            agent_wallet_address=self.env.DIETKING_WALLET_ADDRESS,
            on_new_task=self._on_new_task,
            entity_id=self.env.DIETKING_ENTITY_ID,
            config=config
        )
    
    def _safe_append_job(self, job, memo_to_sign: Optional[ACPMemo] = None):
        if self.use_thread_lock:
            print(f"[DietKing] Acquiring lock to append job {job.id}")
            with self.job_queue_lock:
                print(f"[DietKing] Lock acquired, appending job {job.id} to queue")
                self.job_queue.append((job, memo_to_sign))
        else:
            self.job_queue.append((job, memo_to_sign))
    
    def _safe_pop_job(self):
        if self.use_thread_lock:
            print(f"[DietKing] Acquiring lock to pop job")
            with self.job_queue_lock:
                if self.job_queue:
                    job, memo_to_sign = self.job_queue.popleft()
                    print(f"[DietKing] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[DietKing] Queue is empty after acquiring lock")
        else:
            if self.job_queue:
                job, memo_to_sign = self.job_queue.popleft()
                print(f"[DietKing] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[DietKing] Queue is empty (no lock)")
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
        print(f"[DietKing] Received job {job.id} (phase: {job.phase})")
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
    
    def _create_nutrition_plan(self, service_requirements: dict) -> dict:
        """Create a comprehensive nutrition plan based on requirements"""
        
        # Analyze requirements for nutrition needs
        requirements_text = json.dumps(service_requirements).lower()
        
        nutrition_plan = {
            "nutrition_assessment": {
                "dietary_goals": [],
                "current_habits": [],
                "preferences": [],
                "constraints": []
            },
            "meal_planning": {
                "daily_calories": 2000,  # Default, should be calculated
                "macronutrient_breakdown": {
                    "protein": "25%",
                    "carbohydrates": "45%", 
                    "fats": "30%"
                },
                "meal_frequency": "3 main meals + 2 snacks"
            },
            "food_recommendations": {
                "protein_sources": ["lean meats", "fish", "eggs", "legumes", "dairy"],
                "carbohydrate_sources": ["whole grains", "fruits", "vegetables", "quinoa"],
                "healthy_fats": ["avocados", "nuts", "olive oil", "seeds"],
                "foods_to_limit": ["processed foods", "added sugars", "excessive salt"]
            },
            "hydration_plan": {
                "daily_water_intake": "8-10 glasses",
                "hydration_timing": "Throughout the day, more during exercise"
            },
            "supplementation": {
                "recommended": ["multivitamin", "omega-3"],
                "conditional": ["vitamin D", "protein powder"],
                "consult_healthcare": "Before starting any supplements"
            },
            "implementation_strategy": {
                "week_1": "Start with basic meal planning and grocery shopping",
                "week_2": "Implement meal prep routine",
                "week_3": "Adjust portion sizes and timing",
                "week_4": "Optimize based on progress and feedback"
            },
            "success_metrics": {
                "energy_levels": "Track daily energy throughout the day",
                "weight_management": "Weekly weigh-ins and body measurements",
                "digestive_health": "Monitor digestion and comfort",
                "adherence": "Track meal plan compliance"
            }
        }
        
        # Customize based on specific requirements
        if 'weight loss' in requirements_text:
            nutrition_plan["meal_planning"]["daily_calories"] = 1800
            nutrition_plan["nutrition_assessment"]["dietary_goals"].append("Weight loss")
            nutrition_plan["food_recommendations"]["foods_to_limit"].extend(["high-calorie snacks", "sugary beverages"])
        
        if 'muscle building' in requirements_text:
            nutrition_plan["meal_planning"]["macronutrient_breakdown"]["protein"] = "30%"
            nutrition_plan["nutrition_assessment"]["dietary_goals"].append("Muscle building")
            nutrition_plan["supplementation"]["conditional"].append("creatine")
        
        if 'vegetarian' in requirements_text:
            nutrition_plan["food_recommendations"]["protein_sources"] = ["legumes", "quinoa", "tofu", "tempeh", "Greek yogurt", "eggs"]
            nutrition_plan["supplementation"]["recommended"].append("vitamin B12")
        
        if 'budget' in requirements_text:
            nutrition_plan["food_recommendations"]["budget_tips"] = [
                "Buy in bulk", "Seasonal produce", "Frozen vegetables", "Generic brands"
            ]
        
        return nutrition_plan
    
    def _process_job(self, job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            print(f"[DietKing] Accepting job {job.id}")
            job.respond(True)
            
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"[DietKing] Creating nutrition plan for job {job.id}")
            
            # Extract service requirements
            service_requirements = self._extract_service_requirements(job)
            
            # Create nutrition plan
            nutrition_plan = self._create_nutrition_plan(service_requirements)
            
            # Create deliverable
            deliverable = IDeliverable(
                type="json",
                value=nutrition_plan,
                description="Comprehensive nutrition plan from DietKing"
            )
            
            print(f"[DietKing] Generated nutrition plan: {deliverable.description}")
            job.deliver(deliverable)
            
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[DietKing] Job completed: {job.id}")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[DietKing] Job rejected: {job.id}")
    
    def run(self):
        """Start the DietKing seller"""
        print("🥗 DietKing - Nutrition Specialist")
        print("=" * 50)
        print("Specialties: Nutrition, meal planning, diet optimization")
        print("Capabilities: Calorie calculation, macro tracking, dietary restrictions")
        print("Waiting for nutrition consultation requests...")
        print("Press Ctrl+C to stop")
        
        try:
            threading.Event().wait()
        except KeyboardInterrupt:
            print("\nStopping DietKing...")

if __name__ == "__main__":
    seller = DietKingSeller()
    seller.run()
