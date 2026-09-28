from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Customer schemas
class EnvironmentBase(BaseModel):
    operating_system: str
    os_version: str
    cloud_provider: str
    application_name: str
    application_version: str
    hardware_tier: str
    runtime_environment: str
    details_json: Optional[str] = "{}"

class EnvironmentResponse(EnvironmentBase):
    id: int
    customer_id: str
    updated_at: datetime
    class Config:
        from_attributes = True

class PreferenceResponse(BaseModel):
    id: int
    customer_id: str
    communication_style: str
    preferred_contact: str
    timezone: str
    language: str
    auto_escalation_threshold: float
    class Config:
        from_attributes = True

class CustomerSummary(BaseModel):
    id: str
    name: str
    email: str
    organization: str
    role_title: str
    team: Optional[str] = "DevOps"
    customer_since: Optional[str] = "March 2023"
    account_id: Optional[str] = "CT-7842"
    location: Optional[str] = "Remote"
    customer_status: Optional[str] = "Active Customer"
    tier: str
    avatar_url: Optional[str] = None
    baseline_frustration: float
    class Config:
        from_attributes = True

class CustomerDetailResponse(CustomerSummary):
    environment: Optional[EnvironmentResponse] = None
    preferences: Optional[PreferenceResponse] = None
    open_tickets_count: int = 0
    resolved_tickets_count: int = 0
    recurring_issues_count: int = 0

# Memory Schemas
class MemoryItemResponse(BaseModel):
    id: int
    customer_id: str
    memory_type: str  # known_issue, failed_solution, successful_solution, environment_spec, preference
    key: str
    value: str
    context: Optional[str] = None
    confidence: float
    source_ticket_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class MemoryItemCreate(BaseModel):
    customer_id: str
    memory_type: str
    key: str
    value: str
    context: Optional[str] = None
    confidence: float = 0.95
    source_ticket_id: Optional[int] = None

class MemoryTimelineEventResponse(BaseModel):
    id: int
    customer_id: str
    event_date: str
    event_type: str
    title: str
    description: str
    badge_variant: str
    related_ticket_id: Optional[int] = None
    class Config:
        from_attributes = True

# Ticket Schemas
class TicketResponse(BaseModel):
    id: int
    customer_id: str
    title: str
    description: str
    category: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    ai_summary: Optional[str] = None
    troubleshooting_performed: str
    resolution: Optional[str] = None
    assigned_agent: str
    escalation_status: str
    related_ticket_ids: str
    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    customer_id: str
    title: str
    description: str
    category: str
    priority: str = "High"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution: Optional[str] = None
    assigned_agent: Optional[str] = None
    escalation_status: Optional[str] = None

class TicketGraphNode(BaseModel):
    id: str
    label: str
    category: str
    status: str
    priority: str
    date: str

class TicketGraphEdge(BaseModel):
    source: str
    target: str
    relation: str  # "recurrence", "caused_by_update", "same_subsystem"

class TicketGraphResponse(BaseModel):
    nodes: List[TicketGraphNode]
    edges: List[TicketGraphEdge]

# Knowledge Base
class KnowledgeArticleResponse(BaseModel):
    id: int
    article_id: str
    title: str
    category: str
    product: str
    summary: str
    content: str
    error_codes: str
    recommended_steps: str
    tags: str
    updated_at: datetime
    class Config:
        from_attributes = True

# Chat & Messaging
class MessagePayload(BaseModel):
    sender: str
    content: str
    created_at: datetime
    memory_used: List[Dict[str, Any]] = []
    sentiment_tag: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    customer_id: str
    active_ticket_id: Optional[int] = None
    title: str
    status: str
    sentiment: str
    frustration_score: float
    created_at: datetime
    messages: List[MessagePayload] = []

class ChatRequest(BaseModel):
    customer_id: Optional[str] = None
    customerId: Optional[str] = None
    message: str
    conversation_id: Optional[str] = None
    conversationId: Optional[str] = None
    product_id: Optional[str] = None
    productId: Optional[str] = None
    attachments: Optional[List[str]] = None

class MemoryUsedItem(BaseModel):
    type: str  # ticket, failed_solution, environment, kb_article, successful_solution
    title: str
    detail: str
    source_id: Optional[str] = None

class ChatResponse(BaseModel):
    conversation_id: str
    message: str
    reply: Optional[str] = None
    sentiment: str  # CALM, CONFUSED, FRUSTRATED, URGENT
    frustration_score: float
    memory_used: List[MemoryUsedItem]
    active_ticket_id: Optional[int] = None
    related_tickets_found: List[int] = []
    failed_solutions_avoided: List[str] = []
    recommended_action: Optional[str] = None
    contingency_step: Optional[str] = None
    should_escalate: bool = False
    new_memory_extracted: List[str] = []
    suggested_actions: Optional[List[str]] = None
    suggestedActions: Optional[List[str]] = None

# Escalation Summary
class EscalationSummaryResponse(BaseModel):
    customer_name: str
    organization: str
    tier: str
    environment_snapshot: str
    current_issue: str
    relevant_history: str
    previous_attempts: List[str]
    successful_solutions: List[str]
    failed_solutions: List[str]
    related_tickets: List[int]
    current_status: str
    recommended_next_action: str
    frustration_level: str
    raw_markdown: str

# Analytics
class AnalyticsSummary(BaseModel):
    active_conversations: int
    open_tickets: int
    escalated_cases: int
    resolved_today: int
    average_resolution_time_mins: float
    repeat_issue_reduction_rate: float
    ai_resolution_rate: float
    frustration_distribution: Dict[str, int]
    category_breakdown: Dict[str, int]
