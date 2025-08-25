import threading
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus, ACPJob, ACPJobPhase
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def test_multi_agents():
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

    print("Testing Multiple Agents")
    print("=" * 50)
    
    # Define agents to test with their specific requirements
    agents_to_test = [
        {
            "name": "WellnessBuddy",
            "keyword": "WellnessBuddy",
            "service_requirement": {
                "health_goal": "I want to improve my sleep quality and reduce stress",
                "current_habits": "I work long hours and often feel tired",
                "preferences": "I prefer natural remedies and simple lifestyle changes"
            }
        },
        {
            "name": "DietKing",
            "keyword": "DietKing",
            "service_requirement": {
                "diet_goal": "I want to lose 10 pounds in 3 months",
                "current_diet": "I eat mostly fast food and processed meals",
                "restrictions": "I'm allergic to nuts and prefer vegetarian options"
            }
        },
        {
            "name": "GymBro",
            "keyword": "GymBro",
            "service_requirement": {
                "fitness_goal": "I want to build muscle and increase strength",
                "current_level": "Beginner, I can do basic push-ups and squats",
                "equipment": "I have access to a basic gym with free weights"
            }
        },
        {
            "name": "SleepyJoe",
            "keyword": "SleepyJoe",
            "service_requirement": {
                "sleep_goal": "I want to get 8 hours of quality sleep per night",
                "current_sleep": "I only get 5-6 hours and wake up frequently",
                "environment": "I live in a noisy apartment and work night shifts"
            }
        }
    ]
    
    initiated_jobs = []
    
    for agent_config in agents_to_test:
        print(f"\nSearching for {agent_config['name']}...")
        
        try:
            # Search for the agent
            relevant_agents = acp.browse_agents(
                keyword=agent_config["keyword"],
                sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                top_k=5,
                graduation_status=ACPGraduationStatus.ALL,
                online_status=ACPOnlineStatus.ALL
            )
            
            if len(relevant_agents) == 0:
                print(f"❌ {agent_config['name']} not found!")
                continue
            
            # Get the agent
            agent = relevant_agents[0]
            print(f"✅ Found {agent.name}: {agent.description}")
            
            # Get the service
            if len(agent.offerings) == 0:
                print(f"❌ No services available from {agent.name}")
                continue
            
            service = agent.offerings[0]
            print(f"Service: {service.name} - ${service.price}")
            
            # Initiate a job
            print(f"Initiating {agent_config['name']} job...")
            job_id = service.initiate_job(
                service_requirement=agent_config["service_requirement"],
                evaluator_address=env.BUYER_AGENT_WALLET_ADDRESS,
                expired_at=datetime.now() + timedelta(hours=1)
            )
            print(f"✅ Job {job_id} initiated with {agent.name}!")
            initiated_jobs.append({"job_id": job_id, "agent": agent.name})
            
        except Exception as e:
            print(f"❌ Error with {agent_config['name']}: {e}")
    
    print(f"\n🎉 Successfully initiated {len(initiated_jobs)} jobs!")
    for job in initiated_jobs:
        print(f"  - Job {job['job_id']} with {job['agent']}")
    
    print("\nWaiting for job updates...")
    print("Press Ctrl+C to stop")
    
    # Keep the script running to receive job updates
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        print("\nStopping...")

if __name__ == "__main__":
    test_multi_agents()

