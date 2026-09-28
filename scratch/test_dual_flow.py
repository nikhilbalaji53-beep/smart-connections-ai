import asyncio
import json
import websockets

async def test_dual_flow():
    uri = "ws://127.0.0.1:8000/ws/live/cust_marcus"
    
    print("1. Connecting Customer socket...")
    async with websockets.connect(f"{uri}?role=customer") as customer_ws:
        cust_init = json.loads(await customer_ws.recv())
        print(f"   Customer connected: {cust_init.get('status')}")
        
        print("2. Connecting Support Agent socket...")
        async with websockets.connect(f"{uri}?role=agent") as agent_ws:
            agent_init = json.loads(await agent_ws.recv())
            print(f"   Agent connected: {agent_init.get('status')}")
            
            # Drain system announcements
            try:
                msg = await asyncio.wait_for(customer_ws.recv(), timeout=1.0)
                print(f"   Customer received broadcast: {json.loads(msg).get('type')}")
            except asyncio.TimeoutError:
                pass
            
            print("\n3. Customer sending message: 'Hi, my app is crashing again. I already reinstalled it.'")
            await customer_ws.send(json.dumps({
                "type": "customer_message",
                "customer_id": "cust_marcus",
                "content": "Hi, my app is crashing again. I already reinstalled it."
            }))
            
            # Agent should receive:
            # 1. chat_message from customer
            # 2. support_agent_suggestion
            received_chat = False
            received_suggestion = False
            suggestion_payload = None
            
            for _ in range(12):
                raw = await asyncio.wait_for(agent_ws.recv(), timeout=3.0)
                data = json.loads(raw)
                msg_type = data.get("type")
                print(f"   [Agent WS Event] -> type: {msg_type}")
                if msg_type == "chat_message":
                    received_chat = True
                    print(f"      Sender: {data.get('sender')}, Content: {data.get('content')}")
                elif msg_type == "support_agent_suggestion":
                    received_suggestion = True
                    suggestion_payload = data
                    print(f"      Suggested Reply: {data.get('suggested_reply')[:80]}...")
                    print(f"      Analysis: {data.get('analysis')}")
                    print(f"      Why reasons count: {len(data.get('why_reasons', []))}")
                    break
            
            assert received_chat, "Agent did not receive chat_message"
            assert received_suggestion, "Agent did not receive support_agent_suggestion"
            print("\n[OK] SUCCESS: Support Agent received both live message and grounded suggestion!")
            
            print("\n4. Agent sends custom approved reply back to customer...")
            await agent_ws.send(json.dumps({
                "type": "agent_message",
                "customer_id": "cust_marcus",
                "content": "Hi Marcus, I see your reinstall last Tuesday only temporarily resolved the issue. Let's inspect the telemetry dump."
            }))
            
            # Customer should receive the agent's message
            found_agent_reply = False
            for _ in range(15):
                cust_recv = await asyncio.wait_for(customer_ws.recv(), timeout=3.0)
                cust_data = json.loads(cust_recv)
                print(f"   [Customer WS Event] -> type: {cust_data.get('type')}, sender: {cust_data.get('sender')}, sender_name: {cust_data.get('sender_name')}")
                if cust_data.get("sender") == "agent":
                    found_agent_reply = True
                    print(f"   Content: {cust_data.get('content')}")
                    assert cust_data.get("is_internal") is not True, "Customer should NOT receive internal messages"
                    break
            
            assert found_agent_reply, "Customer did not receive agent reply"
            print("\n[OK] SUCCESS: Customer received clean response directly from Sarah (Support Agent)!")

if __name__ == "__main__":
    asyncio.run(test_dual_flow())
