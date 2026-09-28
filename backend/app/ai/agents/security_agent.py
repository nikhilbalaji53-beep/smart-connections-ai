from typing import Dict, Any, List, Tuple
from ...schemas.schemas import MemoryUsedItem

class SecurityRecoveryAgent:
    """
    Specialized AI Agent for Lost, Stolen, Security, Lockout & Account Protection issues.
    """
    AGENT_NAME = "Security & Device Recovery Agent"
    AGENT_BADGE = "🛡️ Security & Device Recovery Specialist"

    @classmethod
    def can_handle(cls, msg: str) -> bool:
        msg_l = msg.lower()
        keywords = [
            "lost my phone", "lost phone", "stolen", "lost device", "stolen phone", "find my phone",
            "track phone", "locate phone", "remote lock", "erase phone", "wipe device", "block imei",
            "blocked sim", "lost sim", "hacked", "stolen device", "forgot passcode", "locked out",
            "frp lock", "factory reset protection", "google account locked", "smartthings find",
            "lock screen passcode", "lock screen password", "forgot my passcode", "forgot password",
            "forgot pin", "forgot pattern", "unlock my phone", "screen lock", "passcode"
        ]
        return any(k in msg_l for k in keywords)

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
            detail=f"Dispatched specialized security workflow for {product_name} ({order_number})"
        ))

        # Check for Lost / Stolen Device
        if any(w in msg_l for w in ["lost", "stolen", "track", "locate", "where is"]):
            is_samsung = "samsung" in product_name.lower() or "galaxy" in product_name.lower()
            is_apple = "apple" in product_name.lower() or "iphone" in product_name.lower() or "macbook" in product_name.lower()

            tracking_tool = "Samsung SmartThings Find (smartthingsfind.samsung.com)" if is_samsung else (
                "Apple Find My (icloud.com/find)" if is_apple else "Google Find My Device (google.com/android/find)"
            )

            text = (
                f"I'm sorry to hear that, {customer_name}. Let's take immediate action to protect and locate your **{product_name}** (Order {order_number} from {platform}).\n\n"
                f"### 🚨 Immediate Emergency Protocol:\n\n"
                f"1. **Locate & Remote Ring:**\n"
                f"   Go to **{tracking_tool}** from any browser. You can view its real-time GPS location and play a sound even if the device is set to silent.\n\n"
                f"2. **Lock & Secure Data:**\n"
                f"   Enable **'Lost Mode'** or **'Lock Device'** from the portal to display a custom contact number on the lock screen and prevent unauthorized access.\n\n"
                f"3. **Suspend Your SIM Card:**\n"
                f"   Contact your cellular carrier immediately to block incoming/outgoing calls and prevent OTP theft.\n\n"
                f"4. **Blacklist IMEI & Insurance Claim:**\n"
                f"   Your purchase is verified under {platform}. You can file an IMEI block on the official CEIR portal and use your invoice for warranty/theft insurance claims.\n\n"
                f"Would you like me to guide you through remote wiping or retrieving your official invoice & IMEI details?"
            )
            suggested_actions = ["Track on Find My Device", "Retrieve IMEI & Invoice", "Remote Wipe Instructions", "Block Carrier SIM"]
            return text, "Execute lost device security protocol", "Track on Find My Device", suggested_actions, memory_used_badges

        # Passcode / Locked out
        if any(w in msg_l for w in ["locked out", "forgot passcode", "password", "frp", "pattern"]):
            text = (
                f"I can help you regain access to your **{product_name}**, {customer_name}.\n\n"
                f"### 🔐 Access Recovery Protocol:\n\n"
                f"1. **Official Account Unlock:**\n"
                f"   If you are signed into your manufacturer account, you can unlock the screen remotely via Find My Device / SmartThings Find without data loss.\n\n"
                f"2. **Factory Reset Recovery:**\n"
                f"   If remote unlock is disabled, boot into Recovery Mode (Power + Volume Up) and perform a Factory Data Reset.\n\n"
                f"3. **FRP / Security Verification:**\n"
                f"   Ensure you have your original Google/Apple ID credentials ready after reset to pass Factory Reset Protection.\n\n"
                f"Would you like step-by-step instructions for remote unlock or recovery mode?"
            )
            suggested_actions = ["Remote Unlock Guide", "Recovery Mode Reset", "FRP Verification Help"]
            return text, "Guide device lock recovery without data loss", "Remote Unlock Guide", suggested_actions, memory_used_badges

        # Default Security Response
        text = (
            f"Your security is our priority, {customer_name}. Regarding your **{product_name}** ({order_number}):\n\n"
            f"I have activated the Security & Recovery protocol. Please specify whether you need to:\n"
            f"• Locate or lock a misplaced device\n"
            f"• Wipe private data remotely\n"
            f"• Report theft and obtain IMEI proof for insurance\n\n"
            f"How would you like to proceed?"
        )
        suggested_actions = ["Locate Device", "Remote Lock & Wipe", "Retrieve Proof of Purchase"]
        return text, "Security assistant guidance", "Locate Device", suggested_actions, memory_used_badges
