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
        # 4A. Specific LED behavior: Flashing Continuously (Amber)
        if any(w in msg_l for w in ["flashing continuously", "continuous amber", "continuously flashing", "constant flashing", "blinking continuously"]):
            text = (
                f"On your **{product_name}**, an LED continuously flashing amber indicates a power supply negotiation failure (unrecognized or unauthenticated AC adapter), inadequate voltage, or an unrecoverable battery cell fault preventing charging.\n\n"
                f"### 🛠️ Immediate Action Steps:\n"
                f"1. **Flea Power Drain & Hard Reset:** Disconnect the AC power adapter. Press and hold down the laptop's **Power button for 20–30 seconds** with the charger unplugged to completely discharge residual flea power from the motherboard capacitors.\n"
                f"2. **Direct Wall Outlet Test:** Inspect the charger tip and barrel pin for bends. Plug the adapter directly into an independent wall outlet (bypass surge protectors and multi-strips), then reconnect firmly to the laptop.\n\n"
                f"Since your purchase carries **Active Warranty Protection** (Order {order_number} on {platform}), if the continuous amber flashing persists after this reset, we can immediately arrange an authorized technician visit or file an expedited replacement."
            )
            suggested_actions = ["Reset Completed - Still Blinking Amber", "Reset Succeeded - Light Steady White", "Book Technician", "Claim Warranty"]
            return text, "Execute Dell flea power reset protocol", "Flea Power Reset", suggested_actions, memory_used_badges

        # 4B. Follow-up after flea power reset
        if any(w in msg_l for w in ["still blinking", "still amber", "reset failed", "still flashing", "did not work"]):
            text = (
                f"Thank you for completing the flea power drain. Because the amber light continues to flash after discharging residual current, this confirms internal battery cell degradation or a failure on the motherboard charging circuit (PMIC).\n\n"
                f"Under your **Active Warranty** (Order {order_number} via {platform}), you are eligible for zero-cost authorized component replacement.\n\n"
                f"Would you like to book an authorized technician visit for your {product_name}, or would you like to file a direct warranty replacement claim?"
            )
            suggested_actions = ["Book Technician", "Claim Warranty", "Speak with Specialist"]
            return text, "Hardware failure confirmed after reset - Escalate to technician", "Book Technician", suggested_actions, memory_used_badges

        if any(w in msg_l for w in ["steady white", "white light now", "reset succeeded", "working now", "light is white"]):
            text = (
                f"Great progress! The steady white light indicates that the power management IC has successfully negotiated charge delivery with your AC adapter.\n\n"
                f"Allow the laptop to charge for at least 30 minutes before powering it on to ensure the cells reach safe operating voltage.\n\n"
                f"Would you like instructions on generating a battery health report once booted?"
            )
            suggested_actions = ["Run Battery Health Report", "Save Troubleshooting Record", "All Set"]
            return text, "Power negotiation restored - Charge device", "Charge Device", suggested_actions, memory_used_badges

        # 4C. Specific Numbered Blink Codes (2 Amber, 3 White; etc.)
        if any(w in msg_l for w in ["2 amber", "3 amber", "amber, 3 white", "amber, 1 white"]):
            if "2 amber" in msg_l or "3 white" in msg_l:
                text = (
                    f"The **2 Amber, 3 White** blink code on your **{product_name}** indicates a system memory (RAM) failure or an unseated memory module.\n\n"
                    f"Because your laptop has **Active Warranty Protection**, an authorized technician can reseat or replace the memory module without voiding your warranty.\n\n"
                    f"Would you like to schedule a technician visit or initiate a warranty replacement claim?"
                )
                suggested_actions = ["Book Technician", "Claim Warranty", "Speak with Specialist"]
                return text, "Diagnose Dell RAM fault (2 Amber, 3 White)", "Book Technician", suggested_actions, memory_used_badges
            elif "3 amber" in msg_l or "1 white" in msg_l:
                text = (
                    f"The **3 Amber, 1 White** blink code on your **{product_name}** indicates a CMOS / RTC coin cell battery failure.\n\n"
                    f"Since your purchase carries **Active Warranty Protection**, we can dispatch an authorized technician or replace the module under warranty.\n\n"
                    f"Would you like to book a technician or file a claim?"
                )
                suggested_actions = ["Book Technician", "Claim Warranty", "Speak with Specialist"]
                return text, "Diagnose Dell CMOS battery fault (3 Amber, 1 White)", "Book Technician", suggested_actions, memory_used_badges

        # 4D. Solid Amber Light
        if any(w in msg_l for w in ["solid amber", "solid amber light"]):
            text = (
                f"A **Solid Amber** light on your **{product_name}** indicates that the battery charge has fallen below the critical operating threshold or that the internal cells have reached end-of-life.\n\n"
                f"Disconnect all external accessories, plug the charger into a direct wall outlet, and let it charge for 20 minutes without turning the laptop on. If the light remains solid amber, the battery pack requires replacement.\n\n"
                f"Would you like to schedule an authorized technician visit or claim your warranty replacement?"
            )
            suggested_actions = ["Book Technician", "Claim Warranty", "Speak with Specialist"]
            return text, "Diagnose Dell critical battery condition (Solid Amber)", "Book Technician", suggested_actions, memory_used_badges

        # 4E. General Amber / White Light Question (only if specific rhythm not yet identified)
        if any(w in msg_l for w in ["flashing amber / white light", "amber / white", "pattern"]):
            text = (
                f"To diagnose the exact Dell POST code on your **{product_name}**, we need to identify the blinking rhythm:\n\n"
                f"• Is the amber light **Flashing Continuously** without pausing?\n"
                f"• Or does it flash a counted sequence (such as **2 Amber, 3 White**)?\n\n"
                f"Please select what you observe on your battery status LED:"
            )
            suggested_actions = ["Flashing Continuously", "2 Amber, 3 White", "Solid Amber Light", "Book Technician"]
            return text, "Identify Dell POST blink code sequence", "Select Blink Pattern", suggested_actions, memory_used_badges

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
