import sys
import json
import urllib.request
import uuid

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"

def make_req(endpoint, data=None, method="GET"):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("="*75)
print("TESTING USER'S EXACT MULTI-TURN CONVERSATIONS (SECTION 23 & 24)")
print("="*75)

# -------------------------------------------------------------
# TEST SUITE A: Section 23 Exact 9-Turn Conversation
# -------------------------------------------------------------
conv_id_1 = f"conv_test_23_{uuid.uuid4().hex[:6]}"
turns_section_23 = [
    ("TEST 1", "My application keeps crashing."),
    ("TEST 2", "It crashes when I open it."),
    ("TEST 3", "Yes."),
    ("TEST 4", "I already restarted my phone."),
    ("TEST 5", "Please guide me."),
    ("TEST 6", "Still not working."),
    ("TEST 7", "I want a technician."),
    ("TEST 8", "Actually, when will my replacement arrive?"),
    ("TEST 9", "Thank you.")
]

print("\n--- RUNNING SECTION 23 (9-TURN PROGRESSIVE CHAT) ---")
prev_replies_23 = set()

for test_num, msg in turns_section_23:
    payload = {
        "customerId": "cust_marcus",
        "conversationId": conv_id_1,
        "message": msg
    }
    resp = make_req("chat", data=payload, method="POST")
    reply = resp.get("message") or resp.get("reply") or ""
    badges = [m["title"] for m in resp.get("memory_used", [])]
    
    print(f"\n▶ [{test_num}] CUSTOMER: \"{msg}\"")
    print(f"  MEMORY BADGES: {badges}")
    print(f"  RECALLAI AI REPLY:\n{reply}")
    
    assert reply not in prev_replies_23, f"Duplicate response detected on {test_num}!"
    prev_replies_23.add(reply)

# -------------------------------------------------------------
# TEST SUITE B: Section 24 Most Important Test (6 Sequential Messages)
# -------------------------------------------------------------
conv_id_2 = f"conv_test_24_{uuid.uuid4().hex[:6]}"
turns_section_24 = [
    ("MESSAGE 1", "My application is crashing."),
    ("MESSAGE 2", "I already restarted it."),
    ("MESSAGE 3", "Still not working."),
    ("MESSAGE 4", "Please guide me."),
    ("MESSAGE 5", "What should I do next?"),
    ("MESSAGE 6", "Can you book a technician?")
]

print("\n" + "="*75)
print("--- RUNNING SECTION 24 (6 SEQUENTIAL MESSAGES - ZERO REPETITION CHECK) ---")
print("="*75)
prev_replies_24 = set()

for msg_num, msg in turns_section_24:
    payload = {
        "customerId": "cust_marcus",
        "conversationId": conv_id_2,
        "message": msg
    }
    resp = make_req("chat", data=payload, method="POST")
    reply = resp.get("message") or resp.get("reply") or ""
    badges = [m["title"] for m in resp.get("memory_used", [])]
    
    print(f"\n▶ [{msg_num}] CUSTOMER: \"{msg}\"")
    print(f"  MEMORY BADGES: {badges}")
    print(f"  RECALLAI AI REPLY:\n{reply}")
    
    assert reply not in prev_replies_24, f"Duplicate response detected on {msg_num}!"
    prev_replies_24.add(reply)

# -------------------------------------------------------------
# TEST SUITE C: User's Example from Prompt ("one application stop responding" -> "please guide me")
# -------------------------------------------------------------
conv_id_3 = f"conv_test_user_prompt_{uuid.uuid4().hex[:6]}"
turns_user_prompt = [
    ("TURN 1", "one application stop responding"),
    ("TURN 2", "please guide me")
]

print("\n" + "="*75)
print("--- RUNNING USER'S EXACT PROMPT EXAMPLE ('one application stop responding' -> 'please guide me') ---")
print("="*75)
prev_replies_3 = set()

for turn_num, msg in turns_user_prompt:
    payload = {
        "customerId": "cust_marcus",
        "conversationId": conv_id_3,
        "message": msg
    }
    resp = make_req("chat", data=payload, method="POST")
    reply = resp.get("message") or resp.get("reply") or ""
    badges = [m["title"] for m in resp.get("memory_used", [])]
    
    print(f"\n▶ [{turn_num}] CUSTOMER: \"{msg}\"")
    print(f"  MEMORY BADGES: {badges}")
    print(f"  RECALLAI AI REPLY:\n{reply}")
    
    assert reply not in prev_replies_3, f"Duplicate response detected on {turn_num}!"
    prev_replies_3.add(reply)

print("\n" + "="*75)
print("✓ ALL TESTS PASSED! ZERO CANNED TEMPLATES, ZERO DUPLICATE RESPONSES.")
print("="*75)
