#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Cleaning up port $port (PID: $pid)..."
        kill -9 $pid 2>/dev/null
    fi
}

# Cleanup existing processes
echo "Checking for existing processes..."
kill_port 8000
kill_port 3000

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
    echo -e "\nStopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill_port 8000
    kill_port 3000
    exit
}

trap cleanup SIGINT SIGTERM

echo "Servers are running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop."

wait
