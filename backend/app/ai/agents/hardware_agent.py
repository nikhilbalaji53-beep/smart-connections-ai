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

        # 4. Diagnostic Step Responses (Progression from Step 1)
        if any(w in msg_l for w in ["amber", "flashing", "blinking", "white light", "flashing light", "blinking light"]):
            text = (
                f"An amber-and-white blinking light pattern on your **{product_name}** indicates a specific Dell POST hardware diagnostic code:\n\n"
                f"• **2 Amber, 3 White:** System memory (RAM) failure or unseated memory module\n"
                f"• **3 Amber, 1 White:** CMOS battery or RTC power loss\n"
                f"• **2 Amber, 4 White:** Mainboard power management controller (PMIC) fault\n\n"
                f"Does the LED blink in a specific repeating pattern, or does it stay solid amber?"
            )
            suggested_actions = ["2 Amber, 3 White", "Solid Amber Light", "Flashing Continuously", "Book Technician"]
            return text, "Diagnose Dell LED blink code sequence", "Identify Blink Code", suggested_actions, memory_used_badges

        if any(w in msg_l for w in ["beep", "beeps", "beeping"]):
            text = (
                f"Diagnostic beep codes on your **{product_name}** signal a low-level hardware or BIOS POST failure:\n\n"
                f"• **1 Beep:** BIOS ROM checksum failure\n"
                f"• **3 Beeps:** System chipset or motherboard bus error\n"
                f"• **4 Beeps:** Memory read / write failure\n\n"
                f"How many distinct beeps do you hear before the pause?"
            )
            suggested_actions = ["Continuous Beeps", "3 Short Beeps", "4 Beeps", "Book Technician"]
            return text, "Analyze hardware diagnostic beep code sequence", "Analyze Beep Sequence", suggested_actions, memory_used_badges

        if any(w in msg_l for w in ["no light", "no lights", "no beep", "no beeps", "dark", "nothing happens", "not starting"]):
            text = (
                f"If the ePSA diagnostic does not launch and the status LED remains completely unlit, this indicates an open-circuit failure in the DC-in charging port or an internal PMIC motherboard power rail on your **{product_name}**.\n\n"
                f"Because your order {order_number} has **Active Warranty Protection ({warranty_status})**, this requires physical hardware inspection rather than software configuration.\n\n"
                f"Would you like to schedule an authorized technician visit for a motherboard/port repair under warranty?"
            )
            suggested_actions = ["Schedule Technician Visit", "Check Warranty Replacement", "Contact Specialist"]
            return text, "Hardware rail failure identified - Escalate to technician", "Book Technician", suggested_actions, memory_used_badges

        if any(w in msg_l for w in ["passed", "epsa test passed", "sensor check passed", "no errors", "healthy"]):
            text = (
                f"Excellent news! Your **{product_name}** passed the onboard hardware diagnostics without any component errors.\n\n"
                f"This confirms your processor, RAM, and motherboard logic gates are 100% healthy. The symptoms you experienced are rooted in OS power-driver calibration or background software draw rather than permanent hardware failure.\n\n"
                f"Next, let's reset the Windows ACPI Battery Driver or check battery health telemetry. Would you like instructions for driver reset?"
            )
            suggested_actions = ["Reset ACPI Battery Driver", "Run Battery Health Report", "Book Technician"]
            return text, "Hardware confirmed healthy - Proceed to OS driver diagnostic", "Reset ACPI Driver", suggested_actions, memory_used_badges

        # 5. Step 1 of Hardware Diagnostic Routine (Dell ePSA / Samsung *#0*#)
        if "laptop" in product_name.lower() or "dell" in product_name.lower():
            text = (
                f"Let's immediately begin **Step 1 of the Hardware Diagnostic Routine** for your **{product_name}**:\n\n"
                f"1. **Trigger Dell ePSA Diagnostics:** Shut down the laptop completely.\n"
                f"2. Hold down the **Fn key** on your keyboard, and while holding it down, press the **Power button** once.\n"
                f"3. Release both keys when the screen lights up with the Dell logo to launch the pre-boot hardware diagnostic utility.\n\n"
                f"Do you hear any diagnostic beeps or see colored flashing lights on the battery indicator?"
            )
            suggested_actions = ["Flashing Amber / White Light", "Diagnostic Beeps Heard", "No Lights or Beeps", "ePSA Test Passed"]
            return text, "Run Dell ePSA pre-boot hardware diagnostic", "Execute Dell ePSA", suggested_actions, memory_used_badges
        elif "phone" in product_name.lower() or "samsung" in product_name.lower():
            text = (
                f"Let's begin **Step 1 of the Hardware Diagnostic Routine** for your **{product_name}**:\n\n"
                f"1. Open your phone dialer keypad and enter `*#0*#` to open the Samsung Hardware Diagnostic Panel.\n"
                f"2. Tap **Sub Key**, **Touch**, and **Vibration** to test hardware sensors and display quadrants.\n\n"
                f"Does the phone register all quadrant touches, or does it freeze during the hardware test?"
            )
            suggested_actions = ["Hardware Sensors Passed", "Screen Freezes During Test", "Touch Quadrant Failed", "Book Technician"]
            return text, "Run Samsung mobile hardware diagnostic panel", "Execute *#0*#", suggested_actions, memory_used_badges
        else:
            text = (
                f"Let's begin **Step 1 of the Hardware Diagnostic Routine** for your **{product_name}** ({order_number}):\n\n"
                f"Please inspect the device power input and status LEDs. When connecting the original power cable, does the status indicator illuminate, flash, or remain completely unlit?"
            )
            suggested_actions = ["LED Illuminates Steady", "LED Flashes / Blinks", "LED Remains Dark", "Book Technician"]
            return text, "Hardware diagnostic power verification", "Verify Power LEDs", suggested_actions, memory_used_badges
