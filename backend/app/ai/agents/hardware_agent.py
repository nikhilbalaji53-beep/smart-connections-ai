from typing import Dict, Any, List, Tuple
from ...schemas.schemas import MemoryUsedItem

class HardwareDiagnosticsAgent:
    """
    Specialized AI Agent for Hardware Failures, Physical Damage, Liquid Ingress,
    Screens, Audio, Charging Ports, and Repair Service.
    """
    AGENT_NAME = "Hardware & Repair Specialist Agent"
    AGENT_BADGE = "🛠️ Hardware & Repair Specialist"

    @classmethod
    def can_handle(cls, msg: str) -> bool:
        msg_l = msg.lower()
        keywords = [
            "water damage", "dropped in water", "liquid", "wet", "cracked screen", "broken glass",
            "screen crack", "camera lens", "lens broken", "speaker crackling", "mic not working",
            "microphone", "cannot hear", "charging port", "loose port", "wont charge", "not charging",
            "hardware", "swollen battery", "bulging", "physical damage", "dropped my phone", "dropped laptop",
            "speaker is crackling", "distorted", "crackling", "distorted sound", "speaker distorted",
            "crackling and distorted", "audio crackling", "cracked", "broken", "glass", "shattered"
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
            detail=f"Engaged hardware diagnostics for {product_name} ({order_number})"
        ))

        # 1. Water / Liquid Ingress
        if any(w in msg_l for w in ["water", "liquid", "wet", "pool", "toilet", "rain"]):
            text = (
                f"### ⚠️ Emergency Liquid Damage Protocol for {product_name}:\n\n"
                f"**DO NOT plug the device into power and DO NOT place it in uncooked rice** (rice dust clogs ports and accelerates internal corrosion).\n\n"
                f"1. **Power Off Immediately:** Turn off the device right now to prevent short circuits on the motherboard.\n"
                f"2. **Remove Accessories & SIM:** Eject the SIM tray and remove any protective cases to allow moisture to escape.\n"
                f"3. **Drying Procedure:** Gently pat dry with a microfiber cloth and place in a well-ventilated area with silica gel packets or a gentle fan for 24-48 hours.\n"
                f"4. **Liquid Contact Indicator (LCI):** Once dried, check the SIM slot indicator (white = safe, pink/red = moisture detected).\n\n"
                f"Your {product_name} is registered under Order {order_number} ({platform}). If the device does not power on after drying, would you like me to book a certified technician inspection?"
            )
            suggested_actions = ["Schedule Hardware Inspection", "Liquid Warranty Policy", "Safe Drying Guide"]
            return text, "Execute liquid damage triage protocol", "Schedule Hardware Inspection", suggested_actions, memory_used_badges

        # 2. Audio / Speaker / Microphone Issue
        if any(w in msg_l for w in ["speaker", "mic", "microphone", "crackling", "distorted", "cannot hear", "audio", "buzzing", "muffled"]):
            text = (
                f"Let's troubleshoot the audio subsystem on your **{product_name}** ({order_number}), {customer_name}.\n\n"
                f"1. **Clear Speaker / Mic Grills:** Inspect the bottom microphone and earpiece grills for lint or debris using a dry, soft-bristled brush.\n"
                f"2. **Disable Bluetooth Audio Hijack:** Ensure your device is not inadvertently connected to a nearby Bluetooth headset or car stereo.\n"
                f"3. **Run Hardware Audio Test:** Open the phone dialer and enter `*#0*#` (Samsung) or use built-in diagnostics to test individual speakers and microphones.\n\n"
                f"Does the sound issue persist during phone calls, or when playing media?"
            )
            suggested_actions = ["Run Hardware Audio Diagnostics", "Clean Speaker Port Guide", "Book Technician"]
            return text, "Guide audio hardware diagnostic workflow", "Run Hardware Audio Diagnostics", suggested_actions, memory_used_badges

        # 3. Physical / Screen Damage
        if any(w in msg_l for w in ["cracked", "broken", "glass", "shattered", "camera lens", "dropped", "crack in", "screen crack"]):
            text = (
                f"I understand, {customer_name}. Physical damage to your **{product_name}** requires authorized component replacement to maintain safety and ingress protection.\n\n"
                f"• **Product:** {product_name} (Order {order_number} from {platform})\n"
                f"• **Warranty & Protection:** {warranty_status}\n\n"
                f"### 🛠️ Recommended Repair Path:\n"
                f"1. **Touch Digitizer / Display Panel:** We supply genuine OEM display panels with factory calibration.\n"
                f"2. **Pre-Repair Backup:** If touch is still partially responsive, back up your data to the cloud or PC.\n"
                f"3. **Doorstep Technician / Service Center:** We can dispatch a technician or arrange free courier pickup for express repair.\n\n"
                f"Would you like me to book a technician or calculate repair estimate under your coverage?"
            )
            suggested_actions = ["Book Technician", "Check Accidental Damage Coverage", "Pre-Repair Backup Help"]
            return text, "Offer authorized hardware repair & technician booking", "Book Technician", suggested_actions, memory_used_badges

        # Default Hardware Diagnostic
        text = (
            f"I have initialized the Hardware Diagnostic Agent for your **{product_name}** (Order {order_number} on {platform}).\n\n"
            f"Your active warranty status is: **{warranty_status}**.\n\n"
            f"Please describe the physical symptom (e.g. charging port, buttons, display, thermal), and I will guide you through targeted diagnostics or dispatch a certified repair technician."
        )
        suggested_actions = ["Book Technician", "Hardware Diagnostic Suite", "Warranty Claim"]
        return text, "Hardware repair assistance", "Book Technician", suggested_actions, memory_used_badges
