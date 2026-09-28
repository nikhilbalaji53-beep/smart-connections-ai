import re
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from ..models.entities import (
    Customer,
    CustomerEnvironment,
    Ticket,
    MemoryItem,
    KnowledgeArticle
)
from ..schemas.schemas import MemoryUsedItem

class IntelligentRetriever:
    def __init__(self, db: Session):
        self.db = db

    def detect_intent_and_category(self, user_message: str) -> Tuple[str, str]:
        """
        Classifies intent (troubleshoot, status_inquiry, escalate, update_info)
        and technical category (Application Crash, CI/CD Pipeline, Azure AD Sync, SSL & Webhooks, Database).
        """
        msg = user_message.lower()

        # Intent
        if any(w in msg for w in ["escalate", "human", "agent", "specialist", "speak to someone", "representative"]):
            intent = "escalate"
        elif any(w in msg for w in ["status", "what is the ticket", "check ticket", "update on"]):
            intent = "status_inquiry"
        else:
            intent = "troubleshoot"

        # Category
        if any(w in msg for w in ["lost", "stolen", "passcode", "lock screen", "password", "pin", "pattern", "locked out", "frp", "imei", "ceir"]):
            category = "Security & Recovery"
        elif any(w in msg for w in ["battery", "charging", "drain", "power", "sleep", "darkwake", "discharge"]):
            category = "Power & Battery"
        elif any(w in msg for w in ["wifi", "wi-fi", "bluetooth", "network", "dns", "disconnect", "pairing", "connect"]):
            category = "Connectivity & Wireless"
        elif any(w in msg for w in ["audio", "sound", "headphone", "speaker", "noise", "microphone", "anc", "stutter"]):
            category = "Audio & Sound"
        elif any(w in msg for w in ["screen", "display", "flicker", "hdmi", "monitor", "tv", "black screen", "pixel"]):
            category = "Display & Screen"
        elif any(w in msg for w in ["refrigerator", "fridge", "cooling", "appliance", "temperature", "compressor"]):
            category = "Smart Home Appliance"
        elif any(w in msg for w in ["pipeline", "runner", "timeout", "vsts", "azure devops", "agent-03", "docker ps", "oom"]):
            category = "CI/CD Pipeline"
        elif any(w in msg for w in ["crash", "crashing", "freeze", "hang", "app crash", "exception", "dump"]):
            category = "Application Crash"
        elif any(w in msg for w in ["sync", "azure ad", "aad", "delta sync", "identity", "latency", "tenant"]):
            category = "Azure AD Sync"
        elif any(w in msg for w in ["ssl", "cert", "handshake", "webhook", "tls", "https", "certificate"]):
            category = "SSL & Webhooks"
        elif any(w in msg for w in ["database", "pool", "postgres", "pgbouncer", "connection limit", "sql"]):
            category = "Database"
        else:
            category = "General Support"

        return intent, category

    def compute_similarity(self, query: str, target: str) -> float:
        """
        Computes token overlap & keyword relevance similarity score between 0.0 and 1.0.
        """
        q_tokens = set(re.findall(r'\b\w{3,}\b', query.lower()))
        t_tokens = set(re.findall(r'\b\w{3,}\b', target.lower()))
        if not q_tokens or not t_tokens:
            return 0.0
        intersection = q_tokens.intersection(t_tokens)
        return len(intersection) / (len(q_tokens) ** 0.5 * len(t_tokens) ** 0.5)

    def retrieve_context(
        self,
        customer_id: str,
        user_message: str,
        active_ticket_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Intelligently retrieves and ranks only relevant customer memories,
        failed steps to avoid, and KB articles.
        """
        customer = self.db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            return {}

        intent, detected_category = self.detect_intent_and_category(user_message)
        env = customer.environment

        # 1. Retrieve all tickets for customer
        tickets = self.db.query(Ticket).filter(Ticket.customer_id == customer_id).all()
        
        # Priority 1: Unresolved tickets matching category or active
        relevant_tickets = []
        for t in tickets:
            score = self.compute_similarity(user_message, f"{t.title} {t.description} {t.category}")
            if t.id == active_ticket_id:
                score += 0.8
            if t.category == detected_category:
                score += 0.4
            if t.status in ["Open", "In Progress", "Escalated"]:
                score += 0.3
            
            if score > 0.2:
                relevant_tickets.append((score, t))

        relevant_tickets.sort(key=lambda x: x[0], reverse=True)
        top_tickets = [t for _, t in relevant_tickets[:3]]

        # 2. Retrieve Failed Solutions
        failed_items = self.db.query(MemoryItem).filter(
            MemoryItem.customer_id == customer_id,
            MemoryItem.memory_type == "failed_solution"
        ).all()
        
        failed_solutions_to_avoid = []
        for item in failed_items:
            # Check if relevant to detected category or ticket
            failed_solutions_to_avoid.append({
                "key": item.key,
                "solution": item.value,
                "source_ticket_id": item.source_ticket_id
            })

        # 3. Retrieve Successful Solutions
        success_items = self.db.query(MemoryItem).filter(
            MemoryItem.customer_id == customer_id,
            MemoryItem.memory_type == "successful_solution"
        ).all()

        # 4. Retrieve Matching Knowledge Base Articles
        kb_articles = self.db.query(KnowledgeArticle).all()
        ranked_kb = []
        msg_lower = user_message.lower()
        for kb in kb_articles:
            searchable_text = f"{kb.title} {kb.product} {kb.summary} {kb.error_codes} {kb.tags} {kb.content[:500]}".lower()
            score = self.compute_similarity(user_message, searchable_text)
            
            # Boost if category matches
            if kb.category.lower() == detected_category.lower():
                score += 0.4
            
            # Boost if product name or any product token explicitly appears in user message
            if kb.product.lower() != "all":
                if kb.product.lower() in msg_lower or any(p_token in msg_lower for p_token in kb.product.lower().split() if len(p_token) > 2):
                    score += 0.8
            for tag in kb.tags.split(','):
                tag_clean = tag.strip().lower()
                if tag_clean and (tag_clean in msg_lower or any(t_tok in msg_lower for t_tok in tag_clean.split() if len(t_tok) > 2)):
                    score += 0.4

            # Boost if error code is mentioned
            if kb.error_codes:
                for err in kb.error_codes.split(','):
                    err_clean = err.strip().lower()
                    if err_clean and err_clean in msg_lower:
                        score += 0.9

            if score > 0.15:
                ranked_kb.append((score, kb))

        ranked_kb.sort(key=lambda x: x[0], reverse=True)
        top_kb = [kb for _, kb in ranked_kb[:3]]

        # 5. Build "Memory Used" transparent inspector badges
        memory_used_badges: List[MemoryUsedItem] = []

        if top_tickets:
            most_rel_ticket = top_tickets[0]
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title=f"Previous Ticket #{most_rel_ticket.id}",
                detail=f"{most_rel_ticket.title} ({most_rel_ticket.status})",
                source_id=f"#{most_rel_ticket.id}"
            ))

        if env:
            memory_used_badges.append(MemoryUsedItem(
                type="environment",
                title=f"Environment: {env.operating_system}",
                detail=f"OS: {env.operating_system} {env.os_version} | App v{env.application_version} | Runtime: {env.runtime_environment}",
                source_id="ENV-PROFILE"
            ))

        for f in failed_solutions_to_avoid[:2]:
            memory_used_badges.append(MemoryUsedItem(
                type="failed_solution",
                title="Previously Failed Solution Ruled Out",
                detail=f.get("solution", ""),
                source_id=f"TKT-{f.get('source_ticket_id')}" if f.get('source_ticket_id') else "MEM-RULEOUT"
            ))

        if top_kb:
            memory_used_badges.append(MemoryUsedItem(
                type="kb_article",
                title=f"KB Article: {top_kb[0].article_id}",
                detail=top_kb[0].title,
                source_id=top_kb[0].article_id
            ))

        return {
            "customer": customer,
            "environment": env,
            "intent": intent,
            "detected_category": detected_category,
            "top_tickets": top_tickets,
            "failed_solutions_to_avoid": failed_solutions_to_avoid,
            "successful_solutions": success_items,
            "top_kb": top_kb,
            "memory_used_badges": memory_used_badges
        }
