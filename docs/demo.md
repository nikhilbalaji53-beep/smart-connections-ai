# RecallAI — Hackathon Demo Script & Judge Walkthrough
**"Customer Support That Remembers"**

---

## Quick Start: Launching the Prototype

### 1. Start the Backend:
```powershell
# From project root:
$env:PYTHONPATH="."
.\backend\venv\Scripts\python.exe -m uvicorn backend.app.main:app --port 8000 --reload
```

### 2. Start the Frontend:
```powershell
# In another terminal from ./frontend:
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 5 Pre-Configured Hackathon Demo Scenarios

Use the **"Demo Scenarios"** dropdown in the top header to load any of the 5 customer personas with 1 click:

### Scenario 1: Marcus Vance (Contoso Ltd.) — CI/CD Pipeline Timeout
- **Customer:** Principal DevOps Engineer, Contoso Ltd. (Enterprise Premier)
- **Environment:** Ubuntu Linux 22.04 LTS, Docker 24.0.7, Self-hosted runner-03
- **Baseline Frustration:** 8.5 / 10.0 (Critical / Urgent)
- **Click Prompt:** *"It's happening again on runner-03. Same timeout error as Tuesday. Fix this."*
- **What RecallAI Does:**
  1. Identifies Marcus Vance and loads his Ubuntu environment.
  2. Detects Ticket #8841 (recurrence of #8590 and #8712).
  3. **Strictly rules out:** Increasing timeout to 120m and restarting daemon (both failed in previous sessions).
  4. Prescribes targeted Linux diagnostics: `systemctl status vsts.agent.* | grep -i memory`, `docker ps dead container prune`, and `journalctl OOM inspect`.
  5. Calibrates tone to Urgent (skips pleasantries, leads with immediate ownership).
  6. Opens the **"Memory Used"** inspector displaying the 3 recalled artifacts.

### Scenario 2: Sarah Jenkins (Fabrikam Dynamics) — App Crash Post-Update
- **Customer:** Lead Product Manager, Fabrikam Dynamics (Enterprise)
- **Environment:** Windows 11 Enterprise (23H2), Intel Core i7, 32GB RAM, Studio v4.2.0
- **Click Prompt:** *"My application keeps crashing again after updating this morning."*
- **What RecallAI Does:**
  1. Acknowledges recurrence from Ticket #1042 / #1187.
  2. **Rules out:** Clearing local cache and reinstalling software (confirmed failed in previous session).
  3. Identifies GPU hardware acceleration conflict on Windows 11.
  4. Prescribes `--disable-gpu` override and purging the LocalAppData `ShaderCache` directory.
  5. Gracefully verifies if Sarah's environment updated since the last chat.

### Scenario 3: David Chen (Northwind Cloud) — Azure AD Sync Latency
- **Customer:** Enterprise Systems Architect, Northwind Cloud
- **Environment:** Windows Server 2022 Datacenter, Azure AD Connect v2.1.20
- **Click Prompt:** *"The delta sync cycle on DC-01 is lagging past 45 minutes again."*
- **What RecallAI Does:**
  1. Recalls previous delta sync throttling override from Ticket #1311.
  2. Bypasses general network diagnostics.
  3. Executes `Get-ADSyncScheduler` and `Start-ADSyncSyncCycle -PolicyType Delta`.

### Scenario 4: Elena Rostova (Trey Research) — Webhook SSL Timeout
- **Customer:** Senior Backend Lead, Trey Research
- **Environment:** macOS Sonoma 14.4, Node.js 20 LTS
- **Click Prompt:** *"Our webhook outbound callbacks are timing out during the TLS handshake again."*
- **What RecallAI Does:**
  1. Connects to Ticket #1502 and #1488.
  2. Rules out disabling HTTP keep-alive.
  3. Prescribes `openssl s_client` inspection and Let's Encrypt ISRG Root X1 CA bundle injection.

### Scenario 5: Alex Rivera (Woodgrove Financial) — Database Pool Saturation
- **Customer:** Data Infrastructure Lead, Woodgrove Financial
- **Environment:** Debian Linux 12, PostgreSQL 16.2, PgBouncer 1.21
- **Click Prompt:** *"We are getting connection pool exhaustion on the analytics cluster right now."*
- **What RecallAI Does:**
  1. Recalls Ticket #1640.
  2. **Strictly rules out:** Raising `max_connections` (caused kernel OOM in ticket #1582).
  3. Queries PgBouncer `SHOW POOLS` and terminates idle-in-transaction connections.

---

## WOW Features to Showcase to Judges

1. **"Memory Used" Transparent Inspector:**
   Click "Inspect" on any assistant message to reveal the exact historical memory items (tickets, ruled-out steps, environment, KB articles) that generated the response.

2. **Zero-Repetition Protocol Banner:**
   In the Customer Portal right sidebar, observe the "Zero-Repetition Protocol" card explicitly showing which steps are permanently ruled out.

3. **Dual View Experience (Customer Portal vs Agent Dashboard):**
   Toggle effortlessly between what the customer experiences and the comprehensive Tier-3 Specialist dashboard.

4. **Visual Customer Memory Timeline:**
   In the Agent Dashboard under "AI Memory Timeline", review the vertical chronological timeline of issues, updates, and attempts.

5. **Related Ticket Graph:**
   Under "Related Ticket Graph", see how tickets #8590, #8712, #8841 or #992, #1042, #1187 are autonomously clustered.

6. **1-Click Smart Escalation Handoff Brief:**
   Click "Request Human Specialist" to generate the complete executive handoff brief with 0 customer repetition.
