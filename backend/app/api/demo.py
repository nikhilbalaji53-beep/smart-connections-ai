import os
import sys

root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import APIRouter
from database.seed.seed_data import seed_database

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/reset")
def reset_demo():
    seed_database()
    return {"status": "success", "message": "RecallAI database reset and seeded with 5 enterprise customers, 15 tickets, and full memory profiles."}

@router.get("/scenarios")
def get_demo_scenarios():
    return [
        {
            "id": "scenario_marcus",
            "name": "Marcus Vance (Contoso Ltd.) - Pipeline Timeout",
            "customer_id": "cust_marcus",
            "role": "Principal DevOps Engineer",
            "prompt": "It's happening again on runner-03. Same timeout error as Tuesday. Fix this.",
            "description": "Tests Critical Frustration (8.5/10), rules out 120m timeout and daemon restart, diagnoses Linux systemd memory throttling & dead containers on Ubuntu 22.04 LTS.",
            "expected_avoidance": ["Increasing pipeline timeout limit to 120m", "Restarting agent daemon service"],
            "expected_environment": "Ubuntu 22.04 LTS / Docker 24.0.7 / runner-03"
        },
        {
            "id": "scenario_sarah",
            "name": "Sarah Jenkins (Fabrikam) - App Crash on Update",
            "customer_id": "cust_sarah",
            "role": "Lead Product Manager",
            "prompt": "My application keeps crashing again after updating this morning.",
            "description": "Tests Zero Repetition, links Ticket #1042 / #1187, rules out local cache clearing & reinstalling, prescribes GPU shader cache purge for Windows 11.",
            "expected_avoidance": ["Clearing local cache", "Full application reinstallation"],
            "expected_environment": "Windows 11 Enterprise (23H2) / v4.2.0"
        },
        {
            "id": "scenario_david",
            "name": "David Chen (Northwind Cloud) - Azure AD Sync Latency",
            "customer_id": "cust_david",
            "role": "Systems Architect",
            "prompt": "The delta sync cycle on DC-01 is lagging past 45 minutes again.",
            "description": "Tests architectural memory, recalls previous delta sync throttle bypass, runs ADSyncScheduler validation on Windows Server 2022.",
            "expected_avoidance": ["Local network MTU inspection"],
            "expected_environment": "Windows Server 2022 / Azure AD Connect v2.1.20"
        },
        {
            "id": "scenario_elena",
            "name": "Elena Rostova (Trey Research) - Webhook SSL Timeout",
            "customer_id": "cust_elena",
            "role": "Senior Backend Lead",
            "prompt": "Our webhook outbound callbacks are timing out during the TLS handshake again.",
            "description": "Rules out disabling HTTP keep-alive, tests intermediate CA chain verification with openssl for macOS / Node.js 20.",
            "expected_avoidance": ["Disabling HTTP keep-alive"],
            "expected_environment": "macOS Sonoma 14.4 / Node.js 20 LTS"
        },
        {
            "id": "scenario_alex",
            "name": "Alex Rivera (Woodgrove) - Database Pool Exhaustion",
            "customer_id": "cust_alex",
            "role": "Data Infrastructure Lead",
            "prompt": "We are getting connection pool exhaustion on the analytics cluster right now.",
            "description": "Strictly rules out raising max_connections (previously triggered kernel OOM), targets PgBouncer SHOW POOLS and idle-in-transaction timeout.",
            "expected_avoidance": ["Raising max_connections in postgresql.conf"],
            "expected_environment": "Debian 12 / PostgreSQL 16.2 / PgBouncer 1.21"
        }
    ]
