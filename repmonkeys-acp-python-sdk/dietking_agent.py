import threading
import time
from collections import deque
from typing import Optional
import json

from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def dietking_agent(use_thread_lock: bool = True):
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
            print(f"[DietKing] Acquiring lock to append job {job.id}")
            with job_queue_lock:
                print(f"[DietKing] Lock acquired, appending job {job.id} to queue")
                job_queue.append((job, memo_to_sign))
        else:
            job_queue.append((job, memo_to_sign))

    def safe_pop_job():
        if use_thread_lock:
            print(f"[DietKing] Acquiring lock to pop job")
            with job_queue_lock:
                if job_queue:
                    job, memo_to_sign = job_queue.popleft()
                    print(f"[DietKing] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[DietKing] Queue is empty after acquiring lock")
        else:
            if job_queue:
                job, memo_to_sign = job_queue.popleft()
                print(f"[DietKing] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[DietKing] Queue is empty (no lock)")
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
            print(f"❌ [DietKing] Error processing job: {e}")

    def on_new_task(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"[DietKing] Received job {job.id} (phase: {job.phase})")
        safe_append_job(job, memo_to_sign)
        job_event.set()

    def generate_meal_plan(requirements):
        """Generate a detailed meal plan based on user requirements"""
        try:
            # Parse requirements
            if isinstance(requirements, str):
                requirements = json.loads(requirements)
            
            health_goal = requirements.get("health_goal", "general wellness")
            current_habits = requirements.get("current_habits", "")
            preferences = requirements.get("preferences", "")
            
            # Generate personalized meal plan
            meal_plan = {
                "agent_name": "DietKing",
                "service_type": "nutrition_planning",
                "meal_plan": {
                    "breakfast": {
                        "meal": "Oatmeal with berries and nuts",
                        "calories": 350,
                        "protein": "12g",
                        "carbs": "45g",
                        "fat": "15g",
                        "nutritional_benefits": "High fiber, antioxidants, healthy fats"
                    },
                    "lunch": {
                        "meal": "Grilled chicken salad with mixed greens",
                        "calories": 450,
                        "protein": "35g",
                        "carbs": "25g",
                        "fat": "20g",
                        "nutritional_benefits": "Lean protein, vitamins, minerals"
                    },
                    "dinner": {
                        "meal": "Salmon with quinoa and steamed vegetables",
                        "calories": 550,
                        "protein": "40g",
                        "carbs": "35g",
                        "fat": "25g",
                        "nutritional_benefits": "Omega-3 fatty acids, complete protein"
                    },
                    "snacks": [
                        {
                            "meal": "Greek yogurt with honey",
                            "calories": 150,
                            "protein": "15g",
                            "carbs": "20g",
                            "fat": "5g"
                        },
                        {
                            "meal": "Apple with almond butter",
                            "calories": 200,
                            "protein": "5g",
                            "carbs": "25g",
                            "fat": "10g"
                        }
                    ]
                },
                "daily_totals": {
                    "calories": 1700,
                    "protein": "107g",
                    "carbs": "150g",
                    "fat": "75g"
                },
                "recommendations": [
                    "Stay hydrated with 8-10 glasses of water daily",
                    "Eat slowly and mindfully",
                    "Include a variety of colorful vegetables",
                    "Limit processed foods and added sugars"
                ],
                "customization_notes": f"Plan tailored for {health_goal}. Consider {preferences} in meal preparation."
            }
            
            return meal_plan
            
        except Exception as e:
            print(f"[DietKing] Error generating meal plan: {e}")
            return {
                "agent_name": "DietKing",
                "error": f"Failed to generate meal plan: {str(e)}",
                "fallback_plan": "Please consult with a registered dietitian for personalized nutrition advice."
            }

    def process_job(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
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
            print(f"[DietKing] Delivering meal plan for job {job.id}")
            
            # Generate meal plan based on job requirements
            meal_plan = generate_meal_plan(job.service_requirement)
            
            deliverable = IDeliverable(
                type="json",
                value=meal_plan
            )
            job.deliver(deliverable)
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[DietKing] Job {job.id} completed successfully!")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[DietKing] Job {job.id} was rejected")

    threading.Thread(target=job_worker, daemon=True).start()

    # Initialize the ACP client
    VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.SELLER_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        entity_id=env.SELLER_ENTITY_ID
    )

    print("🍎 DietKing Nutritionist Agent is online and waiting for meal plan requests...")
    threading.Event().wait()

if __name__ == "__main__":
    dietking_agent()
