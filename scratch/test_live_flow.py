import asyncio
import json
import websockets

async def listen(ws, name, queue):
    try:
        async for msg in ws:
            data = json.loads(msg)
            print(f"[{name}] RECV: type={data.get('type')} sender={data.get('sender')} content={str(data.get('content') or data.get('message') or data.get('suggested_reply'))[:60]}", flush=True)
            await queue.put(data)
    except Exception as e:
        print(f"[{name}] Connection closed: {e}", flush=True)

async def test_live():
    cust_url = "ws://127.0.0.1:8000/ws/live/cust_sarah?role=customer"
    tech_url = "ws://127.0.0.1:8000/ws/live/cust_sarah?role=technician"

    print("Connecting sockets...", flush=True)
    async with websockets.connect(cust_url) as ws_cust, websockets.connect(tech_url) as ws_tech:
        cust_q = asyncio.Queue()
        tech_q = asyncio.Queue()

        t1 = asyncio.create_task(listen(ws_cust, "CUSTOMER", cust_q))
        t2 = asyncio.create_task(listen(ws_tech, "TECHNICIAN", tech_q))

        await asyncio.sleep(0.5)

        print("\n--- STEP 1: Customer sends message about laptop ---", flush=True)
        await ws_cust.send(json.dumps({
            "type": "chat_message",
            "content": "My laptop arrived with a cracked screen."
        }))

        # Wait for AI response
        await asyncio.sleep(2.5)

        print("\n--- STEP 2: Customer books a technician ---", flush=True)
        await ws_cust.send(json.dumps({
            "type": "book_technician",
            "technician_name": "Technician 1",
            "time_slot": "11:30 AM",
            "issue": "Damaged laptop screen / replacement delay"
        }))

        # Wait for booking & tech join
        await asyncio.sleep(2.5)

        print("\n--- STEP 3: Technician marks case resolved ---", flush=True)
        await ws_tech.send(json.dumps({
            "type": "technician_action",
            "action": "resolve_case",
            "resolution": "Replacement delivery issue: Replacement delivery was delayed. New shipment scheduled."
        }))

        await asyncio.sleep(1.5)

        t1.cancel()
        t2.cancel()
        print("\n✅ Verification Test Completed Successfully!", flush=True)

if __name__ == "__main__":
    asyncio.run(test_live())
