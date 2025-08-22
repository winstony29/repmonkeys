import threading
import time
from collections import deque
from typing import Optional
import json

from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def wellnessbuddy_evaluator(use_thread_lock: bool = True):
    env = EnvSettings()

    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        raise ValueError("WHITELISTED_WALLET_PRIVATE_KEY is not set")
    if env.EVALUATOR_AGENT_WALLET_ADDRESS is None:
        raise ValueError("EVALUATOR_AGENT_WALLET_ADDRESS is not set")
    if env.EVALUATOR_ENTITY_ID is None:
        raise ValueError("EVALUATOR_ENTITY_ID is not set")

    job_queue = deque()
    job_queue_lock = threading.Lock()
    job_event = threading.Event()

    def safe_append_job(job, memo_to_sign: Optional[ACPMemo] = None):
        if use_thread_lock:
            print(f"[WellnessBuddy] Acquiring lock to append job {job.id}")
            with job_queue_lock:
                print(f"[WellnessBuddy] Lock acquired, appending job {job.id} to queue")
                job_queue.append((job, memo_to_sign))
        else:
            job_queue.append((job, memo_to_sign))

    def safe_pop_job():
        if use_thread_lock:
            print(f"[WellnessBuddy] Acquiring lock to pop job")
            with job_queue_lock:
                if job_queue:
                    job, memo_to_sign = job_queue.popleft()
                    print(f"[WellnessBuddy] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[WellnessBuddy] Queue is empty after acquiring lock")
        else:
            if job_queue:
                job, memo_to_sign = job_queue.popleft()
                print(f"[WellnessBuddy] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[WellnessBuddy] Queue is empty (no lock)")
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
            print(f"❌ [WellnessBuddy] Error processing job: {e}")

    def on_new_task(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"[WellnessBuddy] Received job {job.id} (phase: {job.phase})")
        safe_append_job(job, memo_to_sign)
        job_event.set()

    def evaluate_wellness_plans(deliverable):
        """Evaluate the quality and applicability of wellness plans from specialist agents"""
        try:
            # Parse the deliverable
            if isinstance(deliverable, str):
                plan_data = json.loads(deliverable)
            else:
                plan_data = deliverable
            
            evaluation_results = {
                "evaluator_name": "WellnessBuddy",
                "evaluation_status": "approved",
                "evaluation_score": 0,
                "feedback": [],
                "recommendations": [],
                "plan_quality": {}
            }
            
            # Check if it's a valid plan structure
            if not isinstance(plan_data, dict):
                evaluation_results["evaluation_status"] = "rejected"
                evaluation_results["feedback"].append("Invalid plan format - must be a structured JSON object")
                return evaluation_results
            
            # Get agent name and service type
            agent_name = plan_data.get("agent_name", "Unknown")
            service_type = plan_data.get("service_type", "unknown")
            
            print(f"[WellnessBuddy] Evaluating plan from {agent_name} ({service_type})")
            
            # Evaluate based on agent type
            if agent_name == "DietKing":
                evaluation_results = evaluate_nutrition_plan(plan_data, evaluation_results)
            elif agent_name == "SleepyJoe":
                evaluation_results = evaluate_rest_plan(plan_data, evaluation_results)
            elif agent_name == "GymBro":
                evaluation_results = evaluate_workout_plan(plan_data, evaluation_results)
            else:
                evaluation_results["evaluation_status"] = "rejected"
                evaluation_results["feedback"].append(f"Unknown agent type: {agent_name}")
            
            # Overall quality assessment
            if evaluation_results["evaluation_score"] >= 7:
                evaluation_results["evaluation_status"] = "approved"
            elif evaluation_results["evaluation_score"] >= 5:
                evaluation_results["evaluation_status"] = "approved_with_revisions"
            else:
                evaluation_results["evaluation_status"] = "rejected"
            
            return evaluation_results
            
        except Exception as e:
            print(f"[WellnessBuddy] Error evaluating plans: {e}")
            return {
                "evaluator_name": "WellnessBuddy",
                "evaluation_status": "rejected",
                "evaluation_score": 0,
                "feedback": [f"Evaluation error: {str(e)}"],
                "recommendations": ["Please resubmit with valid plan format"],
                "plan_quality": {}
            }

    def evaluate_nutrition_plan(plan_data, evaluation_results):
        """Evaluate nutrition plan from DietKing"""
        score = 0
        feedback = []
        recommendations = []
        
        # Check for required components
        required_components = ["meal_plan", "daily_totals", "recommendations"]
        for component in required_components:
            if component in plan_data:
                score += 1
            else:
                feedback.append(f"Missing required component: {component}")
        
        # Evaluate meal plan structure
        meal_plan = plan_data.get("meal_plan", {})
        if meal_plan:
            meals = ["breakfast", "lunch", "dinner"]
            for meal in meals:
                if meal in meal_plan:
                    score += 0.5
                    meal_data = meal_plan[meal]
                    if isinstance(meal_data, dict) and "calories" in meal_data:
                        score += 0.5
                    else:
                        feedback.append(f"Incomplete {meal} data")
                else:
                    feedback.append(f"Missing {meal} in meal plan")
        
        # Check daily totals
        daily_totals = plan_data.get("daily_totals", {})
        if daily_totals and "calories" in daily_totals:
            calories = daily_totals["calories"]
            if 1200 <= calories <= 2500:
                score += 1
            else:
                feedback.append(f"Daily calories ({calories}) may be outside healthy range")
        
        # Check recommendations
        recommendations_list = plan_data.get("recommendations", [])
        if len(recommendations_list) >= 3:
            score += 1
        else:
            feedback.append("Insufficient recommendations provided")
        
        # Add positive feedback for good practices
        if "customization_notes" in plan_data:
            score += 0.5
            feedback.append("Good: Plan includes customization notes")
        
        if "nutritional_benefits" in meal_plan.get("breakfast", {}):
            score += 0.5
            feedback.append("Good: Includes nutritional benefits information")
        
        evaluation_results["evaluation_score"] = min(score, 10)
        evaluation_results["feedback"].extend(feedback)
        evaluation_results["plan_quality"] = {
            "completeness": "high" if score >= 7 else "medium" if score >= 5 else "low",
            "nutritional_balance": "good" if daily_totals.get("protein") and daily_totals.get("carbs") else "needs_improvement",
            "practicality": "high" if len(recommendations_list) >= 3 else "medium"
        }
        
        return evaluation_results

    def evaluate_rest_plan(plan_data, evaluation_results):
        """Evaluate rest and recovery plan from SleepyJoe"""
        score = 0
        feedback = []
        
        # Check for required components
        required_components = ["sleep_schedule", "recovery_techniques", "recommendations"]
        for component in required_components:
            if component in plan_data:
                score += 1
            else:
                feedback.append(f"Missing required component: {component}")
        
        # Evaluate sleep schedule
        sleep_schedule = plan_data.get("sleep_schedule", {})
        if sleep_schedule:
            if "sleep_duration" in sleep_schedule:
                duration = sleep_schedule["sleep_duration"]
                if "8" in str(duration) or "7-9" in str(duration):
                    score += 1
                else:
                    feedback.append("Sleep duration may not be optimal")
        
        # Check recovery techniques
        recovery_techniques = plan_data.get("recovery_techniques", {})
        if recovery_techniques:
            technique_types = ["active_recovery", "passive_recovery", "mental_recovery"]
            for technique_type in technique_types:
                if technique_type in recovery_techniques:
                    score += 0.5
                else:
                    feedback.append(f"Missing {technique_type} techniques")
        
        # Check weekly schedule
        weekly_schedule = plan_data.get("weekly_recovery_schedule", {})
        if weekly_schedule and len(weekly_schedule) >= 5:
            score += 1
        else:
            feedback.append("Incomplete weekly recovery schedule")
        
        # Check stress management
        stress_management = plan_data.get("stress_management", {})
        if stress_management:
            score += 0.5
            feedback.append("Good: Includes stress management strategies")
        
        # Check progress tracking
        progress_tracking = plan_data.get("progress_tracking", {})
        if progress_tracking:
            score += 0.5
            feedback.append("Good: Includes progress tracking methods")
        
        evaluation_results["evaluation_score"] = min(score, 10)
        evaluation_results["feedback"].extend(feedback)
        evaluation_results["plan_quality"] = {
            "completeness": "high" if score >= 7 else "medium" if score >= 5 else "low",
            "sleep_optimization": "good" if sleep_schedule else "needs_improvement",
            "recovery_comprehensiveness": "high" if len(recovery_techniques) >= 2 else "medium"
        }
        
        return evaluation_results

    def evaluate_workout_plan(plan_data, evaluation_results):
        """Evaluate workout plan from GymBro"""
        score = 0
        feedback = []
        
        # Check for required components
        required_components = ["weekly_schedule", "safety_guidelines", "progressive_overload"]
        for component in required_components:
            if component in plan_data:
                score += 1
            else:
                feedback.append(f"Missing required component: {component}")
        
        # Evaluate weekly schedule
        weekly_schedule = plan_data.get("weekly_schedule", {})
        if weekly_schedule:
            workout_days = 0
            for day, day_data in weekly_schedule.items():
                if isinstance(day_data, dict) and "workout" in day_data:
                    workout_days += 1
                    workout = day_data["workout"]
                    if isinstance(workout, list) and len(workout) >= 3:
                        score += 0.5
                    else:
                        feedback.append(f"Insufficient exercises for {day}")
            
            if workout_days >= 4:
                score += 1
            else:
                feedback.append("Insufficient workout days per week")
        
        # Check safety guidelines
        safety_guidelines = plan_data.get("safety_guidelines", [])
        if len(safety_guidelines) >= 3:
            score += 1
        else:
            feedback.append("Insufficient safety guidelines")
        
        # Check progressive overload
        progressive_overload = plan_data.get("progressive_overload", {})
        if progressive_overload and len(progressive_overload) >= 3:
            score += 1
        else:
            feedback.append("Incomplete progressive overload strategy")
        
        # Check recovery protocol
        recovery_protocol = plan_data.get("recovery_protocol", {})
        if recovery_protocol:
            score += 0.5
            feedback.append("Good: Includes recovery protocol")
        
        # Check exercise variety
        exercise_variety = 0
        for day_data in weekly_schedule.values():
            if isinstance(day_data, dict) and "workout" in day_data:
                workout = day_data["workout"]
                if isinstance(workout, list):
                    exercise_variety += len(workout)
        
        if exercise_variety >= 15:
            score += 0.5
            feedback.append("Good: Good variety of exercises")
        else:
            feedback.append("Could benefit from more exercise variety")
        
        evaluation_results["evaluation_score"] = min(score, 10)
        evaluation_results["feedback"].extend(feedback)
        evaluation_results["plan_quality"] = {
            "completeness": "high" if score >= 7 else "medium" if score >= 5 else "low",
            "safety_focus": "high" if len(safety_guidelines) >= 3 else "medium",
            "progression_strategy": "good" if progressive_overload else "needs_improvement"
        }
        
        return evaluation_results

    def process_job(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            print(f"[WellnessBuddy] Accepting evaluation job {job.id}")
            job.respond(True)
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"[WellnessBuddy] Evaluating wellness plan for job {job.id}")
            
            # Evaluate the deliverable from the specialist agent
            evaluation_result = evaluate_wellness_plans(job.deliverable.value)
            
            # Create comprehensive evaluation deliverable
            final_evaluation = {
                "evaluator": "WellnessBuddy",
                "original_plan": job.deliverable.value,
                "evaluation": evaluation_result,
                "timestamp": time.time(),
                "recommendations_for_smasher": [
                    "Review evaluation feedback for plan improvements",
                    "Consider user preferences and health goals",
                    "Ensure plan integration across all wellness domains"
                ]
            }
            
            deliverable = IDeliverable(
                type="json",
                value=final_evaluation
            )
            job.deliver(deliverable)
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[WellnessBuddy] Evaluation job {job.id} completed successfully!")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[WellnessBuddy] Evaluation job {job.id} was rejected")

    threading.Thread(target=job_worker, daemon=True).start()

    # Initialize the ACP client
    VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.EVALUATOR_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        entity_id=env.EVALUATOR_ENTITY_ID
    )

    print("🤝 WellnessBuddy Evaluator Agent is online and ready to evaluate wellness plans...")
    threading.Event().wait()

if __name__ == "__main__":
    wellnessbuddy_evaluator()
