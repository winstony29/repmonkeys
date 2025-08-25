# AI Wellness Integration with repmonkeys-acp-python-sdk

This integration replaces the hardcoded AI responses in the WellSpace frontend with intelligent, multi-agent coordinated responses using the repmonkeys-acp-python-sdk.

## 🎯 What This Integration Does

- **Replaces Hardcoded Responses**: No more static wellness advice
- **Multi-Agent Coordination**: Uses GymBro, DietKing, SleepyJoe, and WellnessBuddy agents
- **Intelligent Analysis**: Analyzes user messages to determine the best agent to consult
- **Fallback System**: Gracefully falls back to hardcoded responses if the AI system is unavailable
- **Maintains UI/UX**: Keeps the exact same frontend experience and format

## 🏗️ Architecture

```
Frontend (React) → API Route (/api/ai-wellness) → Python Script (ai_wellness_api.py) → Multi-Agent Coordinator → AI Agents
```

### Components

1. **Frontend Changes**: Modified `LandingPage.tsx` to call the new API
2. **API Route**: New `/api/ai-wellness` endpoint in Next.js
3. **Python Integration**: `ai_wellness_api.py` script that coordinates with the SDK
4. **Multi-Agent System**: Uses the existing repmonkeys-acp-python-sdk agents

## 🚀 Setup Instructions

### 1. Install Python Dependencies

**Requirements: Python 3.9 or higher**

```bash
cd repmonkeys-acp-python-sdk
./setup.sh
```

Or manually:

```bash
pip3 install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `repmonkeys-acp-python-sdk` directory:

```bash
cp env.example .env
```

Edit `.env` and add your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Test the Integration

```bash
# Test the Python script directly
python3 ai_wellness_api.py '{"user_message": "I need workout advice", "user_goals": [], "user_profile": {}}'

# Test the API endpoint
curl -X POST http://localhost:3000/api/ai-wellness \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "I need workout advice", "userGoals": [], "userProfile": {}}'
```

## 🔧 How It Works

### 1. User Input
When a user types a wellness question, the frontend:
- Shows the thinking progress animation (GymBro, DietKing, SleepyJoe thinking)
- Calls the `/api/ai-wellness` endpoint
- Passes user message, goals, and profile data

### 2. AI Analysis
The Python script:
- Analyzes the user message to determine wellness topics
- Identifies the primary agent (GymBro, DietKing, SleepyJoe, or WellnessBuddy)
- Determines which other agents should be consulted
- Creates a coordination request

### 3. Multi-Agent Response
The system:
- Coordinates responses from multiple specialist agents
- Synthesizes the information into a comprehensive plan
- Returns structured, personalized wellness advice

### 4. Frontend Display
The response is:
- Formatted and displayed in the existing chat interface
- Maintains the same visual style and user experience
- Shows which agents contributed to the response

## 🎨 Agent Specializations

| Agent | Specialties | When Consulted |
|-------|-------------|----------------|
| **GymBro** | Fitness, workouts, strength training | Exercise-related questions |
| **DietKing** | Nutrition, meal planning, diet | Food and nutrition questions |
| **SleepyJoe** | Sleep optimization, rest, circadian rhythm | Sleep-related questions |
| **WellnessBuddy** | General wellness, stress management | General health questions |

## 🔄 Fallback System

If the AI system is unavailable, the integration gracefully falls back to:
1. **API Fallback**: Returns a structured fallback response
2. **Hardcoded Fallback**: Uses the original `generateSmasherResponse` function
3. **Error Handling**: Shows appropriate error messages to users

## 📊 Response Format

The AI system returns structured responses:

```json
{
  "coordinator": "Smasher",
  "status": "completed",
  "primary_agent": "GymBro",
  "consulting_agents": ["DietKing", "SleepyJoe"],
  "message": "🎯 Comprehensive wellness plan delivered by GymBro with consultation from DietKing, SleepyJoe",
  "recommendations": {
    "primary": {
      "title": "GymBro Analysis",
      "content": "Detailed workout and fitness advice...",
      "agent": "GymBro"
    }
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

1. **Python Script Not Found**
   - Ensure the script path is correct in the API route
   - Check that the script is executable

2. **Import Errors**
   - Install all required dependencies: `pip3 install -r requirements.txt`
   - Check Python version (requires 3.10+)

3. **API Key Issues**
   - Verify your OpenRouter API key is correct
   - Check the `.env` file exists and is properly formatted

4. **Timeout Errors**
   - The API has a 30-second timeout
   - Check if the AI coordination is taking too long

### Debug Mode

Enable debug logging by checking the browser console and Python script output.

## 🔮 Future Enhancements

- **Real-time Agent Status**: Show which agents are online/offline
- **Agent Selection**: Allow users to choose which agents to consult
- **Response History**: Store and retrieve previous AI responses
- **Custom Agent Training**: Fine-tune agents for specific wellness domains

## 📚 Additional Resources

- [repmonkeys-acp-python-sdk README](./README.md)
- [Multi-Agent Coordinator](./multi_agent_coordinator.py)
- [Smasher Coordinator](./smasher_coordinator.py)
- [OpenRouter Setup Guide](./OPENROUTER_SETUP.md)

## 🤝 Contributing

To improve the AI integration:

1. Test with different types of wellness questions
2. Optimize agent coordination logic
3. Enhance response formatting
4. Add new agent specializations

## 📄 License

This integration is part of the WellSpace project and follows the same licensing terms.
