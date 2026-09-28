import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from ..models.base import get_db
from ..models.entities import KnowledgeArticle
from ..services.web_crawler import UniversalWebCrawler

router = APIRouter(prefix="/crawler", tags=["Universal Knowledge & Crawler"])

class IngestUrlRequest(BaseModel):
    url: str
    category: Optional[str] = None
    product: Optional[str] = None

class IngestTextRequest(BaseModel):
    title: str
    content: str
    steps: Optional[List[str]] = []
    category: Optional[str] = "Universal Technical Guide"
    product: Optional[str] = "Universal Product"
    error_codes: Optional[str] = ""
    tags: Optional[str] = ""

class IngestResponse(BaseModel):
    success: bool
    article_id: str
    title: str
    category: str
    product: str
    summary: str
    steps: List[str]
    error_codes: str
    tags: str
    source_url: Optional[str] = None
    created_at: str

@router.post("/ingest-url", response_model=IngestResponse)
async def ingest_url_endpoint(request: IngestUrlRequest, db: Session = Depends(get_db)):
    """
    Crawls any website/documentation URL, extracts structured troubleshooting
    steps and root causes, and immediately trains RecallAI's Knowledge Engine.
    """
    try:
        res = await UniversalWebCrawler.ingest_url(
            url=request.url,
            db=db,
            override_category=request.category,
            override_product=request.product
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to crawl and ingest URL: {str(e)}")

@router.post("/ingest-text", response_model=Dict[str, Any])
def ingest_text_endpoint(request: IngestTextRequest, db: Session = Depends(get_db)):
    """Directly ingests manual domain knowledge or repair procedures."""
    try:
        res = UniversalWebCrawler.ingest_manual_text(
            title=request.title,
            content=request.content,
            steps=request.steps or [],
            category=request.category,
            product=request.product,
            error_codes=request.error_codes or "",
            tags=request.tags or "",
            db=db
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/articles")
def list_articles(
    search: Optional[str] = Query(None),
    product: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Lists all ingested universal knowledge articles."""
    query = db.query(KnowledgeArticle)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (KnowledgeArticle.title.ilike(s)) |
            (KnowledgeArticle.summary.ilike(s)) |
            (KnowledgeArticle.content.ilike(s)) |
            (KnowledgeArticle.tags.ilike(s))
        )
    if product:
        query = query.filter(KnowledgeArticle.product.ilike(f"%{product}%"))
    if category:
        query = query.filter(KnowledgeArticle.category.ilike(f"%{category}%"))

    articles = query.order_by(KnowledgeArticle.updated_at.desc()).all()
    results = []
    for a in articles:
        steps = []
        try:
            if a.recommended_steps:
                steps = json.loads(a.recommended_steps)
        except Exception:
            steps = [a.recommended_steps]

        results.append({
            "id": a.id,
            "article_id": a.article_id,
            "title": a.title,
            "category": a.category,
            "product": a.product,
            "summary": a.summary,
            "content": a.content,
            "steps": steps,
            "error_codes": a.error_codes,
            "tags": a.tags,
            "updated_at": a.updated_at.isoformat() if a.updated_at else None
        })
    return {"total": len(results), "articles": results}

@router.get("/export-dataset")
def export_training_dataset(db: Session = Depends(get_db)):
    """
    Exports universal knowledge base into OpenAI/ChatML JSONL format
    for fine-tuning custom LLMs or evaluating troubleshooting accuracy.
    """
    data = UniversalWebCrawler.export_fine_tuning_dataset(db)
    return {
        "format": "openai_chatml_jsonl",
        "sample_count": len(data),
        "dataset": data
    }

@router.post("/seed-universal-knowledge")
def seed_universal_knowledge(db: Session = Depends(get_db)):
    """
    Populates comprehensive universal troubleshooting knowledge for common
    hardware, electronics, smart appliances, software, and error codes.
    """
    universal_guides = [
        {
            "article_id": "KB-UNIV-001",
            "title": "Universal Wi-Fi & Network Connection Failure Recovery",
            "category": "Connectivity & Wireless",
            "product": "Universal Network Device",
            "summary": "Step-by-step remediation for Wi-Fi disconnection, IP configuration errors, and authentication failures across Windows, Mac, iOS, and Android.",
            "content": "Wi-Fi dropouts typically occur due to DHCP lease timeouts, DNS resolution failure, or router 2.4GHz/5GHz band steering conflicts. Restarting network stack and releasing IP configuration solves 85% of connection drops.",
            "error_codes": "ERR_INTERNET_DISCONNECTED, DNS_PROBE_FINISHED_NO_INTERNET",
            "steps": [
                "Turn Wi-Fi off on the device, wait 10 seconds, and turn back on.",
                "Forget the Wi-Fi network and re-enter the WPA2/WPA3 password.",
                "Flush DNS cache (Windows: `ipconfig /flushdns`, macOS: `sudo dscacheutil -flushcache`).",
                "Restart the Wi-Fi router by disconnecting power for 30 seconds.",
                "If issues persist, assign static DNS to Google (8.8.8.8) or Cloudflare (1.1.1.1)."
            ],
            "tags": "wifi, network, internet, connection, dns, universal"
        },
        {
            "article_id": "KB-UNIV-002",
            "title": "Smartphone / Tablet Rapid Battery Drain & Thermal Throttling",
            "category": "Power & Battery",
            "product": "Universal Smartphone",
            "summary": "Root cause analysis and diagnostics for rapid battery depletion (drops >20% in an hour) and back panel overheating on mobile devices.",
            "content": "Severe battery drain with warmth near the upper logic board indicates high CPU background wake-locks or degraded lithium-ion cells with internal resistance.",
            "error_codes": "BATTERY_HEALTH_DEGRADED",
            "steps": [
                "Inspect Settings > Battery > Battery Usage to identify misbehaving background apps.",
                "Check Battery Health maximum capacity percentage (below 80% warrants hardware replacement).",
                "Disable Background App Refresh and high-accuracy location services for non-essential apps.",
                "Boot device into Safe Mode to isolate third-party software from system firmware.",
                "If battery drops precipitously from 80% to 20% in under 2 hours, book certified hardware technician for battery cell replacement under warranty."
            ],
            "tags": "battery, drain, overheating, smartphone, lithium, hardware"
        },
        {
            "article_id": "KB-UNIV-003",
            "title": "Laptop Thermal Throttling & Sudden System Freezes",
            "category": "Performance & Freezing",
            "product": "Universal Laptop",
            "summary": "Comprehensive guide to resolving system freezes, cursor lockup, and fan noise on Dell, HP, Lenovo, and Apple laptops.",
            "content": "Whole-device freezes where input is completely unresponsive often stem from GPU driver conflicts, clogged cooling heatsinks causing thermal shutdown, or corrupted system caches.",
            "error_codes": "0x00000124, WHEA_UNCORRECTABLE_ERROR",
            "steps": [
                "Check Task Manager or Activity Monitor for runaway processes consuming >90% CPU/Memory.",
                "Ensure ventilation grills are free from dust and laptop is resting on a hard, flat surface.",
                "Update OEM GPU and chipset drivers using official support utility (Dell SupportAssist / Lenovo Vantage).",
                "Run built-in hardware diagnostics (F12 on Dell, D key on Mac).",
                "If freeze recurs after cache reset, escalate to hardware inspection for thermal paste repasting."
            ],
            "tags": "laptop, freezing, overheat, thermal, fan, dell, macbook, lenovo"
        },
        {
            "article_id": "KB-UNIV-004",
            "title": "Bluetooth Audio Pairing Stutter & Device Sync Dropouts",
            "category": "Audio & Sound",
            "product": "Universal Bluetooth Headphones / Speaker",
            "summary": "Fixes for Bluetooth headphone disconnects, audio stutter, and pairing refusal on Sony, Bose, AirPods, and JBL devices.",
            "content": "Bluetooth audio packet drops occur when 2.4GHz RF interference or corrupted Bluetooth cache tables prevent AAC/LDAC codec handshakes.",
            "error_codes": "BT_ERR_HANDSHAKE_TIMEOUT",
            "steps": [
                "Place headphones in pairing mode (hold power button for 7-10 seconds until LED flashes blue/red).",
                "Delete/Forget the device from all previously paired phones, tablets, or computers.",
                "Reset headphone firmware to factory defaults (consult manufacturer button combo).",
                "Toggle Bluetooth off and on on the host device and reconnect.",
                "Switch Bluetooth audio codec to Standard AAC or SBC in developer settings if stutter persists."
            ],
            "tags": "bluetooth, audio, headphones, pairing, stutter, sony, bose, airpods"
        },
        {
            "article_id": "KB-UNIV-005",
            "title": "Smart TV / Monitor HDMI No Signal & Screen Flickering",
            "category": "Display & Screen",
            "product": "Universal TV / Monitor",
            "summary": "Resolution for black screen, HDMI handshaking errors, and display flickering on smart TVs and external monitors.",
            "content": "HDMI handshake failures (HDCP mismatch) cause intermittent black screens or 'No Signal' notifications even when cables are connected.",
            "error_codes": "HDCP_AUTH_FAIL",
            "steps": [
                "Power cycle both the display and source device by unplugging from wall socket for 60 seconds.",
                "Inspect HDMI cable and reconnect to HDMI Port 1 (eARC/ARC) securely.",
                "Test with a certified High-Speed HDMI 2.1 cable to eliminate bandwidth degradation.",
                "Adjust display resolution and refresh rate (switch from 120Hz to 60Hz to test stability).",
                "Update TV/Monitor firmware via Wi-Fi or USB."
            ],
            "tags": "hdmi, display, monitor, tv, screen, flicker, no signal"
        },
        {
            "article_id": "KB-UNIV-006",
            "title": "Smart Refrigerator / Appliance Inadequate Cooling Troubleshooting",
            "category": "Smart Home Appliance",
            "product": "Smart Refrigerator",
            "summary": "Diagnostic workflow for smart refrigerators (Samsung, LG, Whirlpool) experiencing temperature rise or ice maker failure.",
            "content": "Lack of cooling often results from iced evaporator coils, dirty condenser coils restricting airflow, or a faulty door gasket seal allowing warm air ingress.",
            "error_codes": "ERR_DEFROST_SENSOR, CODE_22E",
            "steps": [
                "Verify condenser coils on the back/bottom are vacuumed clean of dust and pet hair.",
                "Check door gasket seal with a dollar-bill test (if it pulls out easily, seal needs replacement).",
                "Ensure minimum 2-inch clearance around refrigerator sides and back for air circulation.",
                "Perform a 24-hour manual defrost if evaporator coils are frosted over.",
                "If compressor does not kick on, schedule warranty technician dispatch for sealed system inspection."
            ],
            "tags": "refrigerator, appliance, cooling, compressor, samsung, lg, whirlpool"
        }
    ]

    added = 0
    for g in universal_guides:
        existing = db.query(KnowledgeArticle).filter(KnowledgeArticle.article_id == g["article_id"]).first()
        if not existing:
            kb = KnowledgeArticle(
                article_id=g["article_id"],
                title=g["title"],
                category=g["category"],
                product=g["product"],
                summary=g["summary"],
                content=g["content"],
                error_codes=g["error_codes"],
                recommended_steps=json.dumps(g["steps"]),
                tags=g["tags"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(kb)
            added += 1

    db.commit()
    return {"status": "success", "articles_seeded": added, "total_universal_guides": len(universal_guides)}
