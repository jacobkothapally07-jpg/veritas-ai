#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================================="
echo "  🛡️ VERITAS AI — AUTONOMOUS MULTI-ENGINE TECH DUE DILIGENCE AUDITOR"
echo "  ⚡ Built for SerpApi India Hackathon 2026 (Track: AI Agents)"
echo "=========================================================================="

# Check for virtual environment
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtualenv..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# Clean up any lingering processes on ports 8088 and 5173
lsof -ti:8088 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo ""
echo "🚀 Starting FastAPI Backend on http://localhost:8088..."
backend/venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8088 --app-dir backend &
BACKEND_PID=$!

echo "🚀 Starting Vite React Frontend on http://localhost:5173..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================================================="
echo "  ✅ VERITAS AI IS LIVE!"
echo "  🌐 Web Dashboard   : http://localhost:5173"
echo "  📡 API OpenAPI Docs : http://localhost:8088/docs"
echo "  🛑 Press Ctrl+C to stop all services"
echo "=========================================================================="

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM EXIT
wait
