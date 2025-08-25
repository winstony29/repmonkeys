# 🚀 Quick Start: AI Wellness Integration

Get the AI wellness integration running in 5 minutes!

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
cd repmonkeys-acp-python-sdk
pip3 install -r requirements.txt
```

### 2. Set API Key
```bash
cp env.example .env
# Edit .env and add your OpenRouter API key
echo "OPENROUTER_API_KEY=your_key_here" > .env
```

### 3. Test the Integration
```bash
python3 test_integration.py
```

### 4. Start Your Frontend
```bash
# In another terminal, from the project root
pnpm dev
```

## 🔑 Get OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and get your API key
3. Add it to the `.env` file

## 🧪 Test It Out

1. Open your browser to `http://localhost:3000`
2. Go to the wellness chat
3. Ask a question like "I need workout advice"
4. Watch the AI agents coordinate a response!

## 🆘 Troubleshooting

**"Python script not found"**
- Make sure you're in the right directory
- Check the script path in `/api/ai-wellness/route.ts`

**"Import errors"**
- Run `pip3 install -r requirements.txt`
- Check Python version (needs 3.10+)

**"API key issues"**
- Verify your `.env` file exists
- Check the API key is correct

## 📚 What Happens Now

- ✅ **Hardcoded responses removed** - No more static advice
- ✅ **AI-powered responses** - Real intelligence from multiple agents
- ✅ **Same UI/UX** - Frontend looks identical
- ✅ **Fallback system** - Works even if AI is down

## 🎯 Next Steps

1. **Customize agents** - Modify agent specializations
2. **Add new agents** - Create domain-specific wellness experts
3. **Optimize responses** - Fine-tune the coordination logic
4. **Monitor usage** - Track AI response quality and user satisfaction

## 🆘 Need Help?

- Check the [AI Integration README](./AI_INTEGRATION_README.md)
- Run `python3 test_integration.py` for diagnostics
- Look at the browser console for frontend errors

---

**🎉 You're all set!** The AI wellness integration is now active and ready to provide intelligent, personalized wellness advice.
