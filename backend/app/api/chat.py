import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.base import get_db
from ..models.entities import Conversation, Message
from ..schemas.schemas import ChatRequest, ChatResponse, ConversationResponse, MessagePayload
from ..ai.orchestrator import AIOrchestrator

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
@router.post("/message", response_model=ChatResponse)
async def send_chat_message(request: ChatRequest, db: Session = Depends(get_db)):
    orchestrator = AIOrchestrator(db)
    cust_id = request.customer_id or request.customerId or "CUST-001"
    conv_id = request.conversation_id or request.conversationId
    prod_id = request.product_id or request.productId
    prod_info = {"id": prod_id} if prod_id else None
    try:
        response = await orchestrator.generate_response(
            customer_id=cust_id,
            user_message=request.message,
            conversation_id=conv_id,
            product_info=prod_info
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversations/{customer_id}", response_model=List[ConversationResponse])
def get_customer_conversations(customer_id: str, db: Session = Depends(get_db)):
    conversations = db.query(Conversation).filter(
        Conversation.customer_id == customer_id
    ).order_by(Conversation.created_at.desc()).all()

    results = []
    for conv in conversations:
        msgs = []
        for m in conv.messages:
            mem_used = []
            try:
                if m.memory_used_json:
                    mem_used = json.loads(m.memory_used_json)
            except Exception:
                pass

            msgs.append(MessagePayload(
                sender=m.sender,
                content=m.content,
                created_at=m.created_at,
                memory_used=mem_used,
                sentiment_tag=m.sentiment_tag
            ))

        results.append(ConversationResponse(
            id=conv.id,
            customer_id=conv.customer_id,
            active_ticket_id=conv.active_ticket_id,
            title=conv.title,
            status=conv.status,
            sentiment=conv.sentiment,
            frustration_score=conv.frustration_score,
            created_at=conv.created_at,
            messages=msgs
        ))
    return results
