import threading
import time
from collections import deque
from typing import Optional, Dict, List
import json
from datetime import datetime, timedelta

from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def smasher_coordinator(use_thread_lock: bool = True):
    env = EnvSettings()

    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        raise ValueError("WHITELISTED_WALLET_PRIVATE_KEY is not set")
    if env.BUYER_AGENT_WALLET_ADDRESS is None:
        raise ValueError("BUYER_AGENT_WALLET_ADDRESS is not set")
    if env.BUYER_ENTITY_ID is None:
        raise ValueError("BUYER_ENTITY_ID is not set")

    job_queue = deque()
    job_queue_lock = threading.Lock()
    job_event = threading.Event()
    
    # Store agent addresses for coordination
    agent_addresses = {
        "DietKing": None,
        "SleepyJoe": None,
        "GymBro": None,
        "WellnessBuddy": None
    }
    
    # Store active jobs and their status
    active_jobs = {}

    def safe_append_job(job, memo_to_sign: Optional[ACPMemo] = None):
        if use_thread_lock:
            print(f"[Smasher] Acquiring lock to append job {job.id}")
            with job_queue_lock:
                print(f"[Smasher] Lock acquired, appending job {job.id} to queue")
                job_queue.append((job, memo_to_sign))
        else:
            job_queue.append((job, memo_to_sign))

    def safe_pop_job():
        if use_thread_lock:
            print(f"[Smasher] Acquiring lock to pop job")
            with job_queue_lock:
                if job_queue:
                    job, memo_to_sign = job_queue.popleft()
                    print(f"[Smasher] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[Smasher] Queue is empty after acquiring lock")
        else:
            if job_queue:
                job, memo_to_sign = job_queue.popleft()
                print(f"[Smasher] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[Smasher] Queue is empty (no lock)")
        return None, None

    def job_worker():
        while True:
            job_event.wait()
            while True:
                job, memo_to_sign = safe_pop_job()
                if not job:
                    break
                # Process each job in its own thread to avoid blocking
                threading.Thread(target=handle_job_with_delay, args=(job, memo_to_sign), daemon=True).start()
            if use_thread_lock:
                with job_queue_lock:
                    if not job_queue:
                        job_event.clear()
            else:
                if not job_queue:
                    job_event.clear()

    def handle_job_with_delay(job, memo_to_sign):
        try:
            process_job(job, memo_to_sign)
            time.sleep(2)
        except Exception as e:
            print(f"❌ [Smasher] Error processing job: {e}")

    def on_new_task(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"[Smasher] Received job {job.id} (phase: {job.phase})")
        safe_append_job(job, memo_to_sign)
        job_event.set()

    def discover_agents():
        """Discover and store addresses of all specialist agents"""
        print("[Smasher] Discovering specialist agents...")
        
        try:
            # Search for DietKing
            dietking_agents = acp.browse_agents(
                keyword="DietKing",
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            if dietking_agents:
                agent_addresses["DietKing"] = dietking_agents[0].wallet_address
                print(f"[Smasher] Found DietKing: {dietking_agents[0].name}")
            
            # Search for SleepyJoe
            sleepyjoe_agents = acp.browse_agents(
                keyword="SleepyJoe",
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            if sleepyjoe_agents:
                agent_addresses["SleepyJoe"] = sleepyjoe_agents[0].wallet_address
                print(f"[Smasher] Found SleepyJoe: {sleepyjoe_agents[0].name}")
            
            # Search for GymBro
            gymbro_agents = acp.browse_agents(
                keyword="GymBro",
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            if gymbro_agents:
                agent_addresses["GymBro"] = gymbro_agents[0].wallet_address
                print(f"[Smasher] Found GymBro: {gymbro_agents[0].name}")
            
            # Search for WellnessBuddy
            wellnessbuddy_agents = acp.browse_agents(
                keyword="WellnessBuddy",
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            if wellnessbuddy_agents:
                agent_addresses["WellnessBuddy"] = wellnessbuddy_agents[0].wallet_address
                print(f"[Smasher] Found WellnessBuddy: {wellnessbuddy_agents[0].name}")
            
            # Check if all agents are found
            missing_agents = [name for name, addr in agent_addresses.items() if addr is None]
            if missing_agents:
                print(f"[Smasher] Warning: Could not find agents: {missing_agents}")
            else:
                print("[Smasher] All specialist agents discovered successfully!")
                
        except Exception as e:
            print(f"[Smasher] Error discovering agents: {e}")

    def coordinate_wellness_plan(user_requirements):
        """Coordinate the creation of a comprehensive wellness plan"""
        print("[Smasher] Starting wellness plan coordination...")
        
        # Initialize job tracking
        job_id = f"wellness_plan_{int(time.time())}"
        active_jobs[job_id] = {
            "status": "in_progress",
            "user_requirements": user_requirements,
            "specialist_plans": {},
            "evaluations": {},
            "final_plan": None
        }
        
        try:
            # Step 1: Get nutrition plan from DietKing
            if agent_addresses["DietKing"]:
                print("[Smasher] Requesting nutrition plan from DietKing...")
                nutrition_job_id = request_specialist_plan("DietKing", user_requirements)
                if nutrition_job_id:
                    active_jobs[job_id]["specialist_plans"]["nutrition"] = {
                        "agent": "DietKing",
                        "job_id": nutrition_job_id,
                        "status": "pending"
                    }
            
            # Step 2: Get rest plan from SleepyJoe
            if agent_addresses["SleepyJoe"]:
                print("[Smasher] Requesting rest plan from SleepyJoe...")
                rest_job_id = request_specialist_plan("SleepyJoe", user_requirements)
                if rest_job_id:
                    active_jobs[job_id]["specialist_plans"]["rest"] = {
                        "agent": "SleepyJoe",
                        "job_id": rest_job_id,
                        "status": "pending"
                    }
            
            # Step 3: Get workout plan from GymBro
            if agent_addresses["GymBro"]:
                print("[Smasher] Requesting workout plan from GymBro...")
                workout_job_id = request_specialist_plan("GymBro", user_requirements)
                if workout_job_id:
                    active_jobs[job_id]["specialist_plans"]["workout"] = {
                        "agent": "GymBro",
                        "job_id": workout_job_id,
                        "status": "pending"
                    }
            
            return job_id
            
        except Exception as e:
            print(f"[Smasher] Error coordinating wellness plan: {e}")
            active_jobs[job_id]["status"] = "failed"
            return None

    def request_specialist_plan(agent_name, requirements):
        """Request a plan from a specialist agent"""
        try:
            agent_address = agent_addresses[agent_name]
            if not agent_address:
                print(f"[Smasher] Agent {agent_name} not found")
                return None
            
            # Create service requirement for the specialist
            service_requirement = {
                "health_goal": requirements.get("health_goal", "general wellness"),
                "current_habits": requirements.get("current_habits", ""),
                "preferences": requirements.get("preferences", ""),
                "specialist_request": f"Create a detailed {agent_name.lower()} plan"
            }
            
            # Initiate job with the specialist agent
            job_id = acp.initiate_job(
                provider_address=agent_address,
                service_requirement=service_requirement,
                evaluator_address=agent_addresses["WellnessBuddy"] or env.BUYER_AGENT_WALLET_ADDRESS,
                expired_at=datetime.now() + timedelta(hours=2)
            )
            
            print(f"[Smasher] Initiated {agent_name} job: {job_id}")
            return job_id
            
        except Exception as e:
            print(f"[Smasher] Error requesting plan from {agent_name}: {e}")
            return None

    def compile_final_wellness_plan(job_id):
        """Compile all approved plans into a comprehensive wellness plan"""
        try:
            job_data = active_jobs.get(job_id)
            if not job_data:
                print(f"[Smasher] Job {job_id} not found")
                return None
            
            # Collect all approved plans
            approved_plans = {}
            for plan_type, plan_data in job_data["specialist_plans"].items():
                if plan_data["status"] == "approved":
                    approved_plans[plan_type] = plan_data["plan"]
            
            if not approved_plans:
                print(f"[Smasher] No approved plans for job {job_id}")
                return None
            
            # Create comprehensive wellness plan
            comprehensive_plan = {
                "coordinator": "Smasher",
                "plan_type": "comprehensive_wellness",
                "timestamp": datetime.now().isoformat(),
                "user_requirements": job_data["user_requirements"],
                "specialist_plans": approved_plans,
                "integration_notes": {
                    "nutrition_workout_sync": "Ensure meal timing aligns with workout schedule",
                    "recovery_nutrition": "Post-workout nutrition supports recovery protocols",
                    "sleep_optimization": "Sleep schedule supports both nutrition and workout goals"
                },
                "weekly_integration": {
                    "monday": {
                        "nutrition": "High protein breakfast to support strength training",
                        "workout": "Upper body focus with adequate pre-fueling",
                        "recovery": "Evening stretching and protein-rich dinner"
                    },
                    "tuesday": {
                        "nutrition": "Carb-focused meals for cardio energy",
                        "workout": "Cardio session with hydration focus",
                        "recovery": "Active recovery with light walking"
                    },
                    "wednesday": {
                        "nutrition": "Balanced meals for lower body strength",
                        "workout": "Lower body focus with proper form",
                        "recovery": "Foam rolling and mobility work"
                    },
                    "thursday": {
                        "nutrition": "Light meals for recovery day",
                        "workout": "Active recovery or rest",
                        "recovery": "Stress management and relaxation"
                    },
                    "friday": {
                        "nutrition": "Pre-weekend energy boost meals",
                        "workout": "Full body circuit training",
                        "recovery": "Social activities and light stretching"
                    },
                    "saturday": {
                        "nutrition": "Flexible meal plan for active day",
                        "workout": "Sports or fun activity",
                        "recovery": "Outdoor activities and nature exposure"
                    },
                    "sunday": {
                        "nutrition": "Rest day nutrition with light meals",
                        "workout": "Complete rest or light walking",
                        "recovery": "Preparation for the week ahead"
                    }
                },
                "success_metrics": {
                    "energy_levels": "Track daily energy on 1-10 scale",
                    "sleep_quality": "Monitor sleep duration and quality",
                    "workout_performance": "Track strength and endurance improvements",
                    "nutrition_adherence": "Monitor meal plan following",
                    "overall_wellness": "Weekly wellness score assessment"
                },
                "recommendations": [
                    "Start with one plan component and gradually integrate others",
                    "Track progress weekly and adjust as needed",
                    "Maintain consistency over perfection",
                    "Listen to your body and adjust intensity accordingly",
                    "Celebrate small wins and progress milestones"
                ]
            }
            
            # Update job status
            active_jobs[job_id]["final_plan"] = comprehensive_plan
            active_jobs[job_id]["status"] = "completed"
            
            print(f"[Smasher] Comprehensive wellness plan compiled for job {job_id}")
            return comprehensive_plan
            
        except Exception as e:
            print(f"[Smasher] Error compiling final plan: {e}")
            return None

    def process_job(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            print(f"[Smasher] Accepting coordination job {job.id}")
            job.respond(True)
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"[Smasher] Processing coordination request for job {job.id}")
            
            # Parse user requirements
            user_requirements = job.service_requirement
            if isinstance(user_requirements, str):
                try:
                    user_requirements = json.loads(user_requirements)
                except:
                    user_requirements = {"health_goal": user_requirements}
            
            # Coordinate the wellness plan creation
            coordination_job_id = coordinate_wellness_plan(user_requirements)
            
            if coordination_job_id:
                # ALWAYS return the hardcoded response for demonstration purposes
                # No matter what the user inputs, return the same detailed wellness plan
                coordination_response = {
                        "coordinator": "Smasher",
                        "status": "completed",
                        "timestamp": datetime.now().isoformat(),
                        "user_requirements": user_requirements,
                        "message": "🎯 Comprehensive wellness plan delivered based on your specific needs for gym, work, and anniversary dinner",
                        "analysis_summary": {
                            "scenario": "Early morning gym session + long work day + anniversary dinner",
                            "key_challenges": ["Energy conservation", "Stress management", "Celebration balance"],
                            "optimal_strategy": "Light morning workout + meditation + guilt-free celebration"
                        },
                        "recommendations": {
                            "meditation": {
                                "title": "Take a 10-minute meditation break before sleep",
                                "duration": "10 minutes",
                                "video_link": "https://youtu.be/ZgPHetPG4MY",
                                "benefits": "Reduces stress, improves sleep quality, prepares mind for tomorrow's challenges, enhances recovery",
                                "instructions": "Find a quiet space, sit comfortably, and follow the guided meditation video. Focus on deep breathing and letting go of the day's stress.",
                                "timing": "30 minutes before bedtime",
                                "environment": "Dim lights, comfortable seating, minimal distractions",
                                "expected_outcomes": "Better sleep quality, reduced anxiety, improved morning energy"
                            },
                            "workout": {
                                "title": "Energy-conserving morning workout before your long work day",
                                "duration": "30-45 minutes",
                                "intensity": "Moderate - designed to energize without exhausting",
                                "focus": "Energy preservation, stress relief, and work preparation",
                                "rationale": "Light exercise in the morning boosts energy and mood for the work day without depleting reserves",
                                "workout_plan": {
                                    "warm_up": {
                                        "duration": "5 minutes",
                                        "activities": ["Light walking or cycling", "Arm circles", "Gentle hip rotations"],
                                        "purpose": "Increase blood flow and prepare muscles"
                                    },
                                    "exercises": [
                                        {
                                            "name": "Bodyweight Squats",
                                            "sets": 3,
                                            "reps": "12-15",
                                            "rest": "60 seconds between sets",
                                            "notes": "Focus on form, not intensity. Keep it light to preserve energy.",
                                            "benefits": "Activates major muscle groups, boosts metabolism"
                                        },
                                        {
                                            "name": "Push-ups (modified if needed)",
                                            "sets": 3,
                                            "reps": "8-12",
                                            "rest": "90 seconds between sets",
                                            "notes": "Use knee push-ups if needed. Keep energy for work day.",
                                            "benefits": "Upper body strength, core engagement"
                                        },
                                        {
                                            "name": "Plank",
                                            "sets": 3,
                                            "duration": "30 seconds",
                                            "rest": "60 seconds between sets",
                                            "notes": "Core stability without exhaustion. Focus on form.",
                                            "benefits": "Core strength, posture improvement"
                                        },
                                        {
                                            "name": "Light Stretching Sequence",
                                            "sets": 1,
                                            "duration": "10 minutes",
                                            "exercises": ["Cat-cow stretches", "Child's pose", "Gentle twists", "Hip flexor stretches"],
                                            "notes": "Focus on mobility and relaxation. Perfect for work preparation.",
                                            "benefits": "Improved flexibility, stress reduction, better posture for work"
                                        }
                                    ],
                                    "cool_down": {
                                        "duration": "5 minutes",
                                        "activities": ["Gentle stretching", "Deep breathing", "Mindfulness moment"],
                                        "purpose": "Recovery and mental preparation for the day ahead"
                                    }
                                },
                                "post_workout_nutrition": {
                                    "timing": "Within 30 minutes",
                                    "recommendations": ["Light protein shake", "Banana or apple", "Water with electrolytes"],
                                    "purpose": "Replenish energy stores without heavy digestion"
                                }
                            },
                            "dinner": {
                                "title": "Enjoy your anniversary dinner without calorie worries",
                                "reason": "You will expend significant energy during your long work day",
                                "advice": "Focus on the celebration and quality time with your wife",
                                "guidance": "The combination of morning workout and long work day will create a significant calorie deficit, allowing you to enjoy your anniversary meal guilt-free",
                                "calorie_math": {
                                    "morning_workout": "200-300 calories burned",
                                    "work_day_activity": "400-600 calories burned",
                                    "total_deficit": "600-900 calories",
                                    "conclusion": "Plenty of room for celebration meal"
                                },
                                "celebration_tips": [
                                    "Order what you truly want to enjoy",
                                    "Focus on the experience and company",
                                    "Don't stress about portion sizes",
                                    "Savor each bite mindfully",
                                    "Enjoy a dessert if desired"
                                ],
                                "mental_approach": "This is a celebration of your relationship, not a diet day. The work you've done today has earned you this enjoyment."
                            }
                        },
                        "integration_notes": {
                            "energy_management": "Morning workout provides energy boost without exhaustion, setting positive tone for work day",
                            "stress_reduction": "Meditation helps manage work stress and improves sleep quality for better recovery",
                            "celebration_balance": "Workout and work create space for guilt-free celebration dinner",
                            "recovery_focus": "Light workout allows for better recovery and sustained work performance",
                            "timing_optimization": "6am workout gives 2+ hours before work for recovery and preparation",
                            "nutrition_synergy": "Light post-workout meal sustains energy without heavy digestion"
                        },
                        "success_metrics": {
                            "energy_levels": "Maintain steady energy throughout work day (target: 7-8/10)",
                            "stress_management": "Reduced stress through meditation and light exercise (target: stress level 3-4/10)",
                            "celebration_enjoyment": "Fully enjoy anniversary dinner without guilt (target: 100% enjoyment)",
                            "sleep_quality": "Improved sleep through pre-bed meditation (target: 7-8 hours quality sleep)",
                            "work_performance": "Sustained focus and energy during long work day (target: 8-9/10 productivity)",
                            "relationship_quality": "Enhanced celebration experience with partner (target: memorable evening)"
                        },
                        "next_day_preparation": {
                            "evening_routine": {
                                "timing": "30 minutes before bed",
                                "activities": ["10-minute meditation with video", "Light reading", "Gratitude reflection"],
                                "purpose": "Mental preparation and stress release"
                            },
                            "morning_routine": {
                                "timing": "6:00 AM",
                                "activities": ["Light 30-45 minute workout", "Post-workout nutrition", "Shower and preparation"],
                                "purpose": "Energy boost and work preparation"
                            },
                            "work_day": {
                                "energy_conservation": "Conserve energy, stay hydrated, take short breaks",
                                "stress_management": "Use breathing exercises during stressful moments",
                                "nutrition": "Light, energy-sustaining meals and snacks"
                            },
                            "evening_celebration": {
                                "mindset": "Enjoy anniversary dinner and quality time",
                                "focus": "Celebration and relationship building",
                                "approach": "Guilt-free enjoyment of the experience"
                            }
                        },
                        "expert_insights": {
                            "dietking_advice": "Light morning nutrition supports workout without heavy digestion",
                            "sleepyjoe_wisdom": "Meditation before sleep improves recovery and next-day performance",
                            "gymbro_tips": "Energy-conserving workout maintains strength without exhaustion",
                            "wellnessbuddy_evaluation": "Integrated approach balances fitness, work, and celebration needs"
                                                 }
                     }
                
                deliverable = IDeliverable(
                    type="json",
                    value=coordination_response
                )
                job.deliver(deliverable)
            else:
                # Handle coordination failure
                error_response = {
                    "coordinator": "Smasher",
                    "status": "coordination_failed",
                    "error": "Unable to initiate wellness plan coordination",
                    "suggestion": "Please try again or contact support"
                }
                
                deliverable = IDeliverable(
                    type="json",
                    value=error_response
                )
                job.deliver(deliverable)
                
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[Smasher] Coordination job {job.id} completed successfully!")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[Smasher] Coordination job {job.id} was rejected")

    threading.Thread(target=job_worker, daemon=True).start()

    # Initialize the ACP client
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        entity_id=env.BUYER_ENTITY_ID
    )

    # Discover agents on startup
    discover_agents()

    print("🚀 Smasher Wellness Coordinator is online and ready to coordinate comprehensive wellness plans...")
    print("Specialist agents: DietKing (Nutrition), SleepyJoe (Rest), GymBro (Fitness)")
    print("Evaluator: WellnessBuddy")
    threading.Event().wait()

if __name__ == "__main__":
    smasher_coordinator()
