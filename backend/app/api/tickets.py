import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..models.base import get_db
from ..models.entities import Ticket, Customer
from ..schemas.schemas import (
    TicketResponse,
    TicketCreate,
    TicketUpdate,
    TicketGraphResponse,
    TicketGraphNode,
    TicketGraphEdge
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("/", response_model=List[TicketResponse])
def get_tickets(
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)
    if customer_id:
        query = query.filter(Ticket.customer_id == customer_id)
    if status:
        query = query.filter(Ticket.status == status)
    if category:
        query = query.filter(Ticket.category == category)
    return query.order_by(Ticket.updated_at.desc()).all()

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, update_data: TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if update_data.status is not None:
        ticket.status = update_data.status
    if update_data.priority is not None:
        ticket.priority = update_data.priority
    if update_data.resolution is not None:
        ticket.resolution = update_data.resolution
    if update_data.assigned_agent is not None:
        ticket.assigned_agent = update_data.assigned_agent
    if update_data.escalation_status is not None:
        ticket.escalation_status = update_data.escalation_status

    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/{customer_id}/graph", response_model=TicketGraphResponse)
def get_ticket_graph(customer_id: str, db: Session = Depends(get_db)):
    """
    WOW Feature: Related Ticket Graph.
    Computes visual relationship nodes and edges between customer's historical tickets.
    """
    tickets = db.query(Ticket).filter(Ticket.customer_id == customer_id).order_by(Ticket.created_at.asc()).all()
    nodes = []
    edges = []

    for t in tickets:
        nodes.append(TicketGraphNode(
            id=str(t.id),
            label=f"#{t.id}: {t.title[:24]}...",
            category=t.category,
            status=t.status,
            priority=t.priority,
            date=t.created_at.strftime("%b %d, %Y")
        ))

    # Connect related tickets based on related_ticket_ids or matching category
    for i, t in enumerate(tickets):
        related_ids = []
        try:
            related_ids = json.loads(t.related_ticket_ids or "[]")
        except Exception:
            pass

        for r_id in related_ids:
            if any(str(n.id) == str(r_id) for n in nodes):
                edges.append(TicketGraphEdge(
                    source=str(r_id),
                    target=str(t.id),
                    relation="Recurring Issue"
                ))

        # Also connect sequential tickets in same category if no explicit relation
        for prev in tickets[:i]:
            if prev.category == t.category and str(prev.id) not in [str(r) for r in related_ids]:
                edges.append(TicketGraphEdge(
                    source=str(prev.id),
                    target=str(t.id),
                    relation="Same Subsystem"
                ))

    return TicketGraphResponse(nodes=nodes, edges=edges)
