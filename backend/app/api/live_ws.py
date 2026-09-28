import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..models.base import SessionLocal, get_db
from ..models.entities import (
    Customer,
    Ticket,
    Conversation,
    Message,
    MemoryItem,
    MemoryTimelineEvent
)
from ..ai.orchestrator import AIOrchestrator
from ..retrieval.retriever import IntelligentRetriever
from ..memory.engine import CustomerMemoryEngine

router = APIRouter(tags=["Real-Time Live Support"])

class ConnectionManager:
    def __init__(self):
        # Maps customer_id to active WebSockets (customer, technician, or observer)
        self.active_rooms: Dict[str, Set[WebSocket]] = {}
        # Global technician broadcast sockets
        self.technician_sockets: Set[WebSocket] = {}
        # In-memory live timeline events for active cases
        self.case_timelines: Dict[str, List[Dict]] = {}
        # Track whether technician has joined case
        self.technician_joined: Dict[str, bool] = {}
        # Track suggestion variation index for support console
        self.suggestion_variation_index: Dict[str, int] = {}
        # Track persistent conversation_id per customer room for multi-turn history
        self.active_conversation_id: Dict[str, str] = {}

    def get_time_str(self) -> str:
        return datetime.now().strftime("%I:%M:%S %p")

    async def connect(self, websocket: WebSocket, customer_id: str, role: str):
        await websocket.accept()
        if customer_id not in self.active_rooms:
            self.active_rooms[customer_id] = set()
            self.case_timelines[customer_id] = []
            self.technician_joined[customer_id] = False
            self.suggestion_variation_index[customer_id] = 0

        self.active_rooms[customer_id].add(websocket)
        if role in ["technician", "agent"]:
            if not isinstance(self.technician_sockets, set):
                self.technician_sockets = set()
            self.technician_sockets.add(websocket)

        # Log timeline event
        time_str = self.get_time_str()
        self.case_timelines[customer_id].append({
            "time": time_str,
            "text": f"{role.capitalize()} connected to live session."
        })

    def disconnect(self, websocket: WebSocket, customer_id: str):
        if customer_id in self.active_rooms and websocket in self.active_rooms[customer_id]:
            self.active_rooms[customer_id].remove(websocket)
            if not self.active_rooms[customer_id]:
                del self.active_rooms[customer_id]

        if isinstance(self.technician_sockets, set) and websocket in self.technician_sockets:
            self.technician_sockets.remove(websocket)

    async def broadcast_to_room(self, customer_id: str, message: dict, exclude: Optional[WebSocket] = None):
        if customer_id in self.active_rooms:
            dead_sockets = set()
            for connection in self.active_rooms[customer_id]:
                if connection != exclude:
                    try:
                        await connection.send_text(json.dumps(message, default=str))
                    except Exception:
                        dead_sockets.add(connection)
            for dead in dead_sockets:
                self.active_rooms[customer_id].remove(dead)

    async def broadcast_to_technicians(self, message: dict):
        if isinstance(self.technician_sockets, set):
            dead_sockets = set()
            for connection in self.technician_sockets:
                try:
                    await connection.send_text(json.dumps(message, default=str))
                except Exception:
                    dead_sockets.add(connection)
            for dead in dead_sockets:
                self.technician_sockets.remove(dead)

manager = ConnectionManager()

