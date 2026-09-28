import re
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.entities import (
    Customer,
    CustomerEnvironment,
    CustomerPreference,
    MemoryItem,
    MemoryTimelineEvent,
    Ticket,
    Conversation
)

class CustomerMemoryEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_customer_profile(self, customer_id: str) -> Optional[Customer]:
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def get_structured_memory(self, customer_id: str) -> Dict[str, Any]:
        """
        Retrieves the multi-layered structured customer memory.
        """
        customer = self.get_customer_profile(customer_id)
        if not customer:
            return {}

        env = customer.environment
        env_dict = {
            "operating_system": env.operating_system if env else "Unknown",
            "os_version": env.os_version if env else "",
            "cloud_provider": env.cloud_provider if env else "",
            "application_name": env.application_name if env else "",
            "application_version": env.application_version if env else "",
            "hardware_tier": env.hardware_tier if env else "",
            "runtime_environment": env.runtime_environment if env else "",
        }

        memory_items = self.db.query(MemoryItem).filter(MemoryItem.customer_id == customer_id).all()
        known_issues = [m for m in memory_items if m.memory_type == "known_issue"]
        failed_solutions = [m for m in memory_items if m.memory_type == "failed_solution"]
        successful_solutions = [m for m in memory_items if m.memory_type == "successful_solution"]

        open_tickets = self.db.query(Ticket).filter(
            Ticket.customer_id == customer_id,
            Ticket.status.in_(["Open", "In Progress", "Escalated"])
        ).all()

        resolved_tickets = self.db.query(Ticket).filter(
            Ticket.customer_id == customer_id,
            Ticket.status == "Resolved"
        ).all()

        return {
            "customer_id": customer.id,
            "name": customer.name,
            "organization": customer.organization,
            "tier": customer.tier,
            "baseline_frustration": customer.baseline_frustration,
            "environment": env_dict,
            "known_issues": [{"key": m.key, "value": m.value, "ticket_id": m.source_ticket_id} for m in known_issues],
            "failed_solutions": [{"key": m.key, "value": m.value, "ticket_id": m.source_ticket_id} for m in failed_solutions],
            "successful_solutions": [{"key": m.key, "value": m.value, "ticket_id": m.source_ticket_id} for m in successful_solutions],
            "open_tickets": [
                {"id": t.id, "title": t.title, "category": t.category, "priority": t.priority, "status": t.status}
                for t in open_tickets
            ],
            "resolved_tickets": [
                {"id": t.id, "title": t.title, "category": t.category, "resolution": t.resolution}
                for t in resolved_tickets
            ],
            "preferences": {
                "communication_style": customer.preferences.communication_style if customer.preferences else "Direct",
                "timezone": customer.preferences.timezone if customer.preferences else "UTC",
            }
        }

    def add_or_update_memory_item(
        self,
        customer_id: str,
        memory_type: str,
        key: str,
        value: str,
        context: Optional[str] = None,
        source_ticket_id: Optional[int] = None
    ) -> MemoryItem:
        existing = self.db.query(MemoryItem).filter(
            MemoryItem.customer_id == customer_id,
            MemoryItem.memory_type == memory_type,
            MemoryItem.key == key
        ).first()

        if existing:
            existing.value = value
            existing.context = context
            existing.source_ticket_id = source_ticket_id or existing.source_ticket_id
            existing.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            item = MemoryItem(
                customer_id=customer_id,
                memory_type=memory_type,
                key=key,
                value=value,
                context=context,
                source_ticket_id=source_ticket_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            self.db.add(item)
            self.db.commit()
            self.db.refresh(item)
            return item

    def record_timeline_event(
        self,
        customer_id: str,
        event_date: str,
        event_type: str,
        title: str,
        description: str,
        badge_variant: str = "neutral",
        related_ticket_id: Optional[int] = None
    ) -> MemoryTimelineEvent:
        event = MemoryTimelineEvent(
            customer_id=customer_id,
            event_date=event_date,
            event_type=event_type,
            title=title,
            description=description,
            badge_variant=badge_variant,
            related_ticket_id=related_ticket_id,
            created_at=datetime.utcnow()
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def extract_and_update_memory(
        self,
        customer_id: str,
        user_message: str,
        ai_response: str,
        active_ticket_id: Optional[int] = None
    ) -> List[str]:
        """
        Memory Extraction Engine:
        After meaningful conversation turns, extract only factual long-term information:
        - Updated OS version
        - Updated Application version
        - Newly mentioned failed solutions
        - Newly verified successful solutions
        """
        extracted_facts: List[str] = []
        customer = self.get_customer_profile(customer_id)
        if not customer:
            return extracted_facts

        env = customer.environment
        msg_lower = user_message.lower()

        # 1. Check for OS update mentions (e.g., "upgraded to Windows 11 24H2", "Ubuntu 24.04")
        win_match = re.search(r'windows\s*(10|11)(\s*(pro|enterprise|home))?(\s*version\s*|\s*)([0-9]{2}[hH][1-2])?', user_message, re.IGNORECASE)
        if win_match and env:
            new_os = f"Windows {win_match.group(1)}"
            if env.operating_system != new_os:
                env.operating_system = new_os
                extracted_facts.append(f"Updated OS to {new_os}")

        ubuntu_match = re.search(r'ubuntu\s*(20\.04|22\.04|24\.04)', user_message, re.IGNORECASE)
        if ubuntu_match and env:
            new_os = f"Ubuntu {ubuntu_match.group(1)} LTS"
            if env.operating_system != new_os:
                env.operating_system = new_os
                extracted_facts.append(f"Updated OS to {new_os}")

        # 2. Check for App Version mentions (e.g. "version 4.3", "v4.3.1", "updated to 5.0")
        ver_match = re.search(r'(?:version|v|ver|app version)\s*([0-9]+\.[0-9]+(?:\.[0-9]+)?)', user_message, re.IGNORECASE)
        if ver_match and env:
            new_ver = ver_match.group(1)
            if env.application_version != new_ver:
                env.application_version = new_ver
                extracted_facts.append(f"Updated Application Version to {new_ver}")
                self.record_timeline_event(
                    customer_id=customer_id,
                    event_date=datetime.utcnow().strftime("%Y-%m-%d"),
                    event_type="app_updated",
                    title=f"Application Updated to v{new_ver}",
                    description=f"Customer reported updating application version to {new_ver}",
                    badge_variant="info",
                    related_ticket_id=active_ticket_id
                )

        # 3. Check for newly failed solutions in user's message
        failed_indicators = [
            ("clearing the cache didn't work", "Clearing local cache", "User confirmed cache clearing failed"),
            ("reinstalling didn't fix it", "Full reinstallation", "Reinstallation did not stop crash"),
            ("restarting the agent didn't help", "Agent service restart", "Service restart only temporary"),
            ("timeout increase failed", "Increasing pipeline timeout", "Timeout adjustment ineffective"),
            ("already tried restarting", "Daemon restart", "Daemon restart failed to eliminate leak"),
            ("tried rebooting", "System reboot", "Reboot failed to resolve persistent lock")
        ]

        for phrase, name, detail in failed_indicators:
            if phrase in msg_lower or ("didn't work" in msg_lower and phrase.split()[0] in msg_lower):
                self.add_or_update_memory_item(
                    customer_id=customer_id,
                    memory_type="failed_solution",
                    key=f"failed_{name.lower().replace(' ', '_')}",
                    value=f"{name}: {detail}",
                    context="Captured from conversation turn",
                    source_ticket_id=active_ticket_id
                )
                fact_msg = f"Recorded failed solution: {name}"
                if fact_msg not in extracted_facts:
                    extracted_facts.append(fact_msg)

        # 4. Check for success confirmation (Resolution Learning)
        success_indicators = [
            "that worked", "it is working now", "that fixed it", "issue is resolved",
            "the swap fix worked", "docker cleanup solved it", "delta sync is working"
        ]
        if any(ind in msg_lower for ind in success_indicators):
            self.add_or_update_memory_item(
                customer_id=customer_id,
                memory_type="successful_solution",
                key="latest_successful_resolution",
                value="Latest diagnostic step confirmed successful by user",
                context=ai_response[:200],
                source_ticket_id=active_ticket_id
            )
            extracted_facts.append("Recorded verified successful solution to persistent memory")
            self.record_timeline_event(
                customer_id=customer_id,
                event_date=datetime.utcnow().strftime("%Y-%m-%d"),
                event_type="issue_resolved",
                title="Issue Resolved & Verified",
                description="Customer confirmed applied resolution was successful",
                badge_variant="success",
                related_ticket_id=active_ticket_id
            )

        if env:
            env.updated_at = datetime.utcnow()
        self.db.commit()
        return extracted_facts
