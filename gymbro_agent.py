import threading
import time
from collections import deque
from typing import Optional
import json

from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def gymbro_agent(use_thread_lock: bool = True):
    env = EnvSettings()

    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        raise ValueError("WHITELISTED_WALLET_PRIVATE_KEY is not set")
    if env.SELLER_AGENT_WALLET_ADDRESS is None:
        raise ValueError("SELLER_AGENT_WALLET_ADDRESS is not set")
    if env.SELLER_ENTITY_ID is None:
        raise ValueError("SELLER_ENTITY_ID is not set")

    job_queue = deque()
    job_queue_lock = threading.Lock()
    job_event = threading.Event()

    def safe_append_job(job, memo_to_sign: Optional[ACPMemo] = None):
        if use_thread_lock:
            print(f"[GymBro] Acquiring lock to append job {job.id}")
            with job_queue_lock:
                print(f"[GymBro] Lock acquired, appending job {job.id} to queue")
                job_queue.append((job, memo_to_sign))
        else:
            job_queue.append((job, memo_to_sign))

    def safe_pop_job():
        if use_thread_lock:
            print(f"[GymBro] Acquiring lock to pop job")
            with job_queue_lock:
                if job_queue:
                    job, memo_to_sign = job_queue.popleft()
                    print(f"[GymBro] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[GymBro] Queue is empty after acquiring lock")
        else:
            if job_queue:
                job, memo_to_sign = job_queue.popleft()
                print(f"[GymBro] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[GymBro] Queue is empty (no lock)")
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
            print(f"❌ [GymBro] Error processing job: {e}")

    def on_new_task(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"[GymBro] Received job {job.id} (phase: {job.phase})")
        safe_append_job(job, memo_to_sign)
        job_event.set()

    def generate_workout_plan(requirements):
        """Generate a detailed workout plan based on user requirements"""
        try:
            # Parse requirements
            if isinstance(requirements, str):
                requirements = json.loads(requirements)
            
            health_goal = requirements.get("health_goal", "general fitness")
            current_habits = requirements.get("current_habits", "")
            preferences = requirements.get("preferences", "")
            
            # Generate personalized workout plan
            workout_plan = {
                "agent_name": "GymBro",
                "service_type": "fitness_training",
                "weekly_schedule": {
                    "monday": {
                        "focus": "Upper Body Strength",
                        "workout": [
                            {
                                "exercise": "Push-ups",
                                "sets": 3,
                                "reps": "10-15",
                                "rest": "60 seconds",
                                "notes": "Full range of motion, controlled descent"
                            },
                            {
                                "exercise": "Pull-ups",
                                "sets": 3,
                                "reps": "5-10",
                                "rest": "90 seconds",
                                "notes": "Assisted if needed, focus on form"
                            },
                            {
                                "exercise": "Dumbbell Rows",
                                "sets": 3,
                                "reps": "12-15 each arm",
                                "rest": "60 seconds",
                                "notes": "Keep back straight, squeeze shoulder blades"
                            },
                            {
                                "exercise": "Overhead Press",
                                "sets": 3,
                                "reps": "8-12",
                                "rest": "90 seconds",
                                "notes": "Full range of motion, engage core"
                            }
                        ],
                        "duration": "45-60 minutes"
                    },
                    "tuesday": {
                        "focus": "Cardio & Core",
                        "workout": [
                            {
                                "exercise": "Running or Cycling",
                                "duration": "20-30 minutes",
                                "intensity": "Moderate",
                                "notes": "Maintain conversation pace"
                            },
                            {
                                "exercise": "Plank",
                                "sets": 3,
                                "duration": "30-60 seconds",
                                "rest": "30 seconds",
                                "notes": "Keep body straight, engage core"
                            },
                            {
                                "exercise": "Russian Twists",
                                "sets": 3,
                                "reps": "20 each side",
                                "rest": "30 seconds",
                                "notes": "Controlled movement, engage obliques"
                            },
                            {
                                "exercise": "Bicycle Crunches",
                                "sets": 3,
                                "reps": "15 each side",
                                "rest": "30 seconds",
                                "notes": "Touch elbow to opposite knee"
                            }
                        ],
                        "duration": "40-50 minutes"
                    },
                    "wednesday": {
                        "focus": "Lower Body Strength",
                        "workout": [
                            {
                                "exercise": "Squats",
                                "sets": 4,
                                "reps": "12-15",
                                "rest": "90 seconds",
                                "notes": "Keep chest up, knees over toes"
                            },
                            {
                                "exercise": "Lunges",
                                "sets": 3,
                                "reps": "10 each leg",
                                "rest": "60 seconds",
                                "notes": "Step forward, lower back knee"
                            },
                            {
                                "exercise": "Deadlifts",
                                "sets": 3,
                                "reps": "8-12",
                                "rest": "120 seconds",
                                "notes": "Keep back straight, hinge at hips"
                            },
                            {
                                "exercise": "Calf Raises",
                                "sets": 3,
                                "reps": "15-20",
                                "rest": "45 seconds",
                                "notes": "Full range of motion, controlled"
                            }
                        ],
                        "duration": "50-65 minutes"
                    },
                    "thursday": {
                        "focus": "Active Recovery",
                        "activities": [
                            "Light walking (20-30 minutes)",
                            "Gentle stretching",
                            "Foam rolling",
                            "Yoga or mobility work"
                        ],
                        "duration": "30-45 minutes"
                    },
                    "friday": {
                        "focus": "Full Body Circuit",
                        "workout": [
                            {
                                "exercise": "Burpees",
                                "sets": 3,
                                "reps": "8-12",
                                "rest": "60 seconds",
                                "notes": "Full movement, explosive jump"
                            },
                            {
                                "exercise": "Mountain Climbers",
                                "sets": 3,
                                "duration": "30 seconds",
                                "rest": "30 seconds",
                                "notes": "Keep core engaged, quick movement"
                            },
                            {
                                "exercise": "Jump Squats",
                                "sets": 3,
                                "reps": "10-15",
                                "rest": "60 seconds",
                                "notes": "Land softly, absorb impact"
                            },
                            {
                                "exercise": "Plank to Downward Dog",
                                "sets": 3,
                                "reps": "8-12",
                                "rest": "45 seconds",
                                "notes": "Smooth transition, stretch hamstrings"
                            }
                        ],
                        "duration": "35-45 minutes"
                    },
                    "saturday": {
                        "focus": "Sports or Fun Activity",
                        "suggestions": [
                            "Basketball",
                            "Swimming",
                            "Hiking",
                            "Dancing",
                            "Rock climbing"
                        ],
                        "duration": "60-90 minutes"
                    },
                    "sunday": {
                        "focus": "Complete Rest",
                        "activities": [
                            "Light stretching",
                            "Walking",
                            "Meditation",
                            "Recovery work"
                        ],
                        "duration": "20-30 minutes"
                    }
                },
                "progressive_overload": {
                    "week_1": "Focus on form and establishing routine",
                    "week_2": "Increase reps or add weight (5-10%)",
                    "week_3": "Increase sets or duration",
                    "week_4": "Deload week - reduce intensity by 20%"
                },
                "nutrition_timing": {
                    "pre_workout": "Light meal 2-3 hours before, snack 30 minutes before",
                    "during_workout": "Water every 15-20 minutes",
                    "post_workout": "Protein and carbs within 30 minutes"
                },
                "recovery_protocol": {
                    "cool_down": "5-10 minutes light cardio + stretching",
                    "hydration": "16-20 oz water per hour of exercise",
                    "sleep": "7-9 hours quality sleep",
                    "stress_management": "Meditation, deep breathing, relaxation"
                },
                "progress_tracking": {
                    "strength": "Track weights and reps for main lifts",
                    "endurance": "Monitor cardio duration and intensity",
                    "body_composition": "Weekly measurements and photos",
                    "energy_levels": "Daily energy and mood tracking"
                },
                "safety_guidelines": [
                    "Always warm up for 5-10 minutes",
                    "Listen to your body - pain is not gain",
                    "Maintain proper form over weight",
                    "Stay hydrated throughout workout",
                    "Allow adequate rest between sessions"
                ],
                "customization_notes": f"Plan tailored for {health_goal}. Consider {preferences} in exercise selection."
            }
            
            return workout_plan
            
        except Exception as e:
            print(f"[GymBro] Error generating workout plan: {e}")
            return {
                "agent_name": "GymBro",
                "error": f"Failed to generate workout plan: {str(e)}",
                "fallback_plan": "Please consult with a certified personal trainer for personalized fitness advice."
            }

    def process_job(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
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
            print(f"[GymBro] Delivering workout plan for job {job.id}")
            
            # Generate workout plan based on job requirements
            workout_plan = generate_workout_plan(job.service_requirement)
            
            deliverable = IDeliverable(
                type="json",
                value=workout_plan
            )
            job.deliver(deliverable)
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[GymBro] Job {job.id} completed successfully!")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[GymBro] Job {job.id} was rejected")

    threading.Thread(target=job_worker, daemon=True).start()

    # Initialize the ACP client
    VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.SELLER_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        entity_id=env.SELLER_ENTITY_ID
    )

    print("💪 GymBro Fitness Instructor Agent is online and waiting for workout plan requests...")
    threading.Event().wait()

if __name__ == "__main__":
    gymbro_agent()
