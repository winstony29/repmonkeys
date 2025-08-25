# ACP Agent-to-Agent Coordination System

## Overview

This system implements **decentralized agent-to-agent coordination** using the Virtuals Agent Commerce Protocol (ACP). Instead of relying solely on LLM prompts, agents can now hire other agents through economic transactions on the blockchain.

## Architecture

### Traditional LLM Coordination
```
User → WellnessBuddy → LLM Prompt → DietKing Response → Synthesis
```

### ACP Agent-to-Agent Coordination
```
User → WellnessBuddy → ACP Job → DietKing → ACP Deliverable → Synthesis
```

## Key Components

### 1. Individual Agent Sellers

#### 🥗 DietKing (`diet_king_seller.py`)
- **Specialty**: Nutrition and meal planning
- **Capabilities**: 
  - Calorie calculation and macro tracking
  - Dietary restriction handling
  - Supplement recommendations
  - Budget-friendly meal planning
- **ACP Integration**: Receives jobs and delivers nutrition plans

#### 💪 GymBro (`gym_bro_seller.py`)
- **Specialty**: Fitness and workout planning
- **Capabilities**:
  - Exercise programming
  - Form guidance
  - Progressive overload
  - Equipment recommendations
- **ACP Integration**: Receives jobs and delivers fitness plans

#### 😴 SleepyJoe (`sleepy_joe_seller.py`)
- **Specialty**: Sleep optimization
- **Capabilities**:
  - Sleep hygiene optimization
  - Circadian rhythm management
  - Environment optimization
  - Stress management for sleep
- **ACP Integration**: Receives jobs and delivers sleep plans

### 2. Enhanced WellnessBuddy (`enhanced_seller_with_coordination.py`)
- **Role**: Primary coordinator
- **Capabilities**:
  - Analyzes user requirements
  - Determines needed specialists
  - Creates ACP jobs to specialists
  - Synthesizes responses
  - Provides final wellness plan

## How It Works

### Step 1: User Request
User submits a wellness request to WellnessBuddy through ACP.

### Step 2: Requirement Analysis
WellnessBuddy analyzes the request and determines which specialists are needed:
- **DietKing**: For nutrition, meal planning, weight management
- **GymBro**: For fitness, exercise, strength training
- **SleepyJoe**: For sleep optimization, stress management

### Step 3: ACP Job Creation
WellnessBuddy creates ACP jobs to the required specialists:
```python
job_id = offering.initiate_job(
    service_requirement=requirements,
    evaluator_address=wellnessbuddy_wallet,
    expired_at=datetime.now() + timedelta(hours=1)
)
```

### Step 4: Specialist Processing
Each specialist:
1. Receives the ACP job
2. Analyzes requirements
3. Creates specialized plan
4. Delivers response through ACP

### Step 5: Response Synthesis
WellnessBuddy:
1. Collects all specialist responses
2. Synthesizes into comprehensive plan
3. Delivers final result to user

## Economic Model

### Transaction Flow
```
User → WellnessBuddy: $15 USDC (coordination fee)
WellnessBuddy → DietKing: $10 USDC
WellnessBuddy → GymBro: $10 USDC  
WellnessBuddy → SleepyJoe: $10 USDC
WellnessBuddy Profit: $5 USDC
```

### Benefits
- **Decentralized**: No central authority needed
- **Incentivized**: Each agent earns for expertise
- **Transparent**: All transactions on-chain
- **Scalable**: Any agent can hire any other agent
- **Quality**: Economic incentives ensure quality work

## Setup Instructions

### 1. Environment Configuration
Update your `.env` file with agent wallet addresses:
```env
# Agent Wallet Addresses
DIETKING_WALLET_ADDRESS=0x80F921051B275FE5f0430747c980C804c0fD35c1
DIETKING_ENTITY_ID=1

GYMBRO_WALLET_ADDRESS=0x499Ff185CeC999aDeD690898F11e5c941b4C8f83
GYMBRO_ENTITY_ID=1

SLEEPYJOE_WALLET_ADDRESS=0xC15557D5d8E98554D93CA64e13B6ba2E1364a864
SLEEPYJOE_ENTITY_ID=1
```

### 2. Register Agents on ACP
Each agent needs to be registered on the ACP network with their services.

### 3. Start Agent Services
Run each agent in separate terminals:

```bash
# Terminal 1: WellnessBuddy (Coordinator)
python enhanced_seller_with_coordination.py

# Terminal 2: DietKing
python diet_king_seller.py

# Terminal 3: GymBro  
python gym_bro_seller.py

# Terminal 4: SleepyJoe
python sleepy_joe_seller.py
```

### 4. Test the System
```bash
python test_acp_agent_coordination.py
```

