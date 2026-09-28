from typing import Dict, Any, List, Tuple
from ...schemas.schemas import MemoryUsedItem

class GeneralSupportAgent:
    """
    Specialized AI Agent for How-To Guides, Data Transfers, Backups,
    Settings Configuration, and General Troubleshooting.
    """
    AGENT_NAME = "General Support & Assistant Agent"
    AGENT_BADGE = "💡 General Tech Assistant"

    @classmethod
    def can_handle(cls, msg: str) -> bool:
        return True  # Fallback handler

    @classmethod
    def resolve(
        cls,
        user_message: str,
        customer_name: str,
        product_name: str,
        order_number: str,
        platform: str,
        warranty_status: str,
        memory_used_badges: List[MemoryUsedItem]
    ) -> Tuple[str, str, str, List[str], List[MemoryUsedItem]]:
        msg_l = user_message.lower()

        memory_used_badges.append(MemoryUsedItem(
            type="environment",
            title=f"AI Agent: {cls.AGENT_NAME}",
            detail=f"Contextual technical assistance for {product_name} ({order_number})"
        ))

        # 1. Transfer Data / Smart Switch / Backups
        if any(w in msg_l for w in ["transfer", "backup", "smart switch", "move photos", "cloud", "google drive"]):
            text = (
                f"Here is the verified data transfer and backup workflow for your **{product_name}**, {customer_name}:\n\n"
                f"### 📲 Data Transfer & Backup Steps:\n\n"
                f"1. **Wireless Transfer via Smart Switch / Quick Start:**\n"
                f"   Install Smart Switch or open Quick Start on both devices, connect to the same Wi-Fi network, and select *Send Data > Wireless*.\n\n"
                f"2. **Google Drive / Cloud Backup:**\n"
                f"   Go to *Settings > Accounts and Backup > Back up data* to sync your contacts, messages, apps, and photos automatically.\n\n"
                f"3. **PC / Mac Backup:**\n"
                f"   Connect your device via USB cable and use official PC backup utilities (Samsung Smart Switch PC / iTunes / Finder) for full encrypted local backups.\n\n"
                f"Would you like detailed guidance for transferring from an iPhone, Android, or PC?"
            )
            suggested_actions = ["Smart Switch Transfer Guide", "Cloud Backup Setup", "PC Backup Instructions"]
            return text, "Guide data backup and device transfer protocol", "Smart Switch Transfer Guide", suggested_actions, memory_used_badges

        # 2. Camera / Photos / Storage Full
        if any(w in msg_l for w in ["storage full", "camera", "photo", "clear space", "memory full", "internal storage", "clean it", "storage is", "out of space", "free up space"]):
            text = (
                f"Let's optimize storage and performance on your **{product_name}** ({order_number}), {customer_name}.\n\n"
                f"1. **Analyze Storage:** Open *Settings > Device Care / Storage* to inspect large files, unused apps, and duplicate media.\n"
                f"2. **Clear App Cache:** Go to *Settings > Apps > Filter by Size* and clear cache on high-consumption apps (social media, streaming, browser).\n"
                f"3. **Cloud Offloading:** Enable Google Photos / OneDrive auto-backup and tap *Free up space* to remove backed-up local copies.\n\n"
                f"Would you like me to guide you through cleaning system junk or managing cloud sync?"
            )
            suggested_actions = ["Free Up Storage Guide", "Clear App Cache", "Cloud Backup Setup"]
            return text, "Guide storage optimization workflow", "Free Up Storage Guide", suggested_actions, memory_used_badges

        # 3. Dynamic Universal Problem Resolver for ANY query via DialogueEngine
        from ..dialogue_engine import DialogueEngine
        return DialogueEngine.generate_contextual_response(
            customer_name=customer_name,
            product_name=product_name,
            order_number=order_number,
            platform=platform,
            warranty_status=warranty_status,
            latest_message=user_message,
            conversation_history=[],
            memory_used_badges=memory_used_badges
        )
