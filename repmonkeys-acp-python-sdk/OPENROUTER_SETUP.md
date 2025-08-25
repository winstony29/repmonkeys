# 🤖 OpenRouter Integration for Multi-Agent LLM Coordination

This guide explains how to set up and use OpenRouter for multi-agent LLM coordination in your Virtuals ACP wellness platform.

## 📋 What is OpenRouter?

[OpenRouter](https://openrouter.ai/docs/quickstart) is a unified API that provides access to hundreds of AI models through a single endpoint. It automatically handles fallbacks and selects the most cost-effective options.

### Key Benefits:
- **Multiple Models**: Access GPT-4, Claude, Llama, Gemini, and more
- **Cost Optimization**: Automatic model selection for best price/performance
- **Fallback Handling**: Seamless switching between models
- **Unified API**: Single endpoint for all models

## 🚀 Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to your API keys section
4. Create a new API key
5. Copy the key (starts with `sk-or-`)

### 2. Configure Environment

Add your OpenRouter API key to your `.env` file:

```env
# AI/LLM Configuration
OPENROUTER_API_KEY=sk-or-your-actual-api-key-here
```

### 3. Install Dependencies

The required dependencies are already included in `pyproject.toml`:

```bash
pip install openai
```

## 🔧 Configuration Changes Made

### Updated Files:

1. **`multi_agent_coordinator.py`**
   - Changed from direct OpenAI to OpenRouter
   - Updated client initialization
   - Added OpenRouter-specific headers
   - Changed model from `gpt-4` to `openai/gpt-4o`

2. **`enhanced_seller_with_coordination.py`**
   - Updated environment variable reference
   - Changed initialization parameter name

3. **`multi_agent_examples.py`**
   - Updated all coordinator initializations
   - Changed API key parameter names

4. **`.env`**
   - Updated environment variable name

## 🧪 Testing the Integration

### Run the Test Suite

```bash
python test_openrouter_integration.py
```

This will test:
- ✅ Basic OpenRouter connection
- ✅ Multi-agent coordination
- ✅ Model availability (GPT-4, Claude, Llama, Gemini)

### Expected Output

```
🚀 OpenRouter Integration Test Suite
============================================================
🔗 Testing OpenRouter Integration
==================================================
✅ MultiAgentCoordinator initialized successfully
🔄 Testing multi-agent coordination...
✅ Coordination test completed successfully!
📋 Integrated plan generated successfully
🎯 Priority actions identified

🤖 Testing OpenRouter Model Availability
==================================================
✅ openai/gpt-4o: Hello from OpenRouter!
✅ anthropic/claude-3.5-sonnet: Hello from OpenRouter!
✅ meta-llama/llama-3.1-8b-instruct: Hello from OpenRouter!
✅ google/gemini-pro: Hello from OpenRouter!

📊 Test Summary
==============================
Connection Test: ✅ PASS
Models Test: ✅ PASS

🎉 All tests passed! OpenRouter integration is working correctly.
```

## 🎯 Using the Enhanced System

### 1. Run Enhanced Seller

```bash
python enhanced_seller_with_coordination.py
```

### 2. Run Multi-Agent Examples

```bash
python multi_agent_examples.py
```

### 3. Test with Your ACP Setup

```bash
# Terminal 1: Run enhanced seller
python enhanced_seller_with_coordination.py

# Terminal 2: Run buyer to test coordination
python test_multi_agents.py
```

## 🔄 Available Models

OpenRouter provides access to many models. The system is configured to use:

- **Primary**: `openai/gpt-4o` (GPT-4 Omni)
- **Alternative**: `anthropic/claude-3.5-sonnet`
- **Budget**: `meta-llama/llama-3.1-8b-instruct`
- **Fast**: `google/gemini-pro`

## 💡 Advanced Configuration

### Custom Model Selection

You can modify the model in `multi_agent_coordinator.py`:

```python
response = await asyncio.to_thread(
    self.client.chat.completions.create,
    model="anthropic/claude-3.5-sonnet",  # Change model here
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,
    extra_headers={
        "HTTP-Referer": "https://virtuals-acp-wellness.com",
        "X-Title": "Virtuals ACP Wellness Platform",
    }
)
```

### Model Routing

OpenRouter automatically routes to the best available model. You can also specify fallbacks:

```python
models = [
    "openai/gpt-4o",
    "anthropic/claude-3.5-sonnet", 
    "meta-llama/llama-3.1-8b-instruct"
]
```

## 🛠️ Troubleshooting

### Common Issues:

1. **API Key Not Found**
   ```
   ❌ OPENROUTER_API_KEY not found in environment
   ```
   **Solution**: Add your API key to `.env` file

2. **Model Not Available**
   ```
   ❌ openai/gpt-4o: Model not found
   ```
   **Solution**: Check OpenRouter model availability or use alternative model

3. **Rate Limiting**
   ```
   ❌ Rate limit exceeded
   ```
   **Solution**: Check your OpenRouter usage limits

4. **Network Issues**
   ```
   ❌ Connection timeout
   ```
   **Solution**: Check internet connection and OpenRouter status

### Debug Mode

Enable debug logging by modifying the coordinator:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Cost Optimization

OpenRouter provides cost optimization features:

- **Automatic Fallbacks**: Cheaper models when expensive ones fail
- **Usage Analytics**: Monitor costs in OpenRouter dashboard
- **Model Selection**: Choose models based on cost/performance needs

## 🔗 Resources

- [OpenRouter Documentation](https://openrouter.ai/docs/quickstart)
- [Available Models](https://openrouter.ai/models)
- [API Reference](https://openrouter.ai/docs/api)
- [Pricing](https://openrouter.ai/pricing)

## 🎉 Next Steps

1. **Test the integration**: Run `python test_openrouter_integration.py`
2. **Start using**: Run your enhanced seller with coordination
3. **Monitor usage**: Check OpenRouter dashboard for usage analytics
4. **Optimize costs**: Adjust model selection based on performance needs

Your multi-agent LLM coordination system is now powered by OpenRouter! 🚀

