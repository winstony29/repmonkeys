#!/usr/bin/env bash

# Debug: Print current directory and environment (redirect to stderr)
echo "Debug: Current directory: $(pwd)" >&2
echo "Debug: Python version: $(python3.12 --version 2>/dev/null || echo 'Python3.12 not found')" >&2
echo "Debug: Virtual env: $VIRTUAL_ENV" >&2

# Activate virtual environment and run smasher_coordinator.py
cd "$(dirname "$0")"
source venv/bin/activate

# Debug: Check if activation worked (redirect to stderr)
echo "Debug: After activation, Python: $(which python3.12)" >&2

# Run the script with the provided arguments and capture only stdout (JSON response)
python3.12 smasher_coordinator.py "$@" 2>&1 | grep -v "^Debug:" | grep -v "^\[Smasher\]" | grep -v "^Connected to room" | grep -v "^🚀 Smasher Wellness Coordinator" | grep -v "^Specialist agents:" | grep -v "^Evaluator:" | grep -v "^Processing direct user input:" | grep -v "^\[Smasher\] Response saved to:"
