from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..models.base import get_db
from ..models.entities import Customer, Ticket, MemoryItem
from ..schemas.schemas import CustomerSummary, CustomerDetailResponse

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/", response_model=List[CustomerSummary])
def get_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return customers

@router.get("/{customer_id}", response_model=CustomerDetailResponse)
def get_customer_detail(customer_id: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    open_count = db.query(Ticket).filter(
        Ticket.customer_id == customer_id,
        Ticket.status.in_(["Open", "In Progress", "Escalated"])
    ).count()

    resolved_count = db.query(Ticket).filter(
        Ticket.customer_id == customer_id,
        Ticket.status == "Resolved"
    ).count()

    recurring_count = db.query(MemoryItem).filter(
        MemoryItem.customer_id == customer_id,
        MemoryItem.memory_type == "known_issue"
    ).count()

    return CustomerDetailResponse(
        id=customer.id,
        name=customer.name,
        email=customer.email,
        organization=customer.organization,
        role_title=customer.role_title,
        tier=customer.tier,
        avatar_url=customer.avatar_url,
        baseline_frustration=customer.baseline_frustration,
        environment=customer.environment,
        preferences=customer.preferences,
        open_tickets_count=open_count,
        resolved_tickets_count=resolved_count,
        recurring_issues_count=recurring_count
    )
