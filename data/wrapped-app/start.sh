#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Start the backend
echo "Starting backend..."
cd "$SCRIPT_DIR/backend"
"$SCRIPT_DIR/venv/bin/uvicorn" main:app --reload --port 8000 &
BACKEND_PID=$!

# Start the frontend
echo "Starting frontend..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Function to handle exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

trap cleanup SIGINT SIGTERM

wait
