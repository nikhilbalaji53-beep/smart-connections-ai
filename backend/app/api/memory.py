from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.base import get_db
from ..models.entities import MemoryItem, MemoryTimelineEvent
from ..memory.engine import CustomerMemoryEngine
from ..schemas.schemas import (
    MemoryItemResponse,
    MemoryItemCreate,
    MemoryTimelineEventResponse
)

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("/{customer_id}/structured")
def get_structured_memory(customer_id: str, db: Session = Depends(get_db)):
    engine = CustomerMemoryEngine(db)
    mem = engine.get_structured_memory(customer_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Customer memory not found")
    return mem

@router.get("/{customer_id}/items", response_model=List[MemoryItemResponse])
def get_memory_items(customer_id: str, db: Session = Depends(get_db)):
    items = db.query(MemoryItem).filter(MemoryItem.customer_id == customer_id).all()
    return items

@router.post("/items", response_model=MemoryItemResponse)
def create_memory_item(data: MemoryItemCreate, db: Session = Depends(get_db)):
    engine = CustomerMemoryEngine(db)
    item = engine.add_or_update_memory_item(
        customer_id=data.customer_id,
        memory_type=data.memory_type,
        key=data.key,
        value=data.value,
        context=data.context,
        source_ticket_id=data.source_ticket_id
    )
    return item

@router.get("/{customer_id}/timeline", response_model=List[MemoryTimelineEventResponse])
def get_memory_timeline(customer_id: str, db: Session = Depends(get_db)):
    events = db.query(MemoryTimelineEvent).filter(
        MemoryTimelineEvent.customer_id == customer_id
    ).order_by(MemoryTimelineEvent.event_date.asc(), MemoryTimelineEvent.id.asc()).all()
    return events
