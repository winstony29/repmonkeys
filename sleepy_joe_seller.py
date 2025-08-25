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

class SleepyJoeSeller:
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
            agent_wallet_address=self.env.SLEEPYJOE_WALLET_ADDRESS,
            on_new_task=self._on_new_task,
            entity_id=self.env.SLEEPYJOE_ENTITY_ID,
            config=config
        )
    
    def _safe_append_job(self, job, memo_to_sign: Optional[ACPMemo] = None):
        if self.use_thread_lock:
            print(f"[SleepyJoe] Acquiring lock to append job {job.id}")
            with self.job_queue_lock:
                print(f"[SleepyJoe] Lock acquired, appending job {job.id} to queue")
                self.job_queue.append((job, memo_to_sign))
        else:
            self.job_queue.append((job, memo_to_sign))
    
    def _safe_pop_job(self):
        if self.use_thread_lock:
            print(f"[SleepyJoe] Acquiring lock to pop job")
            with self.job_queue_lock:
                if self.job_queue:
                    job, memo_to_sign = self.job_queue.popleft()
                    print(f"[SleepyJoe] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[SleepyJoe] Queue is empty after acquiring lock")
        else:
            if self.job_queue:
                job, memo_to_sign = self.job_queue.popleft()
                print(f"[SleepyJoe] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[SleepyJoe] Queue is empty (no lock)")
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
        print(f"[SleepyJoe] Received job {job.id} (phase: {job.phase})")
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
    
    def _create_sleep_plan(self, service_requirements: dict) -> dict:
        """Create a comprehensive sleep optimization plan based on requirements"""
        
        # Analyze requirements for sleep needs
        requirements_text = json.dumps(service_requirements).lower()
        
        sleep_plan = {
            "sleep_assessment": {
                "current_sleep_patterns": {
                    "bedtime": "10:00 PM",
                    "wake_time": "6:00 AM",
                    "sleep_duration": "8 hours",
                    "sleep_quality": "moderate"
                },
                "sleep_issues": [],
                "lifestyle_factors": [],
                "environmental_factors": []
            },
            "sleep_hygiene_optimization": {
                "bedtime_routine": {
                    "pre_sleep_activities": [
                        "Reading (30 minutes)",
                        "Light stretching",
                        "Warm bath or shower",
                        "Meditation or deep breathing"
                    ],
                    "avoid_before_bed": [
                        "Screens (1 hour before)",
                        "Caffeine (6 hours before)",
                        "Heavy meals (3 hours before)",
                        "Intense exercise (3 hours before)"
                    ]
                },
                "sleep_schedule": {
                    "consistent_bedtime": "10:00 PM ± 30 minutes",
                    "consistent_wake_time": "6:00 AM ± 30 minutes",
                    "weekend_consistency": "Maintain schedule within 1 hour"
                }
            },
            "sleep_environment_optimization": {
                "bedroom_setup": {
                    "temperature": "65-68°F (18-20°C)",
                    "lighting": "Dark room, blackout curtains",
                    "noise": "White noise machine or earplugs",
                    "bedding": "Comfortable mattress and pillows"
                },
                "technology_management": {
                    "blue_light_filter": "Enable on all devices",
                    "screen_time": "Limit 1 hour before bed",
                    "phone_location": "Outside bedroom or silent mode"
                }
            },
            "circadian_rhythm_optimization": {
                "morning_routine": {
                    "sunlight_exposure": "15-30 minutes within 1 hour of waking",
                    "breakfast_timing": "Within 1 hour of waking",
                    "exercise_timing": "Morning or early afternoon"
                },
                "daytime_optimization": {
                    "light_exposure": "Natural light during day",
                    "meal_timing": "Regular meal times",
                    "activity_level": "Moderate physical activity"
                }
            },
            "stress_management_for_sleep": {
                "relaxation_techniques": [
                    "Progressive muscle relaxation",
                    "4-7-8 breathing technique",
                    "Mindfulness meditation",
                    "Guided imagery"
                ],
                "stress_reduction": {
                    "daily_practices": "15-20 minutes of relaxation",
                    "worry_time": "Designated time earlier in day",
                    "gratitude_practice": "Evening reflection"
                }
            },
            "nutrition_for_sleep": {
                "sleep_friendly_foods": [
                    "Cherries (natural melatonin)",
                    "Bananas (magnesium and potassium)",
                    "Almonds (magnesium)",
                    "Chamomile tea",
                    "Warm milk"
                ],
                "timing": {
                    "last_meal": "3 hours before bedtime",
                    "hydration": "Reduce fluids 2 hours before bed",
                    "caffeine_cutoff": "6 hours before bedtime"
                }
            },
            "implementation_phases": {
                "week_1": {
                    "focus": "Establish consistent sleep schedule",
                    "actions": [
                        "Set fixed bedtime and wake time",
                        "Create basic bedtime routine",
                        "Optimize bedroom environment"
                    ]
                },
                "week_2": {
                    "focus": "Enhance sleep hygiene",
                    "actions": [
                        "Implement full bedtime routine",
                        "Manage technology use",
                        "Practice relaxation techniques"
                    ]
                },
                "week_3": {
                    "focus": "Optimize circadian rhythm",
                    "actions": [
                        "Morning sunlight exposure",
                        "Regular meal timing",
                        "Exercise timing optimization"
                    ]
                },
                "week_4": {
                    "focus": "Fine-tune and maintain",
                    "actions": [
                        "Monitor sleep quality",
                        "Adjust routine as needed",
                        "Establish long-term habits"
                    ]
                }
            },
            "success_metrics": {
                "sleep_duration": "Track hours of sleep per night",
                "sleep_quality": "Rate sleep quality 1-10",
                "fall_asleep_time": "Time to fall asleep",
                "wake_up_feeling": "Energy level upon waking",
                "daytime_energy": "Overall energy throughout day"
            },
            "troubleshooting": {
                "common_issues": {
                    "difficulty_falling_asleep": "Practice relaxation techniques, avoid screens",
                    "waking_up_frequently": "Check environment, reduce fluids before bed",
                    "early_morning_waking": "Ensure adequate sleep pressure, check stress levels",
                    "unrefreshing_sleep": "Evaluate sleep environment, consider sleep study"
                }
            }
        }
        
        # Customize based on specific requirements
        if 'insomnia' in requirements_text:
            sleep_plan["sleep_assessment"]["sleep_issues"].append("Insomnia")
            sleep_plan["sleep_hygiene_optimization"]["bedtime_routine"]["pre_sleep_activities"].extend([
                "Cognitive behavioral therapy techniques",
                "Sleep restriction therapy"
            ])
        
        if 'stress' in requirements_text:
            sleep_plan["sleep_assessment"]["lifestyle_factors"].append("High stress")
            sleep_plan["stress_management_for_sleep"]["relaxation_techniques"].extend([
                "Stress journaling",
                "Professional counseling referral"
            ])
        
        if 'shift work' in requirements_text:
            sleep_plan["sleep_assessment"]["lifestyle_factors"].append("Shift work")
            sleep_plan["circadian_rhythm_optimization"]["shift_work_adjustments"] = {
                "gradual_schedule_adjustment": "15-30 minutes per day",
                "light_exposure_management": "Strategic light exposure",
                "meal_timing": "Adapt to work schedule"
            }
        
        if 'noise' in requirements_text:
            sleep_plan["sleep_assessment"]["environmental_factors"].append("Noise pollution")
            sleep_plan["sleep_environment_optimization"]["bedroom_setup"]["noise_solutions"] = [
                "White noise machine",
                "Earplugs",
                "Soundproofing measures",
                "Fan for background noise"
            ]
        
        if 'light' in requirements_text:
            sleep_plan["sleep_assessment"]["environmental_factors"].append("Light pollution")
            sleep_plan["sleep_environment_optimization"]["bedroom_setup"]["light_solutions"] = [
                "Blackout curtains",
                "Eye mask",
                "Light-blocking window film",
                "Smart lighting controls"
            ]
        
        return sleep_plan
    
    def _process_job(self, job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            print(f"[SleepyJoe] Accepting job {job.id}")
            job.respond(True)
            
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"[SleepyJoe] Creating sleep plan for job {job.id}")
            
            # Extract service requirements
            service_requirements = self._extract_service_requirements(job)
            
            # Create sleep plan
            sleep_plan = self._create_sleep_plan(service_requirements)
            
            # Create deliverable
            deliverable = IDeliverable(
                type="json",
                value=sleep_plan,
                description="Comprehensive sleep optimization plan from SleepyJoe"
            )
            
            print(f"[SleepyJoe] Generated sleep plan: {deliverable.description}")
            job.deliver(deliverable)
            
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[SleepyJoe] Job completed: {job.id}")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[SleepyJoe] Job rejected: {job.id}")
    
    def run(self):
        """Start the SleepyJoe seller"""
        print("😴 SleepyJoe - Sleep Specialist")
        print("=" * 50)
        print("Specialties: Sleep optimization, sleep hygiene, circadian rhythm")
        print("Capabilities: Sleep analysis, bedtime routines, sleep environment optimization")
        print("Waiting for sleep consultation requests...")
        print("Press Ctrl+C to stop")
        
        try:
            threading.Event().wait()
        except KeyboardInterrupt:
            print("\nStopping SleepyJoe...")

if __name__ == "__main__":
    seller = SleepyJoeSeller()
    seller.run()
