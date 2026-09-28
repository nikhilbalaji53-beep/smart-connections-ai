import os
import sys

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from .models.base import Base, engine, SessionLocal
from .models.entities import Customer
from .api import customers, memory, chat, tickets, kb, escalation, analytics, demo, live_ws, crawler
from database.seed.seed_data import seed_database

app = FastAPI(
    title="RecallAI — Customer Support That Remembers",
    description="Intelligent AI Customer Support Agent with persistent cross-session customer memory, zero-repetition enforcement, and Microsoft ecosystem architecture.",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(customers.router, prefix="/api")
app.include_router(memory.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(kb.router, prefix="/api")
app.include_router(crawler.router, prefix="/api")
app.include_router(escalation.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(demo.router, prefix="/api")
app.include_router(live_ws.router)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # If no customers exist, seed database automatically
    if db.query(Customer).count() == 0:
        print("[RecallAI] Initializing empty database with realistic enterprise seed data...")
        seed_database()
    db.close()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RecallAI Backend Engine",
        "version": "1.0.0",
        "memory_subsystem": "online",
        "zero_repetition_guard": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
