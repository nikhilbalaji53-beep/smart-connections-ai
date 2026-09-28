# RecallAI REST API Specification

Base URL: `http://localhost:8000/api`

---

## 1. Authentication & Customers

### `GET /customers/`
Retrieves all customer profiles with environment snapshots and baseline frustration metrics.

### `GET /customers/{customer_id}`
Returns customer 360 profile, verified environment specs, preferences, and ticket counts.

---

## 2. Chat & Conversational AI Pipeline

### `POST /chat/message`
Main orchestrator entrypoint executing customer identification, memory retrieval, zero-repetition rule-out, and response synthesis.

**Request Payload:**
```json
{
  "customer_id": "cust_marcus",
  "message": "It's happening again on runner-03. Same timeout error as Tuesday. Fix this.",
  "conversation_id": "conv_cust_marcus_1727435123"
}
```

**Response Payload:**
```json
{
  "conversation_id": "conv_cust_marcus_1727435123",
  "message": "Hello Marcus. I see runner-03 has hit the pipeline timeout again, identical to the timeout incidents tracked in ticket #8841...",
  "sentiment": "URGENT",
  "frustration_score": 8.5,
  "memory_used": [
    {
      "type": "ticket",
      "title": "Previous Ticket #8841",
      "detail": "Runner-03 pipeline timeout during maven build job (Open)",
      "source_id": "#8841"
    },
    {
      "type": "environment",
      "title": "Environment: Ubuntu Linux",
      "detail": "OS: Ubuntu Linux 22.04 LTS | App v3.220.5 | Runtime: Docker 24.0.7",
      "source_id": "ENV-PROFILE"
    },
    {
      "type": "failed_solution",
      "title": "Previously Failed Solution Ruled Out",
      "detail": "Increasing pipeline timeout limit to 120m (failed)",
      "source_id": "TKT-8590"
    }
  ],
  "active_ticket_id": 8841,
  "related_tickets_found": [8841, 8712, 8590],
  "failed_solutions_avoided": [
    "Increasing pipeline timeout limit to 120m",
    "Restarting agent daemon service"
  ],
  "recommended_action": "Execute memory throttling & lingering container diagnostic on runner-03",
  "contingency_step": "Allocate 8GB dedicated swap partition to runner daemon if memory throttling confirmed",
  "should_escalate": false,
  "new_memory_extracted": []
}
```

---

## 3. Persistent Memory Subsystem

### `GET /memory/{customer_id}/structured`
Returns the multi-layered structured memory profile: environment, known recurring issues, failed solutions, and verified resolutions.

### `GET /memory/{customer_id}/timeline`
Returns the chronological array of memory events (issues reported, software updates, solutions attempted).

---

## 4. Ticket Management & Related Graph

### `GET /tickets/`
Filter tickets by `customer_id`, `status` (`Open`, `In Progress`, `Resolved`, `Escalated`), and `category`.

### `GET /tickets/{customer_id}/graph`
Returns nodes and edges connecting tickets across recurrence links and subsystem relationships for the Related Ticket Graph visualizer.

---

## 5. Smart Escalation & Handoff

### `GET /escalation/{customer_id}/summary`
Generates an executive case summary with zero repetition ready for a Tier-3 human support specialist.

---

## 6. Enterprise Analytics & Demo

### `GET /analytics/summary`
Returns live operational KPIs (active conversations, resolution rates, repeat issue reduction rate, frustration breakdown).

### `POST /demo/reset`
Resets the database and seeds the 5 enterprise customers, 15 historical tickets, and memory timelines.
