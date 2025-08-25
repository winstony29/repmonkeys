#!/usr/bin/env python3
"""
Test buyer script for WellnessBuddy with user input
"""

import threading
import os
from collections import deque
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv

from virtuals_acp import ACPMemo
from virtuals_acp.client import VirtualsACP
from virtuals_acp.env import EnvSettings
from virtuals_acp.job import ACPJob
from virtuals_acp.models import ACPAgentSort, ACPJobPhase, ACPGraduationStatus, ACPOnlineStatus
from virtuals_acp.configs import BASE_MAINNET_CONFIG

load_dotenv(override=True)


def wellness_buyer(user_input: str = "i am tired, what should i eat for dinner tonight?"):
    """Buyer function that works with WellnessBuddy on mainnet"""
    
    env = EnvSettings()

    if env.WHITELISTED_WALLET_PRIVATE_KEY is None:
        raise ValueError("WHITELISTED_WALLET_PRIVATE_KEY is not set")
    if env.BUYER_AGENT_WALLET_ADDRESS is None:
        raise ValueError("BUYER_AGENT_WALLET_ADDRESS is not set")
    if env.BUYER_ENTITY_ID is None:
        raise ValueError("BUYER_ENTITY_ID is not set")

    job_queue = deque()
    job_queue_lock = threading.Lock()
    initiate_job_lock = threading.Lock()
    job_event = threading.Event()

    def safe_append_job(job, memo_to_sign: Optional[ACPMemo] = None):
        with job_queue_lock:
            job_queue.append((job, memo_to_sign))

    def safe_pop_job():
        with job_queue_lock:
            if job_queue:
                return job_queue.popleft()
        return None, None

    def job_worker():
        while True:
            job_event.wait()
            while True:
                job, memo_to_sign = safe_pop_job()
                if not job:
                    break
                try:
                    process_job(job, memo_to_sign)
                except Exception as e:
                    print(f"❌ Error processing job: {e}")
            with job_queue_lock:
                if not job_queue:
                    job_event.clear()

    def on_new_task(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        print(f"📥 Received job {job.id} (phase: {job.phase})")
        safe_append_job(job, memo_to_sign)
        job_event.set()

    def on_evaluate(job: ACPJob):
        print("🔍 Evaluation function called", job.memos)
        for memo in job.memos:
            if memo.next_phase == ACPJobPhase.COMPLETED:
                job.evaluate(True)
                break

    def process_job(job: ACPJob, memo_to_sign: Optional[ACPMemo] = None):
        if job.phase == ACPJobPhase.NEGOTIATION:
            for memo in job.memos:
                if memo.next_phase == ACPJobPhase.TRANSACTION:
                    print(f"💰 Paying job {job.id}")
                    job.pay(job.price)
                    break
        elif job.phase == ACPJobPhase.COMPLETED:
            print(f"✅ Job completed: {job}")
            # Print the deliverable
            for memo in job.memos:
                if memo.deliverable:
                    print(f"📋 Deliverable: {memo.deliverable}")
        elif job.phase == ACPJobPhase.REJECTED:
            print(f"❌ Job rejected: {job}")

    threading.Thread(target=job_worker, daemon=True).start()

    # Initialize ACP client with mainnet config
    print("🔗 Connecting to Base Mainnet...")
    acp = VirtualsACP(
        wallet_private_key=env.WHITELISTED_WALLET_PRIVATE_KEY,
        agent_wallet_address=env.BUYER_AGENT_WALLET_ADDRESS,
        on_new_task=on_new_task,
        on_evaluate=on_evaluate,
        entity_id=env.BUYER_ENTITY_ID,
        config=BASE_MAINNET_CONFIG
    )

    print(f"🔍 Searching for WellnessBuddy...")
    
    # Browse for WellnessBuddy specifically
    relevant_agents = acp.browse_agents(
        keyword="WellnessBuddy",
        sort_by=[ACPAgentSort.SUCCESSFUL_JOB_COUNT],
        top_k=5,
        graduation_status=ACPGraduationStatus.ALL,
        online_status=ACPOnlineStatus.ALL
    )
    
    if not relevant_agents:
        print("❌ WellnessBuddy not found!")
        return
    
    print(f"✅ Found {len(relevant_agents)} agents matching 'WellnessBuddy'")
    
    # Pick the first WellnessBuddy agent
    chosen_agent = relevant_agents[0]
    print(f"🎯 Selected agent: {chosen_agent.name} (ID: {chosen_agent.id})")
    print(f"   Wallet: {chosen_agent.wallet_address}")
    print(f"   Online: {chosen_agent.metrics.get('isOnline', False)}")
    print(f"   Offerings: {len(chosen_agent.offerings)}")

    if not chosen_agent.offerings:
        print("❌ No offerings available from WellnessBuddy!")
        return

    # Pick the first offering
    chosen_job_offering = chosen_agent.offerings[0]
    print(f"📋 Selected offering: {chosen_job_offering.name}")
    print(f"   Price: {chosen_job_offering.price} USDC")

    print(f"\n📝 User Input: '{user_input}'")
    print("🚀 Initiating job with WellnessBuddy...")

    with initiate_job_lock:
        try:
            job_id = chosen_job_offering.initiate_job(
                service_requirement={
                    "user_request": user_input,
                    "request_type": "wellness_consultation",
                    "context": "User is tired and needs dinner recommendations"
                },
                evaluator_address=env.BUYER_AGENT_WALLET_ADDRESS,
                expired_at=datetime.now() + timedelta(hours=1)
            )
            print(f"✅ Job {job_id} initiated successfully!")
            
        except Exception as e:
            print(f"❌ Failed to initiate job: {e}")
            return

    print("👂 Listening for job updates...")
    print("Press Ctrl+C to stop")
    
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping buyer...")


if __name__ == "__main__":
    wellness_buyer()
