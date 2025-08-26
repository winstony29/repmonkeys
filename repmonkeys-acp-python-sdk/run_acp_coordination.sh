#!/usr/bin/env bash

# Debug: Print current directory and environment (redirect to stderr)
echo "Debug: Current directory: $(pwd)" >&2
echo "Debug: Python version: $(python3.12 --version 2>/dev/null || echo 'Python3.12 not found')" >&2
echo "Debug: Virtual env: $VIRTUAL_ENV" >&2

# Activate virtual environment and run test_acp_agent_coordination.py
cd "$(dirname "$0")"
source venv/bin/activate

# Debug: Check if activation worked (redirect to stderr)
echo "Debug: After activation, Python: $(which python3.12)" >&2

# Run the script with the provided arguments and capture only stdout (JSON response)
python3.12 test_acp_agent_coordination.py "$@" 2>&1 | grep -v "^Debug:" | grep -v "^🎯 Generating personalized wellness plan..." | grep -v "^🚀 AI Wellness Assistant" | grep -v "^=" | grep -v "^Powered by" | grep -v "^📝 User Request:" | grep -v "^🎯 Goals:" | grep -v "^👤 Profile:" | grep -v "^🔄 Coordinating with specialist agents" | grep -v "^💪 GymBro is thinking" | grep -v "^   →" | grep -v "^   ✅" | grep -v "^🥗 DietKing is thinking" | grep -v "^😴 SleepyJoe is thinking" | grep -v "^🌟 WellnessBuddy is compiling" | grep -v "^📄 Wellness plan saved to:"
