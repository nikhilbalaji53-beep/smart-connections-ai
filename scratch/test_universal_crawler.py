import sys
import json
import urllib.request

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(endpoint, data=None, method="GET"):
    url = f"{BASE_URL}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("="*70)
print("1. SEEDING UNIVERSAL KNOWLEDGE BASE")
print("="*70)
seed_res = make_request("crawler/seed-universal-knowledge", method="POST")
print("Seed Result:", seed_res)

print("\n" + "="*70)
print("2. INGESTING ARBITRARY WEB/DOC KNOWLEDGE (Simulated Apple / Sony repair)")
print("="*70)
custom_manual = {
    "title": "Sony WH-1000XM5 Bluetooth Audio Dropouts & ANC Calibration",
    "content": "Sony WH-1000XM5 wireless noise cancelling headphones may experience audio dropouts due to LDAC 990kbps bit-rate congestion in crowded 2.4GHz Wi-Fi environments or outdated Bluetooth firmware. Resetting the device and setting connection priority to Stable Connection solves the issue.",
    "category": "Audio & Sound",
    "product": "Sony WH-1000XM5",
    "error_codes": "BT_ERR_LDAC_BUFFER_OVERRUN",
    "steps": [
        "Open Sony Headphones Connect app and switch Bluetooth Connection Quality to 'Priority on Stable Connection' (AAC/SBC).",
        "Perform a factory reset: Connect headphone to USB power, then press and hold both the Power and NC/AMB buttons simultaneously for 7+ seconds until the blue LED flashes 4 times.",
        "Delete headphone pairing from host device Bluetooth settings and reboot device.",
        "Re-pair headphone and ensure firmware version is updated to v2.1.0 or higher.",
        "If hardware audio crackling persists, initiate warranty replacement through authorized Sony service."
    ],
    "tags": "sony, wh1000xm5, bluetooth, audio, dropouts, noise cancelling, anc"
}
ingest_res = make_request("crawler/ingest-text", data=custom_manual, method="POST")
print("Ingest Manual Result:", ingest_res)

print("\n" + "="*70)
print("3. EXPORTING MODEL FINE-TUNING DATASET (OpenAI / ChatML format)")
print("="*70)
dataset_res = make_request("crawler/export-dataset")
print(f"Exported {dataset_res['sample_count']} fine-tuning training pairs!")
print("Sample Pair:\n", json.dumps(dataset_res['dataset'][0], indent=2)[:400] + "...\n")

print("\n" + "="*70)
print("4. TESTING UNIVERSAL PROBLEM CHAT QUERIES")
print("="*70)
test_queries = [
    ("My Sony WH-1000XM5 keeps dropping Bluetooth audio connection", "Sony WH-1000XM5"),
    ("My Wi-Fi keeps disconnecting with DNS_PROBE_FINISHED_NO_INTERNET", "PROD-001"),
    ("Smart refrigerator temperature is rising and not cooling", "PROD-001"),
    ("HDMI screen is flickering with black screen", "PROD-001")
]

for q, pid in test_queries:
    chat_payload = {
        "customerId": "cust_sarah",
        "productId": pid,
        "message": q
    }
    chat_res = make_request("chat", data=chat_payload, method="POST")
    print(f"\n[CUSTOMER QUERY]: {q}")
    print(f"[RECALLAI RESPONSE]:\n{chat_res.get('message', chat_res.get('reply', ''))}")
    print(f"[MEMORY BADGES]: {[m['title'] for m in chat_res.get('memory_used', [])]}")
    print("-" * 50)

print("\n" + "="*70)
print("ALL UNIVERSAL KNOWLEDGE CRAWLER & RETRIEVAL TESTS COMPLETED")
print("="*70)
