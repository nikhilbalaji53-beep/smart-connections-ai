from typing import Dict, Any, List, Tuple
from ...schemas.schemas import MemoryUsedItem

class ConnectivitySoftwareAgent:
    """
    Specialized AI Agent for Cellular Networks, SIM/eSIM, Wi-Fi, Bluetooth,
    Firmware Updates, Freezing, and OS issues.
    """
    AGENT_NAME = "Connectivity & Software Agent"
    AGENT_BADGE = "🌐 Network & Software Specialist"

    @classmethod
    def can_handle(cls, msg: str) -> bool:
        msg_l = msg.lower()
        keywords = [
            "sim not detected", "no service", "no sim", "esim", "emergency calls only", "cellular",
            "mobile data not working", "wifi disconnecting", "bluetooth stutter", "bluetooth pairing",
            "wont connect to wifi", "dns error", "system update failed", "bootloop", "stuck on logo",
            "app crashing", "freezing constantly", "slow performance", "lagging"
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
            detail=f"Engaged network and software diagnostics for {product_name} ({order_number})"
        ))

        # 1. SIM Card / No Service / Cellular
        if any(w in msg_l for w in ["sim", "service", "signal", "cellular", "carrier", "mobile data"]):
            text = (
                f"Let's resolve the cellular connectivity issue on your **{product_name}** ({order_number}), {customer_name}.\n\n"
                f"### 📶 Cellular & SIM Troubleshooting Protocol:\n\n"
                f"1. **Toggle Airplane Mode:** Turn Airplane Mode ON for 15 seconds, then turn it OFF to force tower re-registration.\n"
                f"2. **Re-seat SIM Card:** Eject the physical SIM tray, gently clean the gold contacts with a dry microfibre cloth, and inspect the SIM for scratches.\n"
                f"3. **Reset Network Settings:** Go to *Settings > General Management / System > Reset > Reset Network Settings* (this refreshes APN profiles and cellular radios without deleting personal data).\n"
                f"4. **Carrier Network Check:** Test the SIM in another slot or verify with your telecom operator if 5G/4G provisioning is active.\n\n"
                f"Does the device display 'No SIM', 'Emergency Calls Only', or 'No Service'?"
            )
            suggested_actions = ["Reset Network Settings Guide", "APN Configuration Helper", "Check SIM Card Health"]
            return text, "Execute cellular network diagnostic protocol", "Reset Network Settings Guide", suggested_actions, memory_used_badges

        # 2. Bootloop / Stuck on Logo / OS Update Failure
        if any(w in msg_l for w in ["bootloop", "stuck on logo", "wont turn on", "update failed", "black screen with logo"]):
            text = (
                f"### ⚙️ OS Recovery Protocol for {product_name}:\n\n"
                f"If your device is stuck in a restart loop or won't boot past the manufacturer logo:\n\n"
                f"1. **Forced Soft Reset:** Press and hold **Power + Volume Down** simultaneously for 10-15 seconds until the screen goes blank and restarts.\n"
                f"2. **Wipe Cache Partition (Safe, No Data Loss):**\n"
                f"   Connect the device to a PC via USB cable, press and hold **Power + Volume Up** until the Android Recovery menu appears, select *Wipe Cache Partition*, and choose *Reboot System Now*.\n"
                f"3. **Safe Mode Boot:** If caused by a recently installed app, boot into Safe Mode to uninstall problematic software.\n\n"
                f"Would you like me to guide you through Safe Mode or arrange firmware re-flashing with a technician?"
            )
            suggested_actions = ["Wipe Cache Partition Guide", "Safe Mode Boot Guide", "Book Technician for Firmware Flash"]
            return text, "Guide system recovery and cache partition remediation", "Wipe Cache Partition Guide", suggested_actions, memory_used_badges

        # Default Connectivity
        text = (
            f"I have initialized the Connectivity & Software Specialist Agent for your **{product_name}** (Order {order_number} from {platform}).\n\n"
            f"I can assist you with:\n"
            f"• Wi-Fi & Bluetooth signal dropouts\n"
            f"• SIM card detection & 5G/4G network provisioning\n"
            f"• App crashes, system freezes & firmware update errors\n\n"
            f"Please share details of what you are experiencing."
        )
        suggested_actions = ["Wi-Fi Troubleshooting", "Bluetooth Diagnostics", "SIM Network Helper"]
        return text, "Connectivity and software assistance", "Wi-Fi Troubleshooting", suggested_actions, memory_used_badges
