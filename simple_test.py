import threading
from dotenv import load_dotenv
from virtuals_acp import VirtualsACP, ACPAgentSort, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.env import EnvSettings

load_dotenv(override=True)

def simple_test():
    env = EnvSettings()
    
    print("Environment check:")
    print(f"  WHITELISTED_WALLET_PRIVATE_KEY: {'✓ Set' if env.WHITELISTED_WALLET_PRIVATE_KEY else '✗ Not set'}")
    print(f"  BUYER_AGENT_WALLET_ADDRESS: {'✓ Set' if env.BUYER_AGENT_WALLET_ADDRESS else '✗ Not set'}")
    print(f"  BUYER_ENTITY_ID: {'✓ Set' if env.BUYER_ENTITY_ID else '✗ Not set'}")
    print(f"  SELLER_AGENT_WALLET_ADDRESS: {'✓ Set' if env.SELLER_AGENT_WALLET_ADDRESS else '✗ Not set'}")
    print(f"  SELLER_ENTITY_ID: {'✓ Set' if env.SELLER_ENTITY_ID else '✗ Not set'}")
    
    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        print("❌ WHITELISTED_WALLET_PRIVATE_KEY is required")
        return
    
    if env.BUYER_AGENT_WALLET_ADDRESS is None:
        print("❌ BUYER_AGENT_WALLET_ADDRESS is required")
        return
    
    if env.BUYER_ENTITY_ID is None:
        print("❌ BUYER_ENTITY_ID is required")
        return

    def on_new_task(job, memo_to_sign=None):
        print(f"Received job: {job.id}")

    def on_evaluate(job):
        print(f"Evaluating job: {job.id}")

    print("\nInitializing ACP client...")
    try:
        acp = VirtualsACP(
            wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
            agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
            on_new_task=on_new_task,
            on_evaluate=on_evaluate,
            entity_id=env.BUYER_ENTITY_ID
        )
        print("✅ ACP client initialized successfully")
        
        print("\nTesting agent discovery...")
        relevant_agents = acp.browse_agents(
            keyword="WellnessBuddy",
            sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
            top_k=5,
            graduation_status=ACPGraduationStatus.ALL,
            online_status=ACPOnlineStatus.ALL
        )
        
        print(f"✅ Found {len(relevant_agents)} agents")
        
        if len(relevant_agents) > 0:
            wellness_buddy = relevant_agents[0]
            print(f"  Agent: {wellness_buddy.name}")
            print(f"  Wallet: {wellness_buddy.wallet_address}")
            print(f"  Description: {wellness_buddy.description}")
            print(f"  Services: {len(wellness_buddy.offerings)}")
            
            for i, offering in enumerate(wellness_buddy.offerings):
                print(f"    {i+1}. {offering.name} - ${offering.price}")
        
        print("\n✅ Basic functionality test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    simple_test()


