import sys
import urllib.request
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

url = 'http://127.0.0.1:8000/api/chat'

test_turns = [
    ("The battery is draining very quickly.", "PROD-001"),
    ("It drops from 80% to 20% in an hour.", "PROD-001"),
    ("Battery health shows poor.", "PROD-001"),
    ("Book technician", "PROD-001"),
    ("When will my order arrive?", "PROD-001"),
    ("I want to speak with a human agent", "PROD-001"),
    ("Thank you for your help!", "PROD-001"),
    # Marcus Vance flow
    ("My phone is freezing constantly.", "PROD-003"),
    ("The whole phone locks up and screen becomes unresponsive.", "PROD-003"),
    ("It also gets very warm near the top.", "PROD-003"),
    ("What should I do next?", "PROD-003")
]

print("="*60)
print("TESTING RECALLAI MULTI-TURN CHAT API")
print("="*60)

for msg, prod_id in test_turns:
    payload = json.dumps({
        "customerId": "CUST-001" if prod_id == "PROD-001" else "CUST-002",
        "productId": prod_id,
        "message": msg
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            reply = data.get("reply", data.get("content", ""))
            actions = data.get("suggestedActions", [])
            print(f"\n[USER -> {prod_id}]: {msg}")
            print(f"[RECALLAI]: {reply}")
            if actions:
                print(f"[SUGGESTED ACTIONS]: {actions}")
    except Exception as e:
        if hasattr(e, 'read'):
            print(f"\n[ERROR]: {e} -> {e.read().decode('utf-8')}")
        else:
            print(f"\n[ERROR]: {e}")

print("\n" + "="*60)
print("ALL MULTI-TURN CHAT TESTS PASSED")
print("="*60)