@router.websocket("/ws/live/{customer_id}")
async def live_support_websocket(websocket: WebSocket, customer_id: str, role: str = "customer"):
    await manager.connect(websocket, customer_id, role)
    db: Session = SessionLocal()

    try:
        # Send initial connection sync payload
        time_str = manager.get_time_str()
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "customer_id": customer_id,
            "role": role,
            "status": "online",
            "technician_joined": manager.technician_joined.get(customer_id, False),
            "timeline": manager.case_timelines.get(customer_id, []),
            "timestamp": time_str
        }))

        while True:
            raw_data = await websocket.receive_text()
            try:
                payload = json.loads(raw_data)
            except Exception:
                continue

            event_type = payload.get("type")
            cur_time = manager.get_time_str()

            # -------------------------------------------------------------
            # 1. CUSTOMER SENDS MESSAGE
            # -------------------------------------------------------------
            if event_type == "customer_message":
                user_msg = (payload.get("message") or payload.get("content") or "").strip()
                if not user_msg:
                    continue

                # 1. Broadcast customer message immediately
                await manager.broadcast_to_room(customer_id, {
                    "type": "chat_message",
                    "sender": "customer",
                    "content": user_msg,
                    "timestamp": cur_time
                })

                # Append to timeline
                manager.case_timelines[customer_id].append({
                    "time": cur_time,
                    "text": f"Customer reported: \"{user_msg[:60]}...\"" if len(user_msg) > 60 else f"Customer reported: \"{user_msg}\""
                })

                # 2. Show progressive understanding pipeline (Section 7 & 10)
                msg_lower = user_msg.lower()
                stages = [
                    "🔍 Checking product information...",
                    "🔍 Checking previous support history...",
                    "✓ Product found",
                    "✓ Order found",
                    "✓ Warranty active",
                    "✓ Previous battery issue found" if ("battery" in msg_lower or "charging" in msg_lower or "laptop" in msg_lower or "sarah" in customer_id.lower()) else "✓ History indexed"
                ]
                for st in stages:
                    await manager.broadcast_to_room(customer_id, {
                        "type": "typing_status",
                        "status": "processing",
                        "message": st
                    })
                    await asyncio.sleep(0.15)

                # 3. Process with AIOrchestrator
                orchestrator = AIOrchestrator(db)
                try:
                    product_payload = payload.get("product_info")
                    conv_id = payload.get("conversation_id") or manager.active_conversation_id.get(customer_id)
                    resp = await orchestrator.generate_response(
                        customer_id=customer_id,
                        user_message=user_msg,
                        conversation_id=conv_id,
                        product_info=product_payload
                    )
                    manager.active_conversation_id[customer_id] = resp.conversation_id

                    ai_reply_time = manager.get_time_str()

                    # Contextual follow-up quick prompts for customer chat (Section 4 & 5)
                    options = []
                    if getattr(resp, "suggested_actions", None):
                        options = resp.suggested_actions
                    elif getattr(resp, "suggestedActions", None):
                        options = resp.suggestedActions
                    elif "poor" in msg_lower:
                        options = ["Yes, book a technician.", "I want to talk to a human."]
                    elif any(w in msg_lower for w in ["80%", "20%", "hour", "minutes"]):
                        options = ["I already checked the battery health. It says poor.", "Book Technician"]
                    elif "battery" in msg_lower and "draining" in msg_lower:
                        options = ["It goes from 80% to 20% in about an hour.", "I already tried the settings you suggested.", "Book Technician"]
                    elif any(w in msg_lower for w in ["tried", "already"]):
                        options = ["Yes, book a technician.", "Talk to a human agent."]
                    elif "charging" in msg_lower or "charge" in msg_lower:
                        options = ["The light is still not turning on.", "Book Technician"]
                    elif "flicker" in msg_lower or "screen" in msg_lower:
                        options = ["It flickers when I tilt the screen.", "Book Technician"]
                    elif "wrong product" in msg_lower:
                        options = ["Schedule return pickup", "Book Technician"]
                    elif any(w in msg_lower for w in ["solve", "can you"]):
                        options = ["Book Technician", "Continue With Support"]
                    elif "thank" in msg_lower:
                        options = []
                    else:
                        options = ["Book Technician", "Continue With Support"]

                    # Extract new memory if user stated key diagnostic facts
                    new_memory = None
                    if "poor" in msg_lower:
                        new_memory = "Battery health check: Poor (Hardware cell degradation)."
                    elif "80" in msg_lower and "20" in msg_lower:
                        new_memory = "Battery drain rate: 80% to 20% in 1 hour."
                    elif "not turning on" in msg_lower or "light is off" in msg_lower:
                        new_memory = "Charger LED indicator remains off after reconnect."
                    elif "charging" in msg_lower:
                        new_memory = "Charging failure reported on Dell Laptop."

                    # Support Console Analysis Data
                    agent_suggestion_data = orchestrator.generate_support_agent_suggestions(
                        customer_id=customer_id,
                        user_message=user_msg,
                        variation_index=0
                    )
                    manager.suggestion_variation_index[customer_id] = 0

                    cust = db.query(Customer).filter(Customer.id == customer_id).first()
                    cust_name = cust.name if cust else "Customer"

                    if product_payload and product_payload.get("name"):
                        prod_name = product_payload.get("name")
                        order_num = product_payload.get("orderNumber", "#N/A")
                        plat_str = f" ({product_payload.get('platform', 'Store')})" if product_payload.get('platform') else ""
                        warranty = product_payload.get("warrantyStatus", "Active")
                    elif cust and "Marcus" in cust.name:
                        prod_name = "Samsung Galaxy Smartphone"
                        order_num = "#FK-98213"
                        plat_str = " (Flipkart)"
                        warranty = "Active"
                    else:
                        prod_name = "Dell Laptop"
                        order_num = "#AMZ-78241"
                        plat_str = " (Amazon)"
                        warranty = "Active"

                    why_reasons = [
                        f"✓ Customer verified: {cust_name}",
                        f"✓ Product identified: {prod_name}",
                        f"✓ Order identified: {order_num}{plat_str}",
                        f"✓ Warranty: {warranty}"
                    ]
                    if "Marcus" in cust_name or "Samsung" in prod_name:
                        why_reasons.extend([
                            "✓ Previous support found: App crashes & system freeze (Ticket #8841)",
                            "✓ Do not repeat previous cache clearing step"
                        ])
                    else:
                        why_reasons.extend([
                            "✓ Previous support found: Battery drain (Resolved)",
                            "✓ Do not repeat previous battery troubleshooting"
                        ])

                    # 4. Broadcast AI Response to Customer & Support Console
                    await manager.broadcast_to_room(customer_id, {
                        "type": "chat_message",
                        "sender": "assistant",
                        "content": resp.message,
                        "timestamp": ai_reply_time,
                        "delivery_status": "Delivered",
                        "options": options,
                        "memory_used": [m.dict() for m in resp.memory_used],
                        "sentiment": resp.sentiment,
                        "sentiment_label": "Possible frustration detected" if resp.sentiment in ["FRUSTRATED", "URGENT"] else "Calm",
                        "failed_solutions_avoided": resp.failed_solutions_avoided,
                        "recommended_action": resp.recommended_action or "Investigate recurring root cause",
                        "why_reasons": why_reasons,
                        "new_memory_detected": new_memory
                    })

                    # Broadcast support agent analysis specifically for Support Console
                    await manager.broadcast_to_room(customer_id, {
                        "type": "support_agent_suggestion",
                        "customer_message": user_msg,
                        "analysis": {
                            "product": prod_name,
                            "order": order_num,
                            "issue": user_msg,
                            "previous_action": agent_suggestion_data["hindsight"]["previous_action"],
                            "previous_result": "Resolved",
                            "current_status": "Active inquiry",
                            "customer_intent": agent_suggestion_data["hindsight"]["intent"],
                            "priority": "High" if resp.sentiment in ["FRUSTRATED", "URGENT"] else "Normal"
                        },
                        "suggested_reply": agent_suggestion_data["suggested_reply"],
                        "why_reasons": why_reasons,
                        "hindsight": (
                            f"HINDSIGHT\n\n"
                            f"Previous problem: {agent_suggestion_data['hindsight']['previous_problem']}\n"
                            f"Action: {agent_suggestion_data['hindsight']['previous_action']}\n"
                            f"Result: Resolved\n\n"
                            f"Current problem: {user_msg}\n"
                            f"Recommendation: {agent_suggestion_data['hindsight']['recommendation']}"
                        ),
                        "previous_troubleshooting": [
                            {"step": "Battery settings adjustment (Ticket #4821)", "result": "Resolved (Software)"},
                            {"step": "Hardware charging verification", "result": "In progress"}
                        ]
                    })

                    # Timeline event
                    manager.case_timelines[customer_id].append({
                        "time": ai_reply_time,
                        "text": f"RecallAI responded with contextual intelligence. Intent: {agent_suggestion_data['hindsight']['intent']}."
                    })

                    # If customer is frustrated or requests technician, alert technician console
                    if resp.sentiment in ["FRUSTRATED", "URGENT"] or "technician" in msg_lower or "poor" in msg_lower:
                        cust = db.query(Customer).filter(Customer.id == customer_id).first()
                        cust_name = cust.name if cust else "Sarah Jenkins"
                        cust_org = cust.organization if cust else "Amazon — Demo"

                        notif_time = manager.get_time_str()
                        notification_payload = {
                            "type": "technician_notification",
                            "priority": "HIGH",
                            "customer_id": customer_id,
                            "customer_name": cust_name,
                            "organization": cust_org,
                            "product": "Dell Laptop",
                            "order": "#AMZ-78241",
                            "issue": user_msg,
                            "reason": "Hardware check required / Battery or charging escalation",
                            "hindsight": agent_suggestion_data["hindsight"]["recommendation"],
                            "timestamp": notif_time
                        }
                        await manager.broadcast_to_technicians(notification_payload)

                        manager.case_timelines[customer_id].append({
                            "time": notif_time,
                            "text": "High-priority technician notification dispatched."
                        })

                except Exception as e:
                    print(f"[RecallAI WS Error] {e}")
                    await manager.broadcast_to_room(customer_id, {
                        "type": "chat_message",
                        "sender": "assistant",
                        "content": f"I understand your issue regarding \"{user_msg}\". I'm reviewing your support history for Dell Laptop (#AMZ-78241) to ensure we avoid repeating previous steps. How can I best assist you next?",
                        "timestamp": cur_time,
                        "delivery_status": "Delivered",
                        "sentiment": "CALM"
                    })

            # -------------------------------------------------------------
            # 1B. SUPPORT CONSOLE REGENERATES SUGGESTION (SECTION 16)
            # -------------------------------------------------------------
            elif event_type == "regenerate_suggestion":
                cust_msg = payload.get("message", "Laptop issue")
                cur_idx = manager.suggestion_variation_index.get(customer_id, 0) + 1
                manager.suggestion_variation_index[customer_id] = cur_idx

                orchestrator = AIOrchestrator(db)
                regen_data = orchestrator.generate_support_agent_suggestions(
                    customer_id=customer_id,
                    user_message=cust_msg,
                    variation_index=cur_idx
                )

                await manager.broadcast_to_room(customer_id, {
                    "type": "support_agent_suggestion",
                    "customer_message": cust_msg,
                    "suggested_reply": regen_data["suggested_reply"],
                    "variation_index": regen_data["variation_index"],
                    "total_variations": regen_data["total_variations"]
                })

            # -------------------------------------------------------------
            # 2. SUPPORT AGENT SENDS MESSAGE (FROM SUPPORT CONSOLE)
            # -------------------------------------------------------------
            elif event_type == "agent_message":
                msg_content = (payload.get("message") or payload.get("content") or "").strip()
                if msg_content:
                    await manager.broadcast_to_room(customer_id, {
                        "type": "chat_message",
                        "sender": "agent",
                        "sender_name": "Sarah (Support Agent)",
                        "content": msg_content,
                        "delivery_status": "Delivered",
                        "timestamp": cur_time
                    })
                    manager.case_timelines[customer_id].append({
                        "time": cur_time,
                        "text": f"Support Agent Sarah replied: \"{msg_content[:50]}...\""
                    })

            # -------------------------------------------------------------
            # 3. SUPPORT AGENT REQUESTS TECHNICIAN HANDOFF
            # -------------------------------------------------------------
            elif event_type == "request_technician":
                req_issue = payload.get("issue", "Rapid battery drain / Hardware inspection")
                req_reason = payload.get("reason", "Support agent escalated to Hardware Specialist")

                cust = db.query(Customer).filter(Customer.id == customer_id).first()
                cust_name = cust.name if cust else "Sarah Jenkins"
                cust_org = cust.organization if cust else "Amazon — Demo"

                tech_packet = {
                    "type": "technician_notification",
                    "priority": "HIGH",
                    "customer_id": customer_id,
                    "customer_name": cust_name,
                    "organization": cust_org,
                    "issue": req_issue,
                    "reason": req_reason,
                    "hindsight": "Previous software settings verified. Hardware inspection requested without customer repetition.",
                    "timestamp": cur_time
                }
                await manager.broadcast_to_technicians(tech_packet)
                await manager.broadcast_to_room(customer_id, {
                    "type": "system_event",
                    "event": "technician_requested",
                    "message": "Senior Technical Specialist has been requested and assigned to this case.",
                    "timestamp": cur_time
                })
                manager.case_timelines[customer_id].append({
                    "time": cur_time,
                    "text": f"Support Agent requested Technician takeover for {cust_name}."
                })

            # -------------------------------------------------------------
            # 3B. CUSTOMER BOOKS A TECHNICIAN (SECTIONS 18, 19, 20)
            # -------------------------------------------------------------
            elif event_type == "book_technician":
                tech_name = payload.get("technician_name", "Technician A")
                time_slot = payload.get("time_slot", "10:00 AM")
                tech_issue = payload.get("issue", "Rapid battery drain / Hardware check")

                cust = db.query(Customer).filter(Customer.id == customer_id).first()
                cust_name = cust.name if cust else "Sarah Jenkins"
                cust_org = cust.organization if cust else "Amazon — Demo"

                # 1. Broadcast booking confirmation to customer chat
                await manager.broadcast_to_room(customer_id, {
                    "type": "chat_message",
                    "sender": "assistant",
                    "content": f"Technician booked: **{tech_name}** for today at **{time_slot}**.\n\nYour complete product memory, purchase details (#AMZ-78241), and previous troubleshooting notes have been forwarded to the technician.",
                    "delivery_status": "Delivered",
                    "timestamp": cur_time
                })

                # 2. Append to timeline
                manager.case_timelines[customer_id].append({
                    "time": cur_time,
                    "text": f"Customer booked {tech_name} for {time_slot}. Full product memory forwarded."
                })

                # 3. Dispatch high-priority technician notification with full context and hindsight (Sections 18 & 19)
                tech_packet = {
                    "type": "technician_notification",
                    "priority": "HIGH",
                    "customer_id": customer_id,
                    "customer_name": cust_name,
                    "organization": cust_org,
                    "product": "Dell Laptop",
                    "platform": "Amazon",
                    "order": "#AMZ-78241",
                    "issue": tech_issue,
                    "reason": f"Customer booked appointment for {time_slot} with {tech_name}",
                    "hindsight": "Previous battery issue was resolved through software settings. Current issue indicates hardware degradation requiring inspection.",
                    "timestamp": cur_time
                }
                await manager.broadcast_to_technicians(tech_packet)

                # 4. Automatically join technician to conversation after 1 second
                await asyncio.sleep(1.0)
                manager.technician_joined[customer_id] = True
                join_time = manager.get_time_str()

                await manager.broadcast_to_room(customer_id, {
                    "type": "system_event",
                    "event": "technician_joined",
                    "message": f"🟢 TECHNICIAN JOINED — {tech_name} has connected with your full product support context.",
                    "timestamp": join_time
                })

                intro_greeting = (
                    f"Hi {cust_name.split()[0]}. I've reviewed your previous support history and the troubleshooting already completed. "
                    "You don't need to repeat the details. I'll help you with the hardware inspection."
                )

                await manager.broadcast_to_room(customer_id, {
                    "type": "chat_message",
                    "sender": "technician",
                    "content": intro_greeting,
                    "badge": "🟢 TECHNICIAN",
                    "timestamp": join_time,
                    "delivery_status": "Delivered"
                })

            # -------------------------------------------------------------
            # 4. TECHNICIAN SENDS MESSAGE OR INTERNAL NOTE
            # -------------------------------------------------------------
            elif event_type == "technician_message":
                msg_content = (payload.get("message") or payload.get("content") or "").strip()
                is_internal = payload.get("is_internal_note", False)

                if is_internal:
                    internal_payload = {
                        "type": "chat_message",
                        "sender": "technician_internal",
                        "content": msg_content,
                        "is_internal": True,
                        "badge": "🔒 INTERNAL TECHNICIAN NOTE",
                        "timestamp": cur_time
                    }
                    await manager.broadcast_to_technicians(internal_payload)
                    manager.case_timelines[customer_id].append({
                        "time": cur_time,
                        "text": f"Technician logged internal note: \"{msg_content[:50]}...\""
                    })
                else:
                    await manager.broadcast_to_room(customer_id, {
                        "type": "chat_message",
                        "sender": "technician",
                        "content": msg_content,
                        "is_internal": False,
                        "badge": "🟢 TECHNICIAN",
                        "timestamp": cur_time
                    })
                    manager.case_timelines[customer_id].append({
                        "time": cur_time,
                        "text": f"Technician communicated with customer: \"{msg_content[:50]}...\""
                    })

            # -------------------------------------------------------------
            # 5. TECHNICIAN ACTIONS (DIAGNOSTIC, LOGS, ASK AI, RESOLVE)
            # -------------------------------------------------------------
            elif event_type == "technician_action":
                action = payload.get("action")

                if action == "run_diagnostic":
                    diag_time = manager.get_time_str()
                    diag_result = {
                        "type": "diagnostic_result",
                        "status": "COMPLETED",
                        "telemetry": "Dell Battery Health Diagnostics: Full Charge Capacity 42% (Degraded cell 2 & 3). DC-in voltage: 19.5V normal.",
                        "finding": "Battery cell degradation verified. 65W charging adapter operational.",
                        "recommended_fix": "Replace internal 56Wh Dell XPS battery pack under active Amazon warranty.",
                        "timestamp": diag_time
                    }
                    await websocket.send_text(json.dumps(diag_result))

                    manager.case_timelines[customer_id].append({
                        "time": diag_time,
                        "text": "Technician executed battery cell diagnostics."
                    })

                elif action == "ask_ai":
                    ai_time = manager.get_time_str()
                    ai_tech_reply = {
                        "type": "chat_message",
                        "sender": "assistant",
                        "content": "RecallAI Summary for Sarah Jenkins:\n\n1. Previous Ticket #4821: Battery drain resolved via power plan settings.\n2. Current Issue: Customer reported drop from 80% to 20% in 1 hour; battery health report confirms 'Poor'.\n3. Hindsight Recommendation: Do not repeat software settings; execute battery unit replacement under warranty.",
                        "badge": "AI TECHNICIAN ASSIST",
                        "timestamp": ai_time
                    }
                    await websocket.send_text(json.dumps(ai_tech_reply))

                elif action == "resolve_case":
                    res_time = manager.get_time_str()
                    resolution_detail = payload.get("resolution", "Faulty battery pack identified. Replacement battery unit authorized under warranty.")
                    explanation_msg = "Your issue has been resolved.\n\nThe technician identified a degraded battery pack and approved an expedited replacement battery pack under your active Amazon warranty.\n\nRecallAI has recorded this permanent resolution in your product support history so you will never have to repeat these steps."

                    new_mem = MemoryItem(
                        customer_id=customer_id,
                        memory_type="successful_solution",
                        key="verified_resolution",
                        value=f"Resolved: {resolution_detail}",
                        context=f"Resolved by Technician on {res_time}. Issue: Battery/Charging. Root cause: Hardware degradation.",
                        confidence=1.0,
                        created_at=datetime.utcnow()
                    )
                    db.add(new_mem)

                    db_event = MemoryTimelineEvent(
                        customer_id=customer_id,
                        event_date=datetime.utcnow().strftime("%B %d, %Y"),
                        event_type="Issue Resolved",
                        title="Dell Laptop Hardware Service Completed",
                        description=f"Technician recorded resolution: {resolution_detail}. Saved to Product Memory.",
                        badge_variant="success"
                    )
                    db.add(db_event)
                    db.commit()

                    resolution_payload = {
                        "type": "case_resolved",
                        "customer_message": explanation_msg,
                        "resolution_detail": resolution_detail,
                        "new_memory": {
                            "product": "Dell Laptop",
                            "platform": "Amazon",
                            "order": "#AMZ-78241",
                            "issue": "Rapid battery drain",
                            "root_cause": "Battery cell degradation",
                            "resolution": resolution_detail,
                            "technician": "Technician A",
                            "date": "Today",
                            "status": "✓ VERIFIED RESOLUTION"
                        },
                        "timestamp": res_time
                    }
                    await manager.broadcast_to_room(customer_id, resolution_payload)

                    manager.case_timelines[customer_id].append({
                        "time": res_time,
                        "text": "Case resolved by technician. Verified resolution saved to customer memory."
                    })

    except WebSocketDisconnect:
        manager.disconnect(websocket, customer_id)
        db.close()
    except Exception as e:
        manager.disconnect(websocket, customer_id)
        db.close()

# REST Endpoints for live state inspection
@router.get("/live/timeline/{customer_id}")
def get_live_timeline(customer_id: str):
    timeline = manager.case_timelines.get(customer_id, [
        {"time": "10:41:12 AM", "text": "Customer reported product issue."},
        {"time": "10:41:13 AM", "text": "RecallAI identified customer & product."},
        {"time": "10:41:14 AM", "text": "Previous support context retrieved."},
        {"time": "10:41:15 AM", "text": "Hindsight reasoning generated."},
        {"time": "10:41:17 AM", "text": "AI responded to customer without repetition."}
    ])
    return {"timeline": timeline}