## Usage Examples

### Example 1: Comprehensive Wellness Request
```python
wellness_request = {
    "health_goal": "comprehensive wellness improvement",
    "specific_needs": ["weight loss", "muscle building", "sleep optimization"],
    "current_issues": ["poor sleep quality", "stress", "inconsistent diet"],
    "preferences": ["home workouts", "budget-friendly", "vegetarian options"]
}
```

**Result**: WellnessBuddy coordinates with all three specialists and provides an integrated plan.

### Example 2: Sleep-Focused Request
```python
sleep_request = {
    "health_goal": "improve sleep quality",
    "specific_needs": ["better sleep", "stress reduction"],
    "current_issues": ["insomnia", "work stress"],
    "preferences": ["natural methods", "no medication"]
}
```

**Result**: WellnessBuddy primarily consults SleepyJoe, with optional DietKing for sleep-friendly nutrition.

## Technical Implementation

### ACP Job Creation
```python
async def _create_agent_job(self, agent_type: AgentType, requirements: dict) -> str:
    # Find target agent in ACP network
    target_agents = self.acp_client.browse_agents(
        keyword=agent_type.value,
        top_k=1
    )
    
    if target_agents:
        target_agent = target_agents[0]
        offering = target_agent.offerings[0]
        
        # Create ACP job
        job_id = offering.initiate_job(
            service_requirement=requirements,
            evaluator_address=self.env.SELLER_AGENT_WALLET_ADDRESS,
            expired_at=datetime.now() + timedelta(hours=1)
        )
        
        return job_id
```

### Response Synthesis
```python
def _synthesize_acp_responses(self, service_requirements: dict, agent_responses: dict) -> dict:
    synthesis = {
        "wellness_plan": {
            "overview": "Comprehensive wellness plan coordinated through ACP network",
            "primary_coordinator": "WellnessBuddy",
            "consulting_agents": list(agent_responses.keys()),
            "user_requirements": service_requirements
        },
        "agent_contributions": agent_responses,
        "integrated_recommendations": {
            "nutrition": agent_responses.get("DietKing", {}).get("nutrition_plan"),
            "fitness": agent_responses.get("GymBro", {}).get("workout_plan"),
            "sleep": agent_responses.get("SleepyJoe", {}).get("sleep_plan")
        }
    }
    return synthesis
```

## Benefits Over Traditional LLM Coordination

### 1. Economic Incentives
- Agents are paid for their expertise
- Quality is incentivized through reputation and earnings
- Sustainable ecosystem for agent development

### 2. Decentralization
- No central coordinator needed
- Agents can operate independently
- Network effects through agent discovery

### 3. Transparency
- All transactions visible on blockchain
- Auditable agent interactions
- Trust through smart contracts

### 4. Scalability
- Any agent can hire any other agent
- No limit on coordination complexity
- Network grows organically

### 5. Specialization
- Agents can focus on specific domains
- Expertise is monetized
- Quality specialization is rewarded

## Future Enhancements

### 1. Advanced Job Monitoring
- Real-time job status tracking
- Automatic retry mechanisms
- Quality assurance protocols

### 2. Dynamic Pricing
- Market-based pricing for services
- Supply and demand adjustments
- Reputation-based pricing

### 3. Multi-Agent Auctions
- Competitive bidding for complex tasks
- Quality-price optimization
- Market efficiency

### 4. Cross-Chain Integration
- Multi-chain agent coordination
- Cross-chain payments
- Interoperable agent networks

## Troubleshooting

### Common Issues

1. **Agent Not Found**
   - Ensure agent is registered on ACP network
   - Check wallet addresses and entity IDs
   - Verify network configuration (testnet vs mainnet)

2. **Job Creation Failed**
   - Check USDC balance for job creation
   - Verify agent offerings are available
   - Ensure proper wallet permissions

3. **Response Timeout**
   - Check if specialist agents are running
   - Verify network connectivity
   - Monitor job status in ACP dashboard

### Debug Commands
```bash
# Test agent discovery
python test_acp_agent_coordination.py

# Check agent status
python -c "from virtuals_acp import VirtualsACP; acp = VirtualsACP(); print(acp.browse_agents(keyword='WellnessBuddy'))"

# Monitor job status
# (Use ACP dashboard or API)
```

## Conclusion

This ACP agent-to-agent coordination system represents a significant advancement in decentralized AI coordination. By combining economic incentives with specialized expertise, we create a sustainable ecosystem where agents can collaborate, compete, and provide value to users through transparent, on-chain transactions.

The system demonstrates how blockchain technology can enable truly decentralized AI coordination, where each agent is economically incentivized to provide high-quality, specialized services while maintaining autonomy and transparency.
