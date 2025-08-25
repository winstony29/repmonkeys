import threading
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def test_wellness_buddy():
    env = EnvSettings()
    
    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        raise ValueError("WHITELISTED_WALLET_PRIVATE_KEY is not set")
    if env.BUYER_AGENT_WALLET_ADDRESS is None:
        raise ValueError("BUYER_AGENT_WALLET_ADDRESS is not set")
    if env.BUYER_ENTITY_ID is None:
        raise ValueError("BUYER_ENTITY_ID is not set")

    def on_new_task(job, memo_to_sign=None):
        print(f"Received job: {job.id}")

    def on_evaluate(job):
        print(f"Evaluating job: {job.id}")

    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        on_evaluate=on_evaluate,
        entity_id=env.BUYER_ENTITY_ID
    )

    print("Searching specifically for WellnessBuddy...")
    
    # Search for WellnessBuddy specifically
    try:
        relevant_agents = acp.browse_agents(
            keyword="WellnessBuddy",
            sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
            top_k=10,
            graduation_status=ACPGraduationStatus.ALL,
            online_status=ACPOnlineStatus.ALL
        )
        print(f"Found {len(relevant_agents)} agents matching 'WellnessBuddy'")
        
        if len(relevant_agents) == 0:
            print("No agents found with 'WellnessBuddy' keyword")
            print("\nTrying broader search terms...")
            
            # Try broader search terms
            broader_terms = ["wellness", "buddy", "health", "fitness"]
            for term in broader_terms:
                print(f"\nSearching with keyword: '{term}'")
                try:
                    agents = acp.browse_agents(
                        keyword=term,
                        sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
                        top_k=5,
                        graduation_status=ACPGraduationStatus.ALL,
                        online_status=ACPOnlineStatus.ALL
                    )
                    print(f"Found {len(agents)} agents with '{term}'")
                    for i, agent in enumerate(agents):
                        print(f"  {i+1}. {agent.name} ({agent.wallet_address})")
                        print(f"     Description: {agent.description[:100]}...")
                except Exception as e:
                    print(f"Error searching with '{term}': {e}")
        else:
            for i, agent in enumerate(relevant_agents):
                print(f"  {i+1}. {agent.name} ({agent.wallet_address})")
                print(f"     Description: {agent.description}")
                print(f"     Offerings: {len(agent.offerings)}")
                for offering in agent.offerings:
                    print(f"       - {offering.name}: ${offering.price}")
                    
    except Exception as e:
        print(f"Error searching for WellnessBuddy: {e}")

if __name__ == "__main__":
    test_wellness_buddy()


