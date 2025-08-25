import threading
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus, ACPJob, ACPJobPhase
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def test_buyer_wellness():
    env = EnvSettings()
    
    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        raise ValueError("WHITELISTED_WALLET_PRIVATE_KEY is not set")
    if env.BUYER_AGENT_WALLET_ADDRESS is None:
        raise ValueError("BUYER_AGENT_WALLET_ADDRESS is not set")
    if env.BUYER_ENTITY_ID is None:
        raise ValueError("BUYER_ENTITY_ID is not set")

    def on_new_task(job: ACPJob, memo_to_sign=None):
        print(f"[on_new_task] Received job {job.id} (phase: {job.phase})")
        
        # Handle different job phases
        if job.phase == ACPJobPhase.NEGOTIATION:
            print(f"Job {job.id} is in negotiation phase")
            # Look for memo that requires payment
            for memo in job.memos:
                if memo.next_phase == ACPJobPhase.TRANSACTION:
                    print(f"Paying job {job.id} - amount: ${job.price}")
                    job.pay(job.price)
                    break
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"Job {job.id} completed successfully!")
            print(f"Deliverable: {job.deliverable}")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"Job {job.id} was rejected")

    def on_evaluate(job: ACPJob):
        print(f"[on_evaluate] Evaluating job {job.id}")
        for memo in job.memos:
            if memo.next_phase == ACPJobPhase.COMPLETED:
                print(f"Accepting job {job.id}")
                job.evaluate(True)
                break

    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        on_evaluate=on_evaluate,
        entity_id=env.BUYER_ENTITY_ID
    )

    print("Searching for WellnessBuddy...")
    
    # Search for WellnessBuddy specifically
    relevant_agents = acp.browse_agents(
        keyword="WellnessBuddy",
        sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
        top_k=5,
        graduation_status=ACPGraduationStatus.ALL,
        online_status=ACPOnlineStatus.ALL
    )
    
    if len(relevant_agents) == 0:
        print("WellnessBuddy not found!")
        return
    
    # Get WellnessBuddy agent
    wellness_buddy = relevant_agents[0]
    print(f"Found WellnessBuddy: {wellness_buddy.name}")
    print(f"Description: {wellness_buddy.description}")
    
    # Get the wellness recommendation service
    if len(wellness_buddy.offerings) == 0:
        print("No services available from WellnessBuddy")
        return
    
    wellness_service = wellness_buddy.offerings[0]
    print(f"Service: {wellness_service.name} - ${wellness_service.price}")
    
    # Initiate a job
    print("\nInitiating wellness recommendation job...")
    try:
        job_id = wellness_service.initiate_job(
            service_requirement={
                "health_goal": "I want to improve my sleep quality and reduce stress",
                "current_habits": "I work long hours and often feel tired",
                "preferences": "I prefer natural remedies and simple lifestyle changes"
            },
            evaluator_address=env.BUYER_AGENT_WALLET_ADDRESS,
            expired_at=datetime.now() + timedelta(hours=1)
        )
        print(f"✅ Job {job_id} initiated successfully!")
        print("Waiting for job updates...")
        
        # Keep the script running to receive job updates
        threading.Event().wait()
        
    except Exception as e:
        print(f"❌ Error initiating job: {e}")

if __name__ == "__main__":
    test_buyer_wellness()


