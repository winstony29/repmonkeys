import threading
import time
from collections import deque
from typing import Optional
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPJob, ACPJobPhase, ACPMemo, IDeliverable
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def seller_agent(agent_name: str, wallet_address: str, entity_id: int, use_thread_lock: bool = True):
    """
    Generic seller agent function that can be used for any agent
    
    Args:
        agent_name: Name of the agent (e.g., "DietKing", "GymBro", "SleepyJoe")
        wallet_address: Wallet address of the agent
        entity_id: Entity ID of the agent
        use_thread_lock: Whether to use thread locking for job processing
    """
    env = EnvSettings()

    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        raise ValueError("WHITELISTED_WALLET_PRIVATE_KEY is not set")

    job_queue = deque()
    job_queue_lock = threading.Lock()
    job_event = threading.Event()

    def safe_append_job(job, memo_to_sign: Optional[ACPMemo] = None):
        if use_thread_lock:
            print(f"[{agent_name}] [safe_append_job] Acquiring lock to append job {job.id}")
            with job_queue_lock:
                print(f"[{agent_name}] [safe_append_job] Lock acquired, appending job {job.id} to queue")
                job_queue.append((job, memo_to_sign))
        else:
            job_queue.append((job, memo_to_sign))

    def safe_pop_job():
        if use_thread_lock:
            print(f"[{agent_name}] [safe_pop_job] Acquiring lock to pop job")
            with job_queue_lock:
                if job_queue:
                    job, memo_to_sign = job_queue.popleft()
                    print(f"[{agent_name}] [safe_pop_job] Lock acquired, popped job {job.id}")
                    return job, memo_to_sign
                else:
                    print(f"[{agent_name}] [safe_pop_job] Queue is empty after acquiring lock")
        else:
            if job_queue:
                job, memo_to_sign = job_queue.popleft()
                print(f"[{agent_name}] [safe_pop_job] Popped job {job.id} without lock")
                return job, memo_to_sign
            else:
                print(f"[{agent_name}] [safe_pop_job] Queue is empty (no lock)")
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
            print(f"[{agent_name}] ❌ Error processing job: {e}")

    def on_new_task(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"[{agent_name}] [on_new_task] Received job {job.id} (phase: {job.phase})")
        safe_append_job(job, memo_to_sign)
        job_event.set()

    def process_job(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if (
                job.phase == ACPJobPhase.REQUEST and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.NEGOTIATION
        ):
            print(f"[{agent_name}] Accepting job {job.id}")
            job.respond(True)
        elif (
                job.phase == ACPJobPhase.TRANSACTION and
                memo_to_sign is not None and
                memo_to_sign.next_phase == ACPJobPhase.EVALUATION
        ):
            print(f"[{agent_name}] Delivering job {job.id}")
            # Create a deliverable based on the agent type
            deliverable = create_deliverable(job, agent_name)
            job.deliver(deliverable)
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"[{agent_name}] Job completed: {job}")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"[{agent_name}] Job rejected: {job}")

    def create_deliverable(job: ACPJob, agent_name: str) -> IDeliverable:
        """Create a contextual deliverable based on the agent type and service requirements"""
        
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
        
        if agent_name == "DietKing":
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
            
        elif agent_name == "GymBro":
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
            
        elif agent_name == "SleepyJoe":
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
                description=f"10-minute wellness guide from {agent_name}"
            )

    threading.Thread(target=job_worker, daemon=True).start()

    # Initialize the ACP client
    VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=wallet_address,
        on_new_task=on_new_task,
        entity_id=entity_id
    )

    print(f"[{agent_name}] Waiting for new tasks...")
    threading.Event().wait()

# Example usage functions for each agent
def dietking_seller():
    """Run DietKing seller agent"""
    # You'll need to get these from your .env file
    seller_agent("DietKing", "0x...", 1)  # Replace with actual wallet and entity ID

def gymbro_seller():
    """Run GymBro seller agent"""
    seller_agent("GymBro", "0x...", 1)  # Replace with actual wallet and entity ID

def sleepyjoe_seller():
    """Run SleepyJoe seller agent"""
    seller_agent("SleepyJoe", "0x...", 1)  # Replace with actual wallet and entity ID

if __name__ == "__main__":
    # Uncomment the agent you want to run
    # dietking_seller()
    # gymbro_seller()
    # sleepyjoe_seller()
    print("Please uncomment the agent you want to run in the main section")
