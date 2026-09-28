from datetime import datetime
import json
from typing import List, Optional
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from .base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True)
    organization = Column(String(150), nullable=False)
    role_title = Column(String(100), default="User")
    team = Column(String(100), default="DevOps")
    customer_since = Column(String(50), default="March 2023")
    account_id = Column(String(50), default="CT-7842")
    location = Column(String(100), default="Remote")
    customer_status = Column(String(50), default="Active Customer")
    tier = Column(String(50), default="Enterprise")  # Enterprise, Premier, Standard
    avatar_url = Column(String(255), nullable=True)
    baseline_frustration = Column(Float, default=2.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    environment = relationship("CustomerEnvironment", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    preferences = relationship("CustomerPreference", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="customer", cascade="all, delete-orphan")
    memory_items = relationship("MemoryItem", back_populates="customer", cascade="all, delete-orphan")
    timeline_events = relationship("MemoryTimelineEvent", back_populates="customer", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="customer", cascade="all, delete-orphan")


class CustomerEnvironment(Base):
    __tablename__ = "customer_environments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), unique=True, index=True)
    operating_system = Column(String(100), default="Windows 11")
    os_version = Column(String(100), default="23H2")
    cloud_provider = Column(String(100), default="Microsoft Azure")
    application_name = Column(String(100), default="Contoso Cloud Suite")
    application_version = Column(String(50), default="4.2.0")
    hardware_tier = Column(String(100), default="Standard 16GB / Intel Xeon")
    runtime_environment = Column(String(100), default="Node.js 20 LTS / Python 3.11")
    details_json = Column(Text, default="{}")  # arbitrary key-values
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="environment")


class CustomerPreference(Base):
    __tablename__ = "customer_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), unique=True, index=True)
    communication_style = Column(String(100), default="Direct and Technical")  # Direct, Concise, Detailed
    preferred_contact = Column(String(50), default="Chat")
    timezone = Column(String(50), default="America/New_York")
    language = Column(String(50), default="en-US")
    auto_escalation_threshold = Column(Float, default=7.0)

    customer = relationship("Customer", back_populates="preferences")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)  # e.g., 1042, 1187
    customer_id = Column(String(50), ForeignKey("customers.id"), index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True)  # Application Crash, CI/CD Pipeline, Azure AD Sync, SSL & Networking, Database
    priority = Column(String(50), default="High")  # Critical, High, Medium, Low
    status = Column(String(50), default="Open", index=True)  # Open, In Progress, Resolved, Escalated
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    ai_summary = Column(Text, nullable=True)
    troubleshooting_performed = Column(Text, default="[]")  # JSON list of steps attempted
    resolution = Column(Text, nullable=True)
    assigned_agent = Column(String(100), default="AI Specialist (RecallAI)")
    escalation_status = Column(String(50), default="None")  # None, Requested, EscalatedToTier3
    related_ticket_ids = Column(Text, default="[]")  # JSON list of related ticket IDs

    customer = relationship("Customer", back_populates="tickets")


class MemoryItem(Base):
    __tablename__ = "memory_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), index=True)
    memory_type = Column(String(50), index=True)  # known_issue, failed_solution, successful_solution, environment_spec, preference, interaction_summary
    key = Column(String(100), index=True)
    value = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    confidence = Column(Float, default=0.95)
    source_ticket_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="memory_items")


class MemoryTimelineEvent(Base):
    __tablename__ = "memory_timeline_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), index=True)
    event_date = Column(String(50), nullable=False)  # ISO or YYYY-MM-DD
    event_type = Column(String(50))  # issue_reported, solution_attempted, issue_resolved, app_updated, support_contact, escalation
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    badge_variant = Column(String(50), default="neutral")  # success, danger, warning, info, neutral
    related_ticket_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="timeline_events")


class KnowledgeArticle(Base):
    __tablename__ = "knowledge_articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    article_id = Column(String(50), unique=True, index=True)  # e.g., KB-1049
    title = Column(String(200), nullable=False)
    category = Column(String(100), index=True)
    product = Column(String(100), default="All")
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    error_codes = Column(String(200), default="")
    recommended_steps = Column(Text, default="[]")  # JSON list
    tags = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(60), primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), index=True)
    active_ticket_id = Column(Integer, nullable=True)
    title = Column(String(200), default="Support Conversation")
    status = Column(String(50), default="active")  # active, closed, escalated
    sentiment = Column(String(50), default="CALM")  # CALM, CONFUSED, FRUSTRATED, URGENT
    frustration_score = Column(Float, default=2.0)  # 0.0 to 10.0
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String(60), ForeignKey("conversations.id"), index=True)
    sender = Column(String(50), nullable=False)  # user, assistant, system, agent
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    memory_used_json = Column(Text, default="[]")  # list of memory snippets used
    sentiment_tag = Column(String(50), nullable=True)
    metadata_json = Column(Text, default="{}")

    conversation = relationship("Conversation", back_populates="messages")
