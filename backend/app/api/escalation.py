from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..models.base import get_db
from ..services.escalation import EscalationService
from ..schemas.schemas import EscalationSummaryResponse

router = APIRouter(prefix="/escalation", tags=["Escalation"])

@router.get("/{customer_id}/summary", response_model=EscalationSummaryResponse)
def get_escalation_summary(
    customer_id: str,
    active_ticket_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    service = EscalationService(db)
    try:
        summary = service.generate_escalation_summary(customer_id, active_ticket_id)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
