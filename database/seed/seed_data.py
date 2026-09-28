import json
from datetime import datetime, timedelta
from backend.app.models.base import Base, engine, SessionLocal
from backend.app.models.entities import (
    Customer,
    CustomerEnvironment,
    CustomerPreference,
    Ticket,
    MemoryItem,
    MemoryTimelineEvent,
    KnowledgeArticle,
    Conversation,
    Message
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for a clean deterministic seed
    db.query(Message).delete()
    db.query(Conversation).delete()
    db.query(MemoryTimelineEvent).delete()
    db.query(MemoryItem).delete()
    db.query(Ticket).delete()
    db.query(CustomerPreference).delete()
    db.query(CustomerEnvironment).delete()
    db.query(Customer).delete()
    db.query(KnowledgeArticle).delete()
    db.commit()

    print("[RecallAI] Seeding enterprise customers...")

    # 1. Customers
    customers = [
        Customer(
            id="cust_marcus",
            name="Marcus Vance",
            email="marcus.vance@contoso.com",
            organization="Contoso Ltd.",
            role_title="Principal DevOps Engineer",
            team="DevOps",
            customer_since="March 2023",
            account_id="CT-7842",
            location="Remote",
            customer_status="Active Customer",
            tier="Enterprise Premier",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            baseline_frustration=8.5,
            created_at=datetime.utcnow() - timedelta(days=90)
        ),
        Customer(
            id="cust_sarah",
            name="Sarah Jenkins",
            email="sarah.jenkins@fabrikam.com",
            organization="Fabrikam Dynamics",
            role_title="Lead Product Manager",
            tier="Enterprise",
            avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            baseline_frustration=6.5,
            created_at=datetime.utcnow() - timedelta(days=60)
        ),
        Customer(
            id="cust_david",
            name="David Chen",
            email="david.chen@northwindcloud.com",
            organization="Northwind Cloud",
            role_title="Enterprise Systems Architect",
            tier="Enterprise",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            baseline_frustration=3.0,
            created_at=datetime.utcnow() - timedelta(days=120)
        ),
        Customer(
            id="cust_elena",
            name="Elena Rostova",
            email="elena.rostova@treyresearch.com",
            organization="Trey Research",
            role_title="Senior Backend Lead",
            tier="Premier",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            baseline_frustration=4.5,
            created_at=datetime.utcnow() - timedelta(days=45)
        ),
        Customer(
            id="cust_alex",
            name="Alex Rivera",
            email="alex.rivera@woodgrovefinancial.com",
            organization="Woodgrove Financial",
            role_title="Data Infrastructure Lead",
            tier="Enterprise Critical",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            baseline_frustration=7.0,
            created_at=datetime.utcnow() - timedelta(days=75)
        ),
    ]
    db.add_all(customers)
    db.commit()

    # 2. Customer Environments
    environments = [
        CustomerEnvironment(
            customer_id="cust_marcus",
            operating_system="Ubuntu Linux",
            os_version="22.04 LTS",
            cloud_provider="Azure DevOps Server 2022 (On-Prem / Hybrid)",
            application_name="JAMMY",
            application_version="v3.16",
            hardware_tier="runner-03 / 16 vCPU / 64GB RAM / NVMe SSD",
            runtime_environment="Docker 24.0.7 / Kernel 5.15.0-91-generic",
            details_json=json.dumps({"agent_pool": "Contoso-CI-Dedicated", "runner_id": "runner-03", "docker_storage": "overlay2"})
        ),
        CustomerEnvironment(
            customer_id="cust_sarah",
            operating_system="Windows 11 Enterprise",
            os_version="23H2 (Build 22631.3296)",
            cloud_provider="Microsoft 365 Cloud",
            application_name="Fabrikam Dynamics Studio",
            application_version="4.2.0",
            hardware_tier="Dell Latitude 9440 / Intel Core i7-1365U / 32GB RAM",
            runtime_environment=".NET 8.0 Desktop Runtime / DirectX 12",
            details_json=json.dumps({"gpu": "Intel Iris Xe Graphics", "display_scaling": "150%"})
        ),
        CustomerEnvironment(
            customer_id="cust_david",
            operating_system="Windows Server",
            os_version="2022 Datacenter Edition",
            cloud_provider="Microsoft Entra ID / Hybrid Identity",
            application_name="Azure AD Connect Sync Service",
            application_version="2.1.20.0",
            hardware_tier="VMware ESXi Host / 8 vCPU / 32GB ECC RAM",
            runtime_environment="SQL Server 2019 LocalDB / ADSync Engine",
            details_json=json.dumps({"sync_mode": "Password Hash Sync + Seamless SSO", "delta_interval_minutes": 30})
        ),
        CustomerEnvironment(
            customer_id="cust_elena",
            operating_system="macOS Sonoma",
            os_version="14.4.1 (Darwin 23.4.0)",
            cloud_provider="AWS & Azure Hybrid Gateway",
            application_name="Trey Event Webhook Dispatcher",
            application_version="1.8.4",
            hardware_tier="Apple Silicon M3 Max / 64GB Unified Memory",
            runtime_environment="Node.js 20.11.1 LTS / OpenSSL 3.0.13",
            details_json=json.dumps({"tls_version": "TLSv1.3", "ca_bundle": "system-keychain-default"})
        ),
        CustomerEnvironment(
            customer_id="cust_alex",
            operating_system="Debian Linux",
            os_version="12 (Bookworm)",
            cloud_provider="Azure Virtual Machines (E16as v5)",
            application_name="PostgreSQL Cluster with PgBouncer",
            application_version="Pg 16.2 / PgBouncer 1.21",
            hardware_tier="16 vCPU / 128GB Memory / Premium SSD v2",
            runtime_environment="Systemd / Libevent 2.1 / CGroup v2",
            details_json=json.dumps({"pool_mode": "transaction", "max_client_conn": 5000, "default_pool_size": 40})
        )
    ]
    db.add_all(environments)

    # 3. Preferences
    preferences = [
        CustomerPreference(
            customer_id="cust_marcus",
            communication_style="Direct, Technical, Skip Greetings",
            preferred_contact="Chat / High-Priority Incident Room",
            timezone="America/New_York",
            language="en-US",
            auto_escalation_threshold=8.0
        ),
        CustomerPreference(
            customer_id="cust_sarah",
            communication_style="Supportive, Action-Oriented, Clear Steps",
            preferred_contact="Chat",
            timezone="America/Chicago",
            language="en-US",
            auto_escalation_threshold=7.0
        ),
        CustomerPreference(
            customer_id="cust_david",
            communication_style="Detailed, Architectural, Log-Centric",
            preferred_contact="Chat",
            timezone="America/Los_Angeles",
            language="en-US",
            auto_escalation_threshold=7.5
        ),
        CustomerPreference(
            customer_id="cust_elena",
            communication_style="Technical, Code-focused, Concise",
            preferred_contact="Chat",
            timezone="Europe/London",
            language="en-US",
            auto_escalation_threshold=6.5
        ),
        CustomerPreference(
            customer_id="cust_alex",
            communication_style="Strictly Performance-Driven, Metric-Oriented",
            preferred_contact="Chat",
            timezone="America/New_York",
            language="en-US",
            auto_escalation_threshold=7.5
        )
    ]
    db.add_all(preferences)
    db.commit()

    print("[RecallAI] Seeding 15 historical tickets...")

    # 4. Historical Tickets (15 realistic enterprise tickets)
    now = datetime.utcnow()
    tickets = [
        # Marcus Vance (Tickets 8841, 1027, 9703, 9120, 7321)
        Ticket(
            id=7321,
            customer_id="cust_marcus",
            title="Similar timeout reported after update",
            description="Pipeline timeout occurred during container build following v3.16 update.",
            category="CI/CD Pipeline",
            priority="Medium",
            status="Resolved",
            created_at=now - timedelta(days=75),
            updated_at=now - timedelta(days=74),
            ai_summary="Reinstallation of application v3.16 resolved the issue.",
            troubleshooting_performed=json.dumps(["Cache clearing (FAILED)", "Reinstalled application v3.16 (RESOLVED)"]),
            resolution="Reinstalled application with latest v3.16 patch.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=8841,
            customer_id="cust_marcus",
            title="Application crash after update",
            description="Pipeline runner crashed after software update.",
            category="CI/CD Pipeline",
            priority="High",
            status="Resolved",
            created_at=now - timedelta(days=45),
            updated_at=now - timedelta(days=44),
            ai_summary="Reinstalling application v3.16 resolved the issue.",
            troubleshooting_performed=json.dumps(["Cache clearing attempted and failed", "Reinstalled application v3.16 (RESOLVED)"]),
            resolution="Reinstalled application v3.16 with updated build dependencies.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[7321]"
        ),
        Ticket(
            id=9120,
            customer_id="cust_marcus",
            title="Performance issue on runner daemon",
            description="Agent runner daemon performance degradation during high-throughput jobs.",
            category="CI/CD Pipeline",
            priority="Medium",
            status="Resolved",
            created_at=now - timedelta(days=30),
            updated_at=now - timedelta(days=29),
            ai_summary="Pruned stale container volumes and verified swap configuration.",
            troubleshooting_performed=json.dumps(["Volume pruning and swap space inspection"]),
            resolution="Pruned dead docker volumes.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[8841]"
        ),
        Ticket(
            id=9703,
            customer_id="cust_marcus",
            title="Login failure on runner authentication",
            description="Runner service experienced transient token renegotiation delay.",
            category="CI/CD Pipeline",
            priority="Medium",
            status="Resolved",
            created_at=now - timedelta(days=15),
            updated_at=now - timedelta(days=14),
            ai_summary="Re-authenticated runner credentials.",
            troubleshooting_performed=json.dumps(["Token re-authentication"]),
            resolution="Service principal credential refreshed.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=1027,
            customer_id="cust_marcus",
            title="Recurring Pipeline Timeout",
            description="Customer reports: 'I see the pipeline timeout again. This happened before last month too.'",
            category="CI/CD Pipeline",
            priority="High",
            status="Investigating",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(hours=1),
            ai_summary="Recurring pipeline timeout detected. Cache clearing failed previously. Recommending application version verification and previous successful reinstall fix.",
            troubleshooting_performed=json.dumps([
                "Cache clearing (FAILED previously - DO NOT REPEAT)",
                "Reinstalling application (RESOLVED previously)"
            ]),
            resolution=None,
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[8841, 7321, 9120]"
        ),

        # Sarah (Tickets 4821, 992, 1042, 1187)
        Ticket(
            id=4821,
            customer_id="cust_sarah",
            title="Laptop arrived with cracked screen — replacement requested",
            description="Laptop arrived damaged with cracked display. Replacement unit requested for delivery by September 25.",
            category="Hardware & Orders",
            priority="High",
            status="Open",
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=2),
            ai_summary="Laptop reported damaged on September 20. Replacement requested; expected delivery September 25. Currently pending delivery confirmation.",
            troubleshooting_performed=json.dumps(["Replacement order placed (Shipment tracking generated)"]),
            resolution="Replacement unit dispatched via Contoso Express.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=992,
            customer_id="cust_sarah",
            title="Local cache corruption causing UI freeze on Windows 11",
            description="Application froze on startup. Cleared app data folder.",
            category="Application Crash",
            priority="Medium",
            status="Resolved",
            created_at=now - timedelta(days=40),
            updated_at=now - timedelta(days=39),
            ai_summary="Clearing %APPDATA% cache files restored launch state on v4.1.",
            troubleshooting_performed=json.dumps(["Cleared %APPDATA%\\Fabrikam cache directory"]),
            resolution="Cache purge resolved freeze in version 4.1.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=1042,
            customer_id="cust_sarah",
            title="Application crashes immediately after login post v4.2 update",
            description="Customer updated to 4.2.0. App crashes with 0xc0000005 access violation immediately after sign-in.",
            category="Application Crash",
            priority="High",
            status="Resolved",
            created_at=now - timedelta(days=15),
            updated_at=now - timedelta(days=14),
            ai_summary="User attempted clearing cache and full reinstall; crash returned. Software rendering bypass stabilized launch.",
            troubleshooting_performed=json.dumps([
                "Clearing local cache (FAILED - crash returned)",
                "Full application reinstallation (FAILED - crash returned)"
            ]),
            resolution="Purged ShaderCache directory and disabled hardware GPU rasterizer.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[992]"
        ),
        Ticket(
            id=1187,
            customer_id="cust_sarah",
            title="Application crashes again after update to build 4.2.1",
            description="Recurring crash on launch after patch update. Same 0xc0000005 rendering exception.",
            category="Application Crash",
            priority="High",
            status="Open",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(hours=1),
            ai_summary="Known recurrence from ticket #1042. Cache clearing ruled out as failed workaround.",
            troubleshooting_performed=json.dumps([
                "Clearing local cache (ruled out - failed in #1042)",
                "Reinstallation (ruled out - failed in #1042)"
            ]),
            resolution=None,
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[992, 1042]"
        ),

        # David Chen (Tickets 6210, 1105, 1311, 1420)
        Ticket(
            id=6210,
            customer_id="cust_david",
            title="Recurring internet service outage on primary gateway",
            description="Customer reports internet down again. Router restart provided only temporary fix; network equipment replacement worked for 2 months.",
            category="Network & Telecom",
            priority="High",
            status="Open",
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(hours=2),
            ai_summary="Recurring connectivity issue detected. Router restart provided temporary fix previously. Equipment replacement resolved issue for 2 months.",
            troubleshooting_performed=json.dumps([
                "Router restart (temporary fix only)",
                "Technician visit (issue returned)",
                "Network equipment replacement (resolved for 2 months)"
            ]),
            resolution=None,
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=1105,
            customer_id="cust_david",
            title="Password hash synchronization delay on hybrid domain controller",
            description="Initial delta sync cycle took 65 minutes on primary domain controller DC-01.",
            category="Azure AD Sync",
            priority="Medium",
            status="Resolved",
            created_at=now - timedelta(days=70),
            updated_at=now - timedelta(days=69),
            ai_summary="Verified network MTU and firewall throughput. Sync caught up overnight.",
            troubleshooting_performed=json.dumps(["Local network MTU verification", "Firewall inspection"]),
            resolution="Sync completed full baseline sync cycle.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=1311,
            customer_id="cust_david",
            title="Sync cycle throttled during batch password hash sync",
            description="Delta sync triggered Azure AD graph API throttling 429 response.",
            category="Azure AD Sync",
            priority="High",
            status="Resolved",
            created_at=now - timedelta(days=25),
            updated_at=now - timedelta(days=24),
            ai_summary="Custom delta sync scheduler interval configured to throttle threshold bypass.",
            troubleshooting_performed=json.dumps(["Applied delta sync scheduler throttling override script"]),
            resolution="Applied registry throttle bypass and increased sync batch size to 500.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[1105]"
        ),
        Ticket(
            id=1420,
            customer_id="cust_david",
            title="Azure AD Connect delta synchronization latency exceeds 45 minutes",
            description="Delta sync schedule delayed again. Synchronizing 12,000 objects taking > 45 minutes.",
            category="Azure AD Sync",
            priority="High",
            status="Open",
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(hours=5),
            ai_summary="Investigating whether Graph API sync anchor token expired or throttling resurfaced.",
            troubleshooting_performed=json.dumps(["Checked ADSyncScheduler status"]),
            resolution=None,
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[1105, 1311]"
        ),

        # Elena Rostova (Tickets 1390, 1488, 1502)
        Ticket(
            id=1390,
            customer_id="cust_elena",
            title="Outbound payload delivery failure on HTTPS endpoint",
            description="Webhooks to external partner endpoint failing with connection reset.",
            category="SSL & Webhooks",
            priority="Medium",
            status="Resolved",
            created_at=now - timedelta(days=35),
            updated_at=now - timedelta(days=34),
            ai_summary="Partner updated firewall whitelist. Webhook resumed.",
            troubleshooting_performed=json.dumps(["Validated outbound payload serialization"]),
            resolution="Partner whitelisted webhook egress IP range.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=1488,
            customer_id="cust_elena",
            title="TLS certificate chain verification failure depth 1",
            description="Node.js 20 client threw UNABLE_TO_VERIFY_LEAF_SIGNATURE during SSL handshake.",
            category="SSL & Webhooks",
            priority="High",
            status="Resolved",
            created_at=now - timedelta(days=18),
            updated_at=now - timedelta(days=17),
            ai_summary="Attempted disabling keep-alive; didn't fix cert error. Injected ISRG Root X1 CA bundle.",
            troubleshooting_performed=json.dumps([
                "Disabling HTTP keep-alive on webhook outbound dispatcher (FAILED to fix handshake)"
            ]),
            resolution="Injected ISRG Root X1 cross-signed root bundle into Node.js ssl cert options.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[1390]"
        ),
        Ticket(
            id=1502,
            customer_id="cust_elena",
            title="Webhook SSL handshake timeout during callback dispatch",
            description="Recurring SSL handshake timeout when dispatching payloads to new regional webhook edge.",
            category="SSL & Webhooks",
            priority="High",
            status="Open",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(hours=2),
            ai_summary="Recurrence from #1488. Keep-alive already ruled out.",
            troubleshooting_performed=json.dumps([
                "Disabling keep-alive (ruled out from #1488)"
            ]),
            resolution=None,
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[1390, 1488]"
        ),

        # Alex Rivera (Tickets 1499, 1582, 1640)
        Ticket(
            id=1499,
            customer_id="cust_alex",
            title="Transaction lock starvation on analytics replica",
            description="Long-running query held access exclusive lock on customer_ledger table.",
            category="Database",
            priority="High",
            status="Resolved",
            created_at=now - timedelta(days=50),
            updated_at=now - timedelta(days=49),
            ai_summary="Identified offending PID and terminated with pg_cancel_backend.",
            troubleshooting_performed=json.dumps(["Executed pg_stat_activity lock tree inspection"]),
            resolution="Terminated orphan lock and configured statement_timeout = 60s.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[]"
        ),
        Ticket(
            id=1582,
            customer_id="cust_alex",
            title="Database connection spike causing 504 Gateway Timeout",
            description="Clients overwhelmed PgBouncer connection pool. Raised max_connections to 3000.",
            category="Database",
            priority="Critical",
            status="Resolved",
            created_at=now - timedelta(days=20),
            updated_at=now - timedelta(days=19),
            ai_summary="Increasing max_connections caused kernel OOM swap thrashing.",
            troubleshooting_performed=json.dumps([
                "Increasing max_connections parameter to 3000 in postgresql.conf (FAILED - caused memory thrashing)"
            ]),
            resolution="Lowered max_connections back to 800 and enabled PgBouncer transaction pooling.",
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="None",
            related_ticket_ids="[1499]"
        ),
        Ticket(
            id=1640,
            customer_id="cust_alex",
            title="PgBouncer client pool exhaustion during end-of-day analytics batch",
            description="Pool saturation recurring. Clients reporting 'server_login_retry' and timeouts.",
            category="Database",
            priority="Critical",
            status="Open",
            created_at=now - timedelta(days=2),
            updated_at=now - timedelta(hours=4),
            ai_summary="Recurrence from #1582. Raising raw connections strictly ruled out.",
            troubleshooting_performed=json.dumps([
                "Raising max_connections in postgresql.conf (strictly ruled out - caused OOM previously)"
            ]),
            resolution=None,
            assigned_agent="AI Specialist (RecallAI)",
            escalation_status="Requested",
            related_ticket_ids="[1499, 1582]"
        )
    ]
    db.add_all(tickets)
    db.commit()

    print("[RecallAI] Seeding structured persistent memory items...")

    # 5. Persistent Memory Items
    memories = [
        # Marcus Vance
        MemoryItem(
            customer_id="cust_marcus",
            memory_type="known_issue",
            key="recurring_pipeline_timeout",
            value="Recurring pipeline timeout during container build stages following update.",
            context="Documented in tickets #8841, #7321, and #1027",
            confidence=0.99,
            source_ticket_id=1027
        ),
        MemoryItem(
            customer_id="cust_marcus",
            memory_type="failed_solution",
            key="cache_clearing",
            value="Cache clearing (failed - issue returned on next pipeline run)",
            context="Attempted on Aug 12, 2026 in ticket #8841. Ineffective against pipeline hang.",
            confidence=0.99,
            source_ticket_id=8841
        ),
        MemoryItem(
            customer_id="cust_marcus",
            memory_type="successful_solution",
            key="reinstall_application",
            value="Reinstall application v3.16 with latest patch (resolved issue previously)",
            context="Verified fix on Aug 12, 2026 in ticket #8841",
            confidence=0.98,
            source_ticket_id=8841
        ),
        MemoryItem(
            customer_id="cust_marcus",
            memory_type="environment_spec",
            key="current_environment",
            value="Ubuntu 22.04 LTS | JAMMY v3.16 | runner-03",
            context="Verified active environment",
            confidence=1.0,
            source_ticket_id=None
        ),

        # Sarah Jenkins
        MemoryItem(
            customer_id="cust_sarah",
            memory_type="known_issue",
            key="app_crash_post_update",
            value="Fabrikam Dynamics crashes with 0xc0000005 access violation on launch post v4.2 update.",
            context="Documented in ticket #1042 and #1187",
            confidence=0.98,
            source_ticket_id=1187
        ),
        MemoryItem(
            customer_id="cust_sarah",
            memory_type="failed_solution",
            key="clear_local_cache",
            value="Clearing local application cache (failed - crash returned immediately after restart)",
            context="Attempted during session on Thursday. Ruled out for v4.2.",
            confidence=0.99,
            source_ticket_id=1042
        ),
        MemoryItem(
            customer_id="cust_sarah",
            memory_type="failed_solution",
            key="reinstall_application",
            value="Full software reinstallation (failed - corrupt shader cache in LocalAppData persisted)",
            context="Attempted in ticket #1042.",
            confidence=0.99,
            source_ticket_id=1042
        ),
        MemoryItem(
            customer_id="cust_sarah",
            memory_type="successful_solution",
            key="shader_cache_purge_and_gpu_bypass",
            value="Purging %LOCALAPPDATA%\\FabrikamDynamics\\ShaderCache and running with --disable-gpu successfully prevented crash in build 4.1.8.",
            context="Verified in ticket #1042 resolution notes",
            confidence=0.97,
            source_ticket_id=1042
        ),

        # David Chen
        MemoryItem(
            customer_id="cust_david",
            memory_type="known_issue",
            key="aadsync_delta_latency",
            value="Azure AD Connect delta synchronization throttled when batch size exceeds 5,000 objects.",
            context="Observed in tickets #1311, #1420",
            confidence=0.96,
            source_ticket_id=1420
        ),
        MemoryItem(
            customer_id="cust_david",
            memory_type="successful_solution",
            key="deltasync_throttle_bypass",
            value="Applied registry throttle bypass and increased sync batch size to 500 via Start-ADSyncSyncCycle override.",
            context="Verified in ticket #1311",
            confidence=0.95,
            source_ticket_id=1311
        ),

        # Elena Rostova
        MemoryItem(
            customer_id="cust_elena",
            memory_type="failed_solution",
            key="disable_http_keepalive",
            value="Disabling HTTP keep-alive on webhook outbound dispatcher (failed - did not resolve SSL handshake timeout)",
            context="Attempted in ticket #1488",
            confidence=0.98,
            source_ticket_id=1488
        ),
        MemoryItem(
            customer_id="cust_elena",
            memory_type="successful_solution",
            key="injected_isrg_root_ca",
            value="Injected ISRG Root X1 CA bundle into Node.js ssl certificate options.",
            context="Verified in ticket #1488",
            confidence=0.96,
            source_ticket_id=1488
        ),

        # Alex Rivera
        MemoryItem(
            customer_id="cust_alex",
            memory_type="failed_solution",
            key="increase_max_connections",
            value="Raising max_connections in postgresql.conf to 3000 (failed - triggered Linux kernel OOM swap killer)",
            context="Attempted in ticket #1582. Strictly ruled out.",
            confidence=0.99,
            source_ticket_id=1582
        ),
        MemoryItem(
            customer_id="cust_alex",
            memory_type="successful_solution",
            key="idle_in_transaction_timeout",
            value="Configured idle_in_transaction_session_timeout = 30000ms to automatically reap abandoned locks.",
            context="Verified in ticket #1499",
            confidence=0.97,
            source_ticket_id=1499
        )
    ]
    db.add_all(memories)
    db.commit()

    print("[RecallAI] Seeding memory timeline events...")

    # 6. Memory Timeline Events (Visual Customer Memory Timeline)
    timeline_events = [
        # Marcus Vance timeline
        MemoryTimelineEvent(
            customer_id="cust_marcus",
            event_date="Jun 03, 2026",
            event_type="app_updated",
            title="Application updated to v3.16",
            description="Installed Jammy v3.16 build release. Configuration initialized.",
            badge_variant="success",
            related_ticket_id=None
        ),
        MemoryTimelineEvent(
            customer_id="cust_marcus",
            event_date="Jul 15, 2026",
            event_type="issue_reported",
            title="Similar issue reported",
            description="Pipeline timeout hit during maven build. Ticket #7321 opened.",
            badge_variant="warning",
            related_ticket_id=7321
        ),
        MemoryTimelineEvent(
            customer_id="cust_marcus",
            event_date="Aug 12, 2026",
            event_type="solution_attempted",
            title="Cache clearing attempted",
            description="Cleared runner and local caches. Troubleshooting step failed; issue recurred.",
            badge_variant="danger",
            related_ticket_id=8841
        ),
        MemoryTimelineEvent(
            customer_id="cust_marcus",
            event_date="Aug 12, 2026",
            event_type="issue_resolved",
            title="Application reinstalled",
            description="Reinstalled application v3.16 with latest patch. Pipeline stabilized temporarily.",
            badge_variant="success",
            related_ticket_id=8841
        ),
        MemoryTimelineEvent(
            customer_id="cust_marcus",
            event_date="Sep 03, 2026",
            event_type="issue_reported",
            title="Application crash returned",
            description="Recurring pipeline timeout reported. Ticket #1027 under investigation.",
            badge_variant="danger",
            related_ticket_id=1027
        ),

        # Sarah Jenkins timeline
        MemoryTimelineEvent(
            customer_id="cust_sarah",
            event_date="2026-08-12",
            event_type="issue_reported",
            title="Application Crash Reported",
            description="Studio froze and crashed upon startup on Windows 11.",
            badge_variant="warning",
            related_ticket_id=992
        ),
        MemoryTimelineEvent(
            customer_id="cust_sarah",
            event_date="2026-08-12",
            event_type="solution_attempted",
            title="Local Cache Cleared",
            description="Cleared %APPDATA% directory cache files. Studio launched successfully.",
            badge_variant="info",
            related_ticket_id=992
        ),
        MemoryTimelineEvent(
            customer_id="cust_sarah",
            event_date="2026-08-12",
            event_type="issue_resolved",
            title="Issue Temporarily Resolved",
            description="Resolved for version 4.1.8.",
            badge_variant="success",
            related_ticket_id=992
        ),
        MemoryTimelineEvent(
            customer_id="cust_sarah",
            event_date="2026-09-03",
            event_type="app_updated",
            title="Application Updated to v4.2.0",
            description="Automatic monthly update installed build 4.2.0.",
            badge_variant="info",
            related_ticket_id=None
        ),
        MemoryTimelineEvent(
            customer_id="cust_sarah",
            event_date="2026-09-12",
            event_type="issue_reported",
            title="Crash Returned Post-Update",
            description="0xc0000005 access violation immediately after login. Cache clearing failed.",
            badge_variant="danger",
            related_ticket_id=1042
        ),
        MemoryTimelineEvent(
            customer_id="cust_sarah",
            event_date="2026-09-26",
            event_type="issue_reported",
            title="Crash Recurrence on Build 4.2.1",
            description="Update to 4.2.1 re-triggered crash. Ticket #1187 created.",
            badge_variant="danger",
            related_ticket_id=1187
        ),
        MemoryTimelineEvent(
            customer_id="cust_sarah",
            event_date="2026-09-27",
            event_type="support_contact",
            title="Customer Contacted Support",
            description="Customer returned for resolution on ticket #1187.",
            badge_variant="neutral",
            related_ticket_id=1187
        )
    ]
    db.add_all(timeline_events)
    db.commit()

    print("[RecallAI] Seeding Support Knowledge Base articles...")

    # 7. Support Knowledge Base Articles
    articles = [
        KnowledgeArticle(
            article_id="KB-2041",
            title="Troubleshooting recurring pipeline timeouts",
            category="CI/CD Pipeline",
            product="JAMMY v3.16 / Azure DevOps",
            summary="Troubleshooting recurring pipeline timeouts, container resource constraints, and runner service locks on Ubuntu 22.04 LTS.",
            content="When self-hosted runner agents encounter recurring timeouts during containerized builds on Jammy v3.16, clearing local caches is ineffective because the issue stems from unreleased file locks or application version mismatch. Reinstalling the application with the latest patch verified resolution in prior cases.",
            error_codes="ERR_AGENT_JOB_TIMEOUT, ERR_PIPELINE_TIMEOUT, HANG_DETECTED",
            recommended_steps=json.dumps([
                "Rule out cache clearing (previously attempted and failed)",
                "Verify application binary version matches latest Jammy release",
                "Reinstall application package with latest patch shim",
                "Inspect runner process locks and container cgroup memory."
            ]),
            tags="pipeline, timeout, jammy, ubuntu, runner, recurring",
            created_at=now - timedelta(days=90),
            updated_at=now - timedelta(days=5)
        ),
        KnowledgeArticle(
            article_id="KB-1088",
            title="Resolving 0xc0000005 Access Violation Crashes on Windows 11",
            category="Application Crash",
            product="Fabrikam Dynamics Studio",
            summary="Fixing GPU hardware acceleration shader pipeline corruption on Windows 11 23H2 systems after product updates.",
            content="Updates to build 4.2 introduce modern DirectX 12 hardware rasterization features that conflict with stale ShaderCache files on Intel Iris Xe and dedicated GPU adapters. Reinstalling the app leaves the user's LocalAppData ShaderCache intact, causing crashes to persist.",
            error_codes="EXCEPTION_ACCESS_VIOLATION, 0xc0000005, D3D12_DEVICE_HUNG",
            recommended_steps=json.dumps([
                "Rule out clearing roaming cache (ineffective against GPU shader faults)",
                "Purge local shader cache: Remove-Item -Recurse -Force $env:LOCALAPPDATA\\FabrikamDynamics\\ShaderCache",
                "Execute binary with GPU disable override: & 'FabrikamDynamics.exe' --disable-gpu --disable-software-rasterizer",
                "Verify display scaling does not exceed 175% on dual monitor docks."
            ]),
            tags="crash, windows-11, 0xc0000005, directx, gpu, shader, update",
            created_at=now - timedelta(days=120),
            updated_at=now - timedelta(days=8)
        ),
        KnowledgeArticle(
            article_id="KB-3104",
            title="Azure AD Connect Delta Sync Latency and Throttling Remediation",
            category="Azure AD Sync",
            product="Microsoft Entra ID / AAD Connect",
            summary="Remediating 429 throttling and delta synchronization delays in enterprise hybrid deployments with >10,000 objects.",
            content="When delta synchronization cycles exceed 30 minutes, the Azure AD Connect scheduler may experience queuing cascade. LocalDB growth and Graph API request rate limiting compound the latency.",
            error_codes="SYNC_CYCLE_TIMEOUT, HTTP_429_TOO_MANY_REQUESTS, STOPPED_SERVER_DOWN",
            recommended_steps=json.dumps([
                "Inspect scheduler health: Get-ADSyncScheduler",
                "Trigger immediate delta cycle: Start-ADSyncSyncCycle -PolicyType Delta",
                "Apply sync throttling bypass registry key to enable 500-object parallel batches",
                "Check Microsoft Graph API tenant authentication token expiration status."
            ]),
            tags="azure-ad, aadsync, delta-sync, throttling, hybrid, entra",
            created_at=now - timedelta(days=100),
            updated_at=now - timedelta(days=12)
        ),
        KnowledgeArticle(
            article_id="KB-4209",
            title="Resolving Webhook TLS 1.3 Handshake Timeouts and CA Chain Gaps",
            category="SSL & Webhooks",
            product="API Gateway / Webhooks",
            summary="Diagnosing depth 1 certificate verification failures in Node.js and macOS environments.",
            content="Node.js 20 strict TLS 1.3 implementation rejects certificates when intermediate certificate authority chains omit cross-signed root anchors (e.g. Let's Encrypt ISRG Root X1 vs DST Root CA X3). Disabling HTTP keep-alive does not address the cryptographic handshake.",
            error_codes="UNABLE_TO_VERIFY_LEAF_SIGNATURE, ETIMEDOUT, CERT_HAS_EXPIRED",
            recommended_steps=json.dumps([
                "Rule out disabling HTTP keep-alive (unrelated to cryptographic handshake)",
                "Test server certificate presentation: openssl s_client -connect HOST:443 -servername HOST -showcerts",
                "Inject ISRG Root X1 root bundle into runtime ssl configuration options."
            ]),
            tags="ssl, tls, webhook, nodejs, certificates, openssl",
            created_at=now - timedelta(days=80),
            updated_at=now - timedelta(days=15)
        ),
        KnowledgeArticle(
            article_id="KB-5502",
            title="PgBouncer Connection Pool Saturation and Idle Transaction Mitigation",
            category="Database",
            product="PostgreSQL / PgBouncer",
            summary="Preventing server connection starvation and memory exhaustion in high-throughput transactional database clusters.",
            content="Increasing raw max_connections in postgresql.conf without adjusting work_mem risks Linux kernel OOM kills. In PgBouncer transaction pooling mode, connections hanging in 'idle in transaction' starve the client pool.",
            error_codes="FATAL_REMAINING_CONNECTION_SLOTS_RESERVED, SERVER_LOGIN_RETRY, ERR_POOL_EXHAUSTED",
            recommended_steps=json.dumps([
                "Do NOT raise max_connections beyond hardware limits (causes OOM swapping)",
                "Inspect pool saturation: SHOW POOLS in pgbouncer admin console",
                "Identify idle transactions: SELECT pid, now() - state_change FROM pg_stat_activity WHERE state = 'idle in transaction'",
                "Set idle_in_transaction_session_timeout = 30000ms."
            ]),
            tags="database, postgresql, pgbouncer, connection-pool, oom, performance",
            created_at=now - timedelta(days=70),
            updated_at=now - timedelta(days=10)
        )
    ]
    db.add_all(articles)
    db.commit()

    print("[RecallAI] Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
