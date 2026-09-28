#!/usr/bin/env bash
set -e

echo "========================================================"
echo "          RecallAI: Unified Production Deployer"
echo "========================================================"
echo ""

# 1. Install frontend dependencies and build production SPA bundle
echo "[1/4] Building React frontend production bundle..."
cd frontend
npm install --silent
npm run build
cd ..

# 2. Setup Python environment
echo "[2/4] Setting up Python dependencies..."
python3 -m pip install --quiet --upgrade pip
python3 -m pip install --quiet -r backend/requirements.txt

# 3. Ensure .env exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "[3/4] Created .env from .env.example"
    fi
fi

# 4. Launch unified web application
PORT=${PORT:-8000}
HOST=${HOST:-0.0.0.0}

echo "[4/4] Starting Unified Main Web on http://${HOST}:${PORT} ..."
export PYTHONPATH="."
exec python3 -m uvicorn backend.app.main:app --host "${HOST}" --port "${PORT}"
