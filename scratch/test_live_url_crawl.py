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
print("TESTING LIVE URL WEB INGESTION & IMMEDIATE RETRIEVAL")
print("="*70)

# 1. Ingest a live public webpage
target_url = "https://raw.githubusercontent.com/psf/requests/main/README.md"
print(f"CRAWLING & INGESTING: {target_url}...")

try:
    crawl_payload = {
        "url": "https://en.wikipedia.org/wiki/HTTP_404",
        "category": "Web & Server Protocols",
        "product": "HTTP Server Protocol"
    }
    crawl_res = make_request("crawler/ingest-url", data=crawl_payload, method="POST")
    print("\n✓ URL Ingested Successfully:")
    print("Article ID:", crawl_res.get("article_id"))
    print("Title:", crawl_res.get("title"))
    print("Extracted Steps:", len(crawl_res.get("steps", [])))
    print("Summary:", crawl_res.get("summary")[:150] + "...")

    # 2. Ask RecallAI about HTTP 404
    chat_payload = {
        "customerId": "cust_sarah",
        "message": "I am getting an HTTP 404 Not Found error on my server"
    }
    chat_res = make_request("chat", data=chat_payload, method="POST")
    print("\n[CUSTOMER QUERY]: I am getting an HTTP 404 Not Found error on my server")
    print(f"[RECALLAI RESPONSE]:\n{chat_res.get('message', chat_res.get('reply', ''))}")
    print(f"[MEMORY BADGES]: {[m['title'] for m in chat_res.get('memory_used', [])]}")

except Exception as e:
    print(f"URL Ingestion Error: {e}")

print("\n" + "="*70)
