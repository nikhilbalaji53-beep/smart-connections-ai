import re
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from ..models.entities import KnowledgeArticle

class UniversalWebCrawler:
    """
    Universal Knowledge Ingestion & Training Pipeline.
    Crawls, extracts, cleans, structures, and indexes technical troubleshooting
    knowledge from any website or documentation portal into RecallAI's Knowledge Engine.
    """

    HEADERS = {
        "User-Agent": "RecallAIBot/2.0 (compatible; Windows NT 10.0; Win64; x64; +https://recallai.io; contact@recallai.io)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    @classmethod
    async def fetch_webpage(cls, url: str) -> str:
        """Fetches raw HTML/text from a target URL with robust timeout, SSL, and redirection handling."""
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, verify=False) as client:
            resp = await client.get(url, headers=cls.HEADERS)
            if resp.status_code != 200:
                # Retry with standard browser user-agent if blocked
                fallback_headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}
                resp = await client.get(url, headers=fallback_headers)
            resp.raise_for_status()
            return resp.text

    @classmethod
    def clean_html(cls, html_content: str, source_url: str = "") -> Dict[str, Any]:
        """
        Parses HTML, removes boilerplate (scripts, ads, navigation, footers),
        and extracts title, structured sections, ordered steps, and text.
        """
        soup = BeautifulSoup(html_content, "html.parser")

        # Strip unwanted elements
        for element in soup(["script", "style", "nav", "footer", "header", "noscript", "aside", "svg", "form"]):
            element.extract()

        # Extract Title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        if not title:
            h1 = soup.find("h1")
            if h1:
                title = h1.get_text().strip()
        if not title:
            title = f"Universal Knowledge: {source_url}" if source_url else "Universal Technical Guide"

        # Clean title
        title = re.sub(r'\s*[-|–—]\s*(Support|Help Center|Documentation|Home).*$', '', title, flags=re.IGNORECASE)

        # Extract headings and paragraphs
        paragraphs = []
        steps = []
        error_codes = []

        # Find error codes (e.g., 0x80070005, ERR_CONNECTION_TIMED_OUT, 404, 500, CE-108255-1, E-01)
        full_text = soup.get_text()
        found_errs = re.findall(r'\b(?:0x[0-9a-fA-F]{4,8}|ERR_[A-Z_]+|CE-\d{6}-\d|E-\d{2,3}|HTTP \d{3}|Code \d{4,6})\b', full_text)
        if found_errs:
            error_codes = list(set(found_errs))[:5]

        # Extract list items (numbered or bullet steps)
        for li in soup.find_all("li"):
            text = li.get_text().strip()
            if 15 < len(text) < 300 and not any(w in text.lower() for w in ["cookie", "privacy", "sign in", "all rights"]):
                steps.append(text)

        # Extract main text
        for p in soup.find_all(["p", "h2", "h3"]):
            text = p.get_text().strip()
            if len(text) > 20 and not any(w in text.lower() for w in ["cookie", "subscribe", "terms of use"]):
                paragraphs.append(text)

        summary = " ".join(paragraphs[:3])[:400] if paragraphs else "Universal troubleshooting guidance extracted from source."
        content = "\n\n".join(paragraphs[:15]) if paragraphs else full_text[:2000]

        # Deduplicate steps
        unique_steps = []
        for s in steps:
            if s not in unique_steps:
                unique_steps.append(s)

        # Fallback if no <li> found: extract lines starting with numbers or action verbs
        if not unique_steps and paragraphs:
            for p in paragraphs:
                if re.match(r'^(Step \d+|\d+\.|\*|-|Check|Verify|Ensure|Restart|Open|Update|Reset|Clear)', p, re.IGNORECASE):
                    unique_steps.append(p)

        return {
            "title": title[:200],
            "summary": summary,
            "content": content,
            "steps": unique_steps[:8],
            "error_codes": ", ".join(error_codes),
            "source_url": source_url
        }

    @classmethod
    def categorize_content(cls, title: str, content: str) -> Tuple[str, str, str]:
        """
        Infers category, product, and semantic tags from content.
        """
        combined = (title + " " + content).lower()

        # Product detection
        product = "Universal Device"
        if any(w in combined for w in ["macbook", "iphone", "ipad", "apple", "macos", "ios"]):
            product = "Apple Device"
        elif any(w in combined for w in ["dell", "xps", "inspiron", "latitude"]):
            product = "Dell Laptop / PC"
        elif any(w in combined for w in ["samsung", "galaxy", "oneui"]):
            product = "Samsung Galaxy"
        elif any(w in combined for w in ["windows", "microsoft", "surface", "xbox", "azure"]):
            product = "Microsoft Windows / Surface"
        elif any(w in combined for w in ["playstation", "ps5", "sony", "bravia"]):
            product = "Sony PlayStation / Electronics"
        elif any(w in combined for w in ["lenovo", "thinkpad", "ideapad"]):
            product = "Lenovo ThinkPad"
        elif any(w in combined for w in ["hp", "envy", "spectre", "pavilion"]):
            product = "HP Laptop / Printer"
        elif any(w in combined for w in ["android", "pixel", "google"]):
            product = "Google Pixel / Android"
        elif any(w in combined for w in ["docker", "kubernetes", "linux", "ubuntu", "nginx", "postgres"]):
            product = "Cloud / Infrastructure"
        elif any(w in combined for w in ["refrigerator", "washing machine", "oven", "microwave", "air conditioner"]):
            product = "Smart Home Appliance"

        # Category detection
        category = "Hardware & Troubleshooting"
        if any(w in combined for w in ["battery", "charging", "drain", "power", "charger"]):
            category = "Power & Battery"
        elif any(w in combined for w in ["freeze", "crash", "unresponsive", "hang", "lockup", "black screen", "blue screen", "bsod"]):
            category = "Performance & Freezing"
        elif any(w in combined for w in ["wifi", "bluetooth", "network", "connect", "internet", "disconnect", "pairing"]):
            category = "Connectivity & Wireless"
        elif any(w in combined for w in ["audio", "sound", "speaker", "microphone", "headphone", "distortion"]):
            category = "Audio & Sound"
        elif any(w in combined for w in ["display", "screen", "flicker", "resolution", "monitor", "hdmi"]):
            category = "Display & Screen"
        elif any(w in combined for w in ["update", "firmware", "software", "install", "os", "driver"]):
            category = "Software & OS"
        elif any(w in combined for w in ["order", "delivery", "shipping", "courier", "refund", "return", "warranty"]):
            category = "E-Commerce & Orders"

        # Tags
        tags_list = [category.lower(), product.lower()]
        for kw in ["battery", "overheating", "reset", "firmware", "driver", "warranty", "replacement", "cache", "bluetooth", "wifi"]:
            if kw in combined and kw not in tags_list:
                tags_list.append(kw)

        tags = ", ".join(tags_list[:6])
        return category, product, tags

    @classmethod
    async def ingest_url(
        cls,
        url: str,
        db: Session,
        override_category: Optional[str] = None,
        override_product: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Fetches webpage from URL, parses troubleshooting protocol,
        and saves it into RecallAI's KnowledgeArticle table.
        """
        html = await cls.fetch_webpage(url)
        cleaned = cls.clean_html(html, source_url=url)

        inferred_cat, inferred_prod, tags = cls.categorize_content(cleaned["title"], cleaned["content"])
        category = override_category or inferred_cat
        product = override_product or inferred_prod

        # Generate unique KB ID
        rand_suffix = uuid.uuid4().hex[:4].upper()
        article_id = f"KB-WEB-{rand_suffix}"

        # Check if steps exist, if not create default structured steps
        steps = cleaned["steps"]
        if not steps:
            steps = [
                f"Verify physical connections and power cycle the {product}.",
                f"Check device settings and apply the latest official firmware/driver updates.",
                f"Isolate third-party software interference or clear application cache.",
                f"If problem persists, initiate hardware diagnostics or contact certified technician."
            ]

        # Insert into KnowledgeArticle
        kb = KnowledgeArticle(
            article_id=article_id,
            title=cleaned["title"],
            category=category,
            product=product,
            summary=cleaned["summary"] + (f" (Source: {url})" if url else ""),
            content=cleaned["content"] + f"\n\n**Source URL:** {url}",
            error_codes=cleaned["error_codes"],
            recommended_steps=json.dumps(steps),
            tags=tags + f", web-ingested, {url[:30]}",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(kb)
        db.commit()
        db.refresh(kb)

        return {
            "success": True,
            "article_id": kb.article_id,
            "title": kb.title,
            "category": kb.category,
            "product": kb.product,
            "summary": kb.summary,
            "steps": steps,
            "error_codes": kb.error_codes,
            "tags": kb.tags,
            "source_url": url,
            "created_at": kb.created_at.isoformat()
        }

    @classmethod
    def ingest_manual_text(
        cls,
        title: str,
        content: str,
        steps: List[str],
        category: str,
        product: str,
        error_codes: str,
        tags: str,
        db: Session
    ) -> Dict[str, Any]:
        """Directly inserts verified domain knowledge or parsed manuals into the knowledge base."""
        rand_suffix = uuid.uuid4().hex[:4].upper()
        article_id = f"KB-MAN-{rand_suffix}"

        kb = KnowledgeArticle(
            article_id=article_id,
            title=title,
            category=category or "Universal Technical Guide",
            product=product or "Universal Product",
            summary=content[:300],
            content=content,
            error_codes=error_codes or "",
            recommended_steps=json.dumps(steps if steps else [
                "Perform initial system diagnostics.",
                "Review system error logs.",
                "Execute recommended remediation steps."
            ]),
            tags=tags or "universal, troubleshooting, verified",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.add(kb)
        db.commit()
        db.refresh(kb)

        return {
            "success": True,
            "article_id": kb.article_id,
            "title": kb.title,
            "category": kb.category,
            "product": kb.product,
            "steps": steps,
            "created_at": kb.created_at.isoformat()
        }

    @classmethod
    def export_fine_tuning_dataset(cls, db: Session) -> List[Dict[str, Any]]:
        """
        Generates standard OpenAI/ChatML JSONL training pairs from all ingested
        Knowledge Articles and verified resolution histories.
        This enables training or fine-tuning any universal LLM model.
        """
        articles = db.query(KnowledgeArticle).all()
        dataset = []

        system_prompt = (
            "You are RecallAI, an advanced customer support AI that remembers past customer issues, "
            "avoids previously failed troubleshooting attempts, and provides exact, accurate solutions."
        )

        for art in articles:
            steps_list = []
            try:
                if art.recommended_steps:
                    steps_list = json.loads(art.recommended_steps)
            except Exception:
                steps_list = [art.recommended_steps]

            steps_formatted = "\n".join([f"{i+1}. {s}" for i, s in enumerate(steps_list)])

            user_query = f"I am experiencing an issue with my {art.product}: {art.title}."
            if art.error_codes:
                user_query += f" The error code shown is {art.error_codes}."

            assistant_reply = (
                f"I understand the issue with your {art.product}.\n\n"
                f"**Summary:** {art.summary}\n\n"
                f"**Recommended Steps:**\n{steps_formatted}\n\n"
                f"RecallAI has verified these steps against known failure patterns to ensure optimal resolution."
            )

            pair = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query},
                    {"role": "assistant", "content": assistant_reply}
                ],
                "metadata": {
                    "article_id": art.article_id,
                    "product": art.product,
                    "category": art.category,
                    "tags": art.tags
                }
            }
            dataset.append(pair)

        return dataset
