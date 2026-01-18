#!/bin/bash

# Start the backend
echo "Starting backend..."
cd backend
../venv/bin/uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Start the frontend
echo "Starting frontend..."
cd ../frontend
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
