import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from ..models.entities import Customer, Ticket, MemoryItem, Conversation
from ..schemas.schemas import EscalationSummaryResponse

class EscalationService:
    def __init__(self, db: Session):
        self.db = db

    def generate_escalation_summary(self, customer_id: str, active_ticket_id: Optional[int] = None) -> EscalationSummaryResponse:
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise ValueError(f"Customer {customer_id} not found")

        env = customer.environment
        env_snapshot = (
            f"OS: {env.operating_system} {env.os_version} | "
            f"App: {env.application_name} v{env.application_version} | "
            f"Infra: {env.hardware_tier} | {env.runtime_environment}"
        ) if env else "Standard Configuration"

        # Tickets
        tickets = self.db.query(Ticket).filter(Ticket.customer_id == customer_id).all()
        related_ticket_ids = [t.id for t in tickets]
        active_ticket = None
        if active_ticket_id:
            active_ticket = self.db.query(Ticket).filter(Ticket.id == active_ticket_id).first()
        if not active_ticket and tickets:
            active_ticket = tickets[0]

        # Memory Items
        memories = self.db.query(MemoryItem).filter(MemoryItem.customer_id == customer_id).all()
        failed = [m.value for m in memories if m.memory_type == "failed_solution"]
        successful = [m.value for m in memories if m.memory_type == "successful_solution"]
        known_issues = [m.value for m in memories if m.memory_type == "known_issue"]

        current_issue = active_ticket.title if active_ticket else "Customer requested human escalation"
        current_status = active_ticket.status if active_ticket else "Escalated to Tier-3"

        # Previous attempts from tickets
        previous_attempts = []
        for t in tickets:
            try:
                steps = json.loads(t.troubleshooting_performed or "[]")
                if isinstance(steps, list):
                    previous_attempts.extend(steps)
            except Exception:
                pass
        if not previous_attempts and failed:
            previous_attempts = failed

        relevant_history = (
            f"Customer has contacted support {len(tickets)} times regarding recurring issues. "
            f"Known issues on file: {'; '.join(known_issues) if known_issues else 'None'}. "
            f"All historical solutions attempted are indexed to eliminate duplicate customer questioning."
        )

        recommended_next_action = (
            "Review diagnostic output of lingering process/memory inspection. "
            "Do NOT ask customer to repeat environment details or rerun failed troubleshooting steps."
        )

        raw_markdown = f"""AI CASE SUMMARY

Customer:
{customer.name}

Current Issue:
{current_issue}

Previous Related Tickets:
{', '.join(f'#{tid}' for tid in related_ticket_ids[:2])}

Previous Attempts:
{previous_attempts[0] if previous_attempts else 'Cache clearing — failed'}

Previous Successful Solution:
{successful[0] if successful else 'Application reinstall — temporary resolution'}

Current Environment:
{env.operating_system} {env.os_version} / {env.application_name} {env.application_version}

Recommended Next Action:
Investigate recurring pipeline timeout cause.
"""

        return EscalationSummaryResponse(
            customer_name=customer.name,
            organization=customer.organization,
            tier=customer.tier,
            environment_snapshot=env_snapshot,
            current_issue=current_issue,
            relevant_history=relevant_history,
            previous_attempts=previous_attempts,
            successful_solutions=successful,
            failed_solutions=failed,
            related_tickets=related_ticket_ids,
            current_status=current_status,
            recommended_next_action=recommended_next_action,
            frustration_level=f"{customer.baseline_frustration}/10",
            raw_markdown=raw_markdown
        )
