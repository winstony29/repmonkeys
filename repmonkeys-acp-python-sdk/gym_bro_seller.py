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

class GymBroSeller:
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
            agent_wallet_address=self.env.GYMBRO_WALLET_ADDRESS,
            on_new_task=self._on_new_task,
            entity_id=self.env.GYMBRO_ENTITY_ID,
            config=config
        )
    
    def _safe_append_job(self, job, memo_to_sign: Optional[ACPMemo] = None):
        if self.use_thread_lock:
            print(f"[GymBro] Acquiring lock to append job {job.id}")
            with self.job_queue_lock:
                print(f"[GymBro] Lock acquired, appending job {job.id} to queue")
                self.job_queue.append((job, memo_to_sign))
        else:
            self.job_queue.append((job, memo_to_sign))
    
    def _safe_pop_job(self):
        if self.use_thread_lock:
            print(f"[GymBro] Acquiring lock to pop job")
            with self.job_queue_lock:
                if self.job_queue:
                    job, memo_to_sign = self.job_queue.popleft()
                    print(f"[GymBro] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[GymBro] Queue is empty after acquiring lock")
        else:
            if self.job_queue:
                job, memo_to_sign = self.job_queue.popleft()
                print(f"[GymBro] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[GymBro] Queue is empty (no lock)")
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
        print(f"[GymBro] Received job {job.id} (phase: {job.phase})")
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
    
    def _create_fitness_plan(self, service_requirements: dict) -> dict:
        """Create a comprehensive fitness plan based on requirements"""
        
        # Analyze requirements for fitness needs
        requirements_text = json.dumps(service_requirements).lower()
        
        fitness_plan = {
            "fitness_assessment": {
                "goals": [],
                "current_fitness_level": "beginner",
                "available_equipment": ["bodyweight", "minimal"],
                "time_availability": "1 hour daily",
                "preferences": []
            },
            "workout_program": {
                "frequency": "3-4 times per week",
                "duration": "45-60 minutes per session",
                "split": "Full body workouts",
                "progression": "Progressive overload"
            },
            "exercise_selection": {
                "strength_training": {
                    "compound_movements": ["squats", "push-ups", "lunges", "planks"],
                    "isolation_exercises": ["bicep curls", "tricep dips", "calf raises"],
                    "equipment_needed": ["resistance bands", "dumbbells (optional)"]
                },
                "cardio_training": {
                    "low_intensity": ["walking", "cycling", "swimming"],
                    "high_intensity": ["HIIT", "sprint intervals", "jump rope"],
                    "frequency": "2-3 times per week"
                },
                "flexibility_mobility": {
                    "dynamic_stretching": ["arm circles", "leg swings", "hip circles"],
                    "static_stretching": ["hamstring stretch", "quad stretch", "chest stretch"],
                    "frequency": "Daily, 5-10 minutes"
                }
            },
            "training_phases": {
                "phase_1_weeks_1_4": {
                    "focus": "Building foundation and proper form",
                    "workouts": "Full body, 3 times per week",
                    "intensity": "60-70% effort",
                    "progression": "Increase reps before weight"
                },
                "phase_2_weeks_5_8": {
                    "focus": "Increasing strength and endurance",
                    "workouts": "Full body, 4 times per week",
                    "intensity": "70-80% effort",
                    "progression": "Add weight/resistance"
                },
                "phase_3_weeks_9_12": {
                    "focus": "Advanced training and specialization",
                    "workouts": "Split routine, 4-5 times per week",
                    "intensity": "80-90% effort",
                    "progression": "Periodization"
                }
            },
            "recovery_plan": {
                "rest_days": "2-3 days per week",
                "active_recovery": ["light walking", "yoga", "stretching"],
                "sleep_optimization": "7-9 hours per night",
                "nutrition_timing": "Protein within 30 minutes post-workout"
            },
            "safety_guidelines": {
                "warm_up": "5-10 minutes of light cardio and dynamic stretching",
                "cool_down": "5-10 minutes of static stretching",
                "form_priority": "Always prioritize proper form over weight",
                "listen_to_body": "Stop if experiencing pain or discomfort"
            },
            "success_metrics": {
                "strength_gains": "Track progressive overload in main lifts",
                "endurance": "Monitor cardio performance improvements",
                "body_composition": "Weekly measurements and progress photos",
                "energy_levels": "Track daily energy and mood improvements"
            }
        }
        
        # Customize based on specific requirements
        if 'muscle building' in requirements_text:
            fitness_plan["fitness_assessment"]["goals"].append("Muscle building")
            fitness_plan["workout_program"]["split"] = "Push/Pull/Legs"
            fitness_plan["exercise_selection"]["strength_training"]["compound_movements"].extend(["deadlifts", "bench press", "overhead press"])
            fitness_plan["training_phases"]["phase_1_weeks_1_4"]["focus"] = "Building muscle foundation"
        
        if 'weight loss' in requirements_text:
            fitness_plan["fitness_assessment"]["goals"].append("Weight loss")
            fitness_plan["workout_program"]["frequency"] = "4-5 times per week"
            fitness_plan["exercise_selection"]["cardio_training"]["frequency"] = "3-4 times per week"
            fitness_plan["training_phases"]["phase_1_weeks_1_4"]["focus"] = "Fat burning foundation"
        
        if 'beginner' in requirements_text:
            fitness_plan["fitness_assessment"]["current_fitness_level"] = "beginner"
            fitness_plan["workout_program"]["frequency"] = "3 times per week"
            fitness_plan["exercise_selection"]["strength_training"]["compound_movements"] = ["bodyweight squats", "wall push-ups", "assisted lunges"]
        
        if 'advanced' in requirements_text:
            fitness_plan["fitness_assessment"]["current_fitness_level"] = "advanced"
            fitness_plan["workout_program"]["frequency"] = "5-6 times per week"
            fitness_plan["exercise_selection"]["strength_training"]["compound_movements"].extend(["weighted squats", "pull-ups", "dips"])
        
        if 'home' in requirements_text:
            fitness_plan["fitness_assessment"]["available_equipment"] = ["bodyweight", "resistance bands", "dumbbells"]
            fitness_plan["exercise_selection"]["strength_training"]["equipment_needed"] = ["resistance bands", "dumbbells", "pull-up bar"]
        
        return fitness_plan
    
    def _process_job(self, job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            print(f"[GymBro] Accepting job {job.id}")
            job.respond(True)
            
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"[GymBro] Creating fitness plan for job {job.id}")
            
            # Extract service requirements
            service_requirements = self._extract_service_requirements(job)
            
            # Create fitness plan
            fitness_plan = self._create_fitness_plan(service_requirements)
            
            # Create deliverable
            deliverable = IDeliverable(
                type="json",
                value=fitness_plan,
                description="Comprehensive fitness plan from GymBro"
            )
            
            print(f"[GymBro] Generated fitness plan: {deliverable.description}")
            job.deliver(deliverable)
            
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[GymBro] Job completed: {job.id}")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[GymBro] Job rejected: {job.id}")
    
    def run(self):
        """Start the GymBro seller"""
        print("💪 GymBro - Fitness Specialist")
        print("=" * 50)
        print("Specialties: Fitness, workout planning, strength training")
        print("Capabilities: Exercise programming, form guidance, progressive overload")
        print("Waiting for fitness consultation requests...")
        print("Press Ctrl+C to stop")
        
        try:
            threading.Event().wait()
        except KeyboardInterrupt:
            print("\nStopping GymBro...")

if __name__ == "__main__":
    seller = GymBroSeller()
    seller.run()
