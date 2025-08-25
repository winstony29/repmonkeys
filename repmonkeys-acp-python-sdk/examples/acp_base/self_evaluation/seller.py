import threading
import time
from collections import deque
from typing import Optional

from dotenv import load_dotenv

from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)


def seller(use_thread_lock: bool = True):
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
            print(f"[safe_append_job] Acquiring lock to append job {job.id}")
            with job_queue_lock:
                print(f"[safe_append_job] Lock acquired, appending job {job.id} to queue")
                job_queue.append((job, memo_to_sign))
        else:
            job_queue.append((job, memo_to_sign))

    def safe_pop_job():
        if use_thread_lock:
            print(f"[safe_pop_job] Acquiring lock to pop job")
            with job_queue_lock:
                if job_queue:
                    job, memo_to_sign = job_queue.popleft()
                    print(f"[safe_pop_job] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print("[safe_pop_job] Queue is empty after acquiring lock")
        else:
            if job_queue:
                job, memo_to_sign = job_queue.popleft()
                print(f"[safe_pop_job] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print("[safe_pop_job] Queue is empty (no lock)")
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
            print(f"\u274c Error processing job: {e}")

    def on_new_task(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"[on_new_task] Received job {job.id} (phase: {job.phase})")
        safe_append_job(job, memo_to_sign)
        job_event.set()

    def create_contextual_deliverable(job: ACPJob) -> IDeliverable:
        """Create a contextual deliverable based on the job content and agent type"""
        
        # Extract service requirements from the job
        service_requirement = {}
        try:
            for memo in job.memos:
                if memo.content and memo.content.startswith('{"name":'):
                    import json
                    content_data = json.loads(memo.content)
                    if 'serviceRequirement' in content_data:
                        service_requirement = content_data['serviceRequirement']
                        break
        except:
            pass
        
        # Determine agent type based on service name or requirements
        agent_type = "WellnessBuddy"  # Default
        try:
            for memo in job.memos:
                if memo.content and memo.content.startswith('{"name":'):
                    import json
                    content_data = json.loads(memo.content)
                    if 'name' in content_data:
                        service_name = content_data['name'].lower()
                        if 'diet' in service_name or 'nutrition' in service_name:
                            agent_type = "DietKing"
                        elif 'gym' in service_name or 'fitness' in service_name or 'workout' in service_name:
                            agent_type = "GymBro"
                        elif 'sleep' in service_name:
                            agent_type = "SleepyJoe"
                        elif 'wellness' in service_name or 'health' in service_name:
                            agent_type = "WellnessBuddy"
                        break
        except:
            pass
        
        # Generate contextual URLs based on agent type and requirements
        if agent_type == "WellnessBuddy":
            if 'health_goal' in service_requirement:
                goal = service_requirement['health_goal'].lower()
                if 'sleep' in goal:
                    return IDeliverable(
                        type="url",
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=600",  # 10-min sleep meditation
                        description="10-minute guided sleep meditation to help you relax and fall asleep faster"
                    )
                elif 'stress' in goal:
                    return IDeliverable(
                        type="url", 
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=480",  # 8-min stress relief
                        description="8-minute stress relief breathing exercise and relaxation technique"
                    )
            return IDeliverable(
                type="url",
                value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=720",  # 12-min wellness
                description="12-minute wellness routine combining meditation and gentle stretching"
            )
            
        elif agent_type == "DietKing":
            if 'diet_goal' in service_requirement:
                goal = service_requirement['diet_goal'].lower()
                if 'lose' in goal or 'weight' in goal:
                    return IDeliverable(
                        type="url",
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=900",  # 15-min meal prep
                        description="15-minute healthy meal prep guide for weight loss"
                    )
                elif 'muscle' in goal or 'gain' in goal:
                    return IDeliverable(
                        type="url",
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=840",  # 14-min protein guide
                        description="14-minute guide to protein-rich meals for muscle building"
                    )
            return IDeliverable(
                type="url",
                value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=780",  # 13-min nutrition
                description="13-minute nutrition basics and healthy eating guide"
            )
            
        elif agent_type == "GymBro":
            if 'fitness_goal' in service_requirement:
                goal = service_requirement['fitness_goal'].lower()
                if 'muscle' in goal or 'strength' in goal:
                    return IDeliverable(
                        type="url",
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1200",  # 20-min strength
                        description="20-minute strength training workout for muscle building"
                    )
                elif 'cardio' in goal or 'endurance' in goal:
                    return IDeliverable(
                        type="url",
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=900",  # 15-min cardio
                        description="15-minute cardio workout for endurance and stamina"
                    )
            return IDeliverable(
                type="url",
                value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1080",  # 18-min full body
                description="18-minute full body workout for beginners"
            )
            
        elif agent_type == "SleepyJoe":
            if 'sleep_goal' in service_requirement:
                goal = service_requirement['sleep_goal'].lower()
                if 'quality' in goal or 'better' in goal:
                    return IDeliverable(
                        type="url",
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=600",  # 10-min sleep quality
                        description="10-minute sleep hygiene guide for better sleep quality"
                    )
                elif 'schedule' in goal or 'routine' in goal:
                    return IDeliverable(
                        type="url",
                        value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=480",  # 8-min bedtime routine
                        description="8-minute bedtime routine to establish healthy sleep patterns"
                    )
            return IDeliverable(
                type="url",
                value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=540",  # 9-min sleep meditation
                description="9-minute sleep meditation to help you fall asleep faster"
            )
            
        else:
            # Generic wellness content for unknown agents
            return IDeliverable(
                type="url",
                value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=600",
                description="10-minute wellness guide for overall health improvement"
            )

    def process_job(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            job.respond(True)
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"Delivering job {job.id}")
            deliverable = create_contextual_deliverable(job)
            print(f"Generated deliverable: {deliverable.description}")
            job.deliver(deliverable)
        elif job.phase == ACPJobPhase.COMPLETED:
            print("Job completed", job)
        elif job.phase == ACPJobPhase.REJECTED:
            print("Job rejected", job)

    threading.Thread(target=job_worker, daemon=True).start()

    # Initialize the ACP client
    VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.SELLER_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        entity_id=env.SELLER_ENTITY_ID
    )

    print("Waiting for new task...")
    threading.Event().wait()


if __name__ == "__main__":
    seller()
