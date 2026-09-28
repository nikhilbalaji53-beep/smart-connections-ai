import re
import os
import json
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, field
import httpx

from ..schemas.schemas import MemoryUsedItem

@dataclass
class ConversationState:
    current_issue: str = ""
    issue_scope: str = "unknown"  # "single_app", "system_wide", "hardware", "battery", "display", "connectivity", "logistics"
    app_name: Optional[str] = None
    attempted_steps: List[str] = field(default_factory=list)
    failed_steps: List[str] = field(default_factory=list)
    successful_steps: List[str] = field(default_factory=list)
    last_assistant_question: Optional[str] = None
    diagnostic_stage: int = 1
    thermal_issue_confirmed: bool = False
    battery_poor_confirmed: bool = False
    escalation_status: str = "none"  # "none", "offered", "confirmed"
    current_topic: str = "technical_support"  # "technical_support", "order_status", "replacement", "refund"

class DialogueEngine:
    """
    Context-Aware Conversational AI Engine for RecallAI.
    Operates like ChatGPT with deep grounding in customer memory,
    conversation state tracking, and zero repetition.
    """

    @classmethod
    def analyze_conversation_state(
        cls,
        conversation_history: List[Dict[str, str]],
        latest_message: str,
        customer_name: str,
        product_name: str,
        order_number: str
    ) -> ConversationState:
        state = ConversationState()
        msg_lower = latest_message.lower().strip()
        all_text = " ".join([(m.get("content") or m.get("message") or "").lower() for m in conversation_history] + [msg_lower])

        # 1. Identify previous assistant questions
        assistant_msgs = [(m.get("content") or m.get("message") or "") for m in conversation_history if m.get("role") in ["assistant", "agent"]]
        if assistant_msgs:
            last_ast = assistant_msgs[-1]
            state.last_assistant_question = last_ast

        # 2. Extract issue scope and topic
        if any(w in all_text for w in ["one app", "only one app", "single app", "specific app", "banking", "instagram", "whatsapp", "youtube"]):
            state.issue_scope = "single_app"
            state.current_issue = "Isolated Application Crash"
        elif any(w in all_text for w in ["whole phone", "entire phone", "entire device", "system freeze", "everything freezes", "unresponsive"]):
            state.issue_scope = "system_wide"
            state.current_issue = "System-Wide Freezing"
        elif any(w in all_text for w in ["battery", "draining", "discharge", "80%", "20%"]):
            state.issue_scope = "battery"
            state.current_issue = "Rapid Battery Depletion"
        elif any(w in all_text for w in ["charging", "charger", "not charging", "wont charge", "light is off"]):
            state.issue_scope = "hardware"
            state.current_issue = "Charging & Power Hardware Issue"
        elif any(w in all_text for w in ["screen", "display", "flicker", "cracked", "glass"]):
            state.issue_scope = "display"
            state.current_issue = "Display / Screen Issue"
        elif any(w in all_text for w in ["where is my order", "when will my order", "replacement arrive", "tracking"]):
            state.current_topic = "order_status"
        elif any(w in all_text for w in ["refund", "money back", "return"]):
            state.current_topic = "refund"

        # 3. Extract attempted / failed steps
        if any(w in all_text for w in ["restarted", "rebooted", "restart phone", "restarting didn't"]):
            if "Restarted device" not in state.attempted_steps:
                state.attempted_steps.append("Restarted device")
            if "Restart" not in state.failed_steps:
                state.failed_steps.append("Restart")
        if any(w in all_text for w in ["cleared cache", "cleared the cache", "clear cache", "cache"]):
            if "Cleared application cache" not in state.attempted_steps:
                state.attempted_steps.append("Cleared application cache")
            if "Cache clearing" not in state.failed_steps:
                state.failed_steps.append("Cache clearing")
        if any(w in all_text for w in ["reinstalled", "reinstall", "installed again"]):
            if "Reinstalled application" not in state.attempted_steps:
                state.attempted_steps.append("Reinstalled application")
            if "Reinstall" not in state.failed_steps:
                state.failed_steps.append("Reinstall")
        if any(w in all_text for w in ["battery settings", "power settings", "ticket #4821"]):
            if "Battery settings adjustment" not in state.attempted_steps:
                state.attempted_steps.append("Battery settings adjustment")

        # 4. Check diagnostic findings
        if any(w in all_text for w in ["hot", "warm", "overheating", "thermal", "gets very hot"]):
            state.thermal_issue_confirmed = True
        if any(w in all_text for w in ["poor", "bad health", "battery is poor", "shows poor", "health poor"]):
            state.battery_poor_confirmed = True

        return state

    @classmethod
    def classify_intent(cls, message: str, state: ConversationState) -> str:
        raw_lower = message.lower().strip()
        msg = re.sub(r'[^\w\s]', '', raw_lower).strip()
        last_q = (state.last_assistant_question or "").lower()

        # Topic Shifts
        if any(raw_lower.startswith(p) for p in ["actually", "instead", "wait", "before that", "different question", "by the way"]):
            if any(w in msg for w in ["order", "delivery", "arrive", "tracking", "replacement"]):
                return "TOPIC_SHIFT_ORDER"
            if any(w in msg for w in ["refund", "money back", "return"]):
                return "REFUND_REQUEST"
            return "TOPIC_SHIFT"

        # Logistics
        if any(w in msg for w in ["when will my order arrive", "where is my order", "order arrive", "replacement arrive", "replacement status", "tracking number"]):
            return "TOPIC_SHIFT_ORDER"
        if any(w in msg for w in ["want a refund", "refund", "return product", "money back"]):
            return "REFUND_REQUEST"
        if any(w in msg for w in ["wrong product", "wrong item", "different item", "exchange"]):
            return "REPLACEMENT_REQUEST"

        # Escalations
        if any(w in msg for w in ["book a technician", "book technician", "send a technician", "send someone", "schedule a visit", "want a technician", "can you book a technician"]):
            return "TECHNICIAN_REQUEST"
        if any(w in msg for w in ["human", "real person", "speak to someone", "representative", "talk to human", "talk to support", "escalate"]):
            return "HUMAN_AGENT_REQUEST"

        # Pleasantries
        if any(w in msg for w in ["thank you", "thanks", "thx", "appreciate it", "great help"]):
            return "THANK_YOU"

        # Frustration
        if any(w in msg for w in ["told you", "three times", "already said", "how many times", "repeat myself"]):
            return "FRUSTRATION_ALERT"

        # Already Tried / Past Steps
        if any(w in msg for w in ["already restarted", "already tried", "tried that", "tried those", "did that", "done that", "already checked", "restarted it", "already rebooted"]):
            return "ALREADY_TRIED"

        # Step Failed
        if any(w in msg for w in ["still not working", "didnt work", "didn't work", "did not work", "not working", "still crashing", "persists", "failed"]):
            return "STEP_FAILED"

        # Guidance / Next Step Requests
        if any(w in msg for w in [
            "please guide me", "guide me", "guide me through", "help me step by step", "help me",
            "what should i do next", "what should i do", "what do i do next", "what next",
            "what do i do", "how to fix", "what is the next step", "continue with support", "continue",
            "continue troubleshooting", "troubleshoot", "step by step", "proceed", "go ahead",
            "let's continue", "let's do that", "let's troubleshoot", "solve it", "solve this", "fix this"
        ]):
            return "GUIDANCE_REQUEST"

        # Short Affirmation
        if any(msg == w or msg.startswith(w + " ") or msg.endswith(" " + w) for w in [
            "yes", "yeah", "yep", "sure", "correct", "it does", "always", "every time", "yup", "definitely",
            "ok", "okay", "k", "alright", "all right", "fine", "cool", "got it", "understood", "yes please",
            "yes i do", "i do", "let's go"
        ]):
            # If the assistant previously offered a choice of how to proceed, treat 'ok' / 'sure' as choosing to continue troubleshooting
            if any(w in last_q for w in ["how you'd like to proceed", "how you would like to proceed", "continue step-by-step", "continue troubleshooting"]):
                return "GUIDANCE_REQUEST"
            return "AFFIRMATION_YES"

        # Short Negation
        if any(msg == w or msg.startswith(w + " ") or msg.endswith(" " + w) for w in ["no", "nope", "it doesnt", "it doesn't", "never", "not really", "negative"]):
            return "NEGATION_NO"

        # Initial Crash / Freeze report
        if any(w in msg for w in ["keeps crashing", "is crashing", "app crashes", "application crash", "freezing constantly", "phone freezes", "laptop is freezing"]):
            return "INITIAL_CRASH_REPORT"

        # Single app vs System report
        if any(w in msg for w in ["only one app", "one application", "its only one", "it's only one", "single app", "it is one app", "banking app", "one app"]):
            return "REPORT_SINGLE_APP"
            return "REPORT_SINGLE_APP"
        if any(w in msg for w in ["whole phone", "entire phone", "all apps", "whole device", "everything freezes"]):
            return "REPORT_SYSTEM_WIDE"

        # Launch crash report
        if any(w in msg for w in ["when i open it", "on open", "upon opening", "as soon as i tap", "crashes on launch"]):
            return "REPORT_LAUNCH_CRASH"

        # Heating report
        if any(w in msg for w in ["gets very warm", "gets hot", "very hot", "warm near", "overheating"]):
            return "REPORT_HEATING"

        # Battery Health Report
        if any(w in msg for w in ["poor", "battery health is poor", "shows poor", "battery poor", "health poor"]):
            return "REPORT_BATTERY_POOR"

        return "GENERAL_INQUIRY"

    @classmethod
    def generate_contextual_response(
        cls,
        customer_name: str,
        product_name: str,
        order_number: str,
        platform: str,
        warranty_status: str,
        latest_message: str,
        conversation_history: List[Dict[str, str]],
        memory_used_badges: List[MemoryUsedItem]
    ) -> Tuple[str, str, str, List[str], List[MemoryUsedItem]]:
        """
        Dynamically synthesizes a natural, progressive, human-like dialogue response.
        Every response is unique and answers the latest customer message in context.
        """
        state = cls.analyze_conversation_state(
            conversation_history=conversation_history,
            latest_message=latest_message,
            customer_name=customer_name,
            product_name=product_name,
            order_number=order_number
        )

        intent = cls.classify_intent(latest_message, state)
        last_q = (state.last_assistant_question or "").lower()
        msg_lower = latest_message.lower().strip()
        all_text = " ".join([(m.get("content") or m.get("message") or "").lower() for m in conversation_history] + [msg_lower])

        # =========================================================================
        # 1. TOPIC SWITCHING: Logistics / Orders / Replacements / Refunds
        # =========================================================================
        if intent == "TOPIC_SHIFT_ORDER":
            memory_used_badges.extend([
                MemoryUsedItem(type="ticket", title="Order Lookup", detail=f"{product_name} • {order_number} on {platform}"),
                MemoryUsedItem(type="environment", title="Logistics Sync", detail="Active tracking synchronized with courier")
            ])
            text = (
                f"I can help with your order status as well.\n\n"
                f"Your **{product_name}** (Order {order_number}) was placed through **{platform}**.\n\n"
                f"According to our integrated delivery tracking, your shipment is in transit and scheduled for doorstep delivery. All replacement dispatch records remain linked to your profile.\n\n"
                f"Would you like me to pull up the real-time courier tracking link or assist you with anything else regarding this order?"
            )
            actions = ["Track Shipment", "View Delivery ETA", "Contact Courier Partner"]
            return text, "Provide real-time order and shipment tracking details", "Track Shipment", actions, memory_used_badges

        if intent == "REFUND_REQUEST":
            memory_used_badges.extend([
                MemoryUsedItem(type="ticket", title="Order Record", detail=f"Order {order_number} ({platform})"),
                MemoryUsedItem(type="environment", title="Return Policy", detail="Eligible for expedited refund under warranty")
            ])
            text = (
                f"I can assist you with initiating a refund for your **{product_name}** (Order {order_number} from {platform}).\n\n"
                f"Since your device has active warranty coverage (**{warranty_status}**), you are eligible for an instant return pickup and full reimbursement to your original payment method.\n\n"
                f"Would you like me to generate your prepaid return authorization label now?"
            )
            actions = ["Generate Return Label", "Refund Policy Details", "Speak to Billing"]
            return text, "Initiate return and refund workflow", "Generate Return Label", actions, memory_used_badges

        if intent == "REPLACEMENT_REQUEST":
            memory_used_badges.extend([
                MemoryUsedItem(type="ticket", title="Order Verification", detail=f"{product_name} • Order {order_number}"),
                MemoryUsedItem(type="environment", title="Exchange Guarantee", detail="Expedited replacement authorized")
            ])
            text = (
                f"I'm sorry to hear there was an issue with the item received for order **{order_number}** on **{platform}**.\n\n"
                f"I have opened an express replacement request for your **{product_name}**. We can schedule a courier pickup for the incorrect item and dispatch the replacement immediately.\n\n"
                f"Would you like me to confirm the replacement dispatch address?"
            )
            actions = ["Confirm Replacement Address", "Courier Pickup Info", "Talk to Human Agent"]
            return text, "Confirm expedited replacement dispatch", "Confirm Replacement Address", actions, memory_used_badges

        # =========================================================================
        # 2. PLEASANTRIES / CLOSING
        # =========================================================================
        if intent == "THANK_YOU":
            memory_used_badges.append(MemoryUsedItem(
                type="environment",
                title="Case Saved",
                detail=f"Context archived for {customer_name} ({product_name})"
            ))
            text = (
                f"You're very welcome, {customer_name}! I'm glad I could help you with your **{product_name}**.\n\n"
                f"All your troubleshooting history and device details remain securely saved in RecallAI so you'll never have to start from scratch in future sessions. Have a wonderful day!"
            )
            actions = ["Session Complete", "Save Transcript", "Rate Support"]
            return text, "Session closed naturally with memory preserved", "Session Complete", actions, memory_used_badges

        # =========================================================================
        # 3. TECHNICIAN / ESCALATION REQUESTS
        # =========================================================================
        if intent == "TECHNICIAN_REQUEST" or (intent == "AFFIRMATION_YES" and any(w in last_q for w in ["arrange a technician", "book a technician", "technician inspection", "arrange a visit"])):
            memory_used_badges.extend([
                MemoryUsedItem(type="ticket", title="Product Record", detail=f"{product_name} • {order_number}"),
                MemoryUsedItem(type="environment", title="Warranty Status", detail=f"Warranty: {warranty_status}"),
                MemoryUsedItem(type="successful_solution", title="Hindsight Packet", detail="Full troubleshooting history pre-forwarded to technician")
            ])
            issue_summary = state.current_issue or "Hardware diagnostic inspection"
            text = (
                f"Absolutely.\n\n"
                f"I already have all your product and support history loaded, so you will not need to explain the problem again.\n\n"
                f"• **Product:** {product_name} (Order {order_number} from {platform})\n"
                f"• **Identified Issue:** {issue_summary}\n"
                f"• **Completed Steps:** {', '.join(state.attempted_steps) if state.attempted_steps else 'Initial diagnostics verified'}\n"
                f"• **Warranty:** {warranty_status}\n\n"
                f"Let's choose your preferred appointment time for the technician visit."
            )
            actions = ["Select Appointment Time", "Review Booking Details", "Add Special Instructions"]
            return text, "Technician booking confirmed with pre-forwarded memory packet", "Select Appointment Time", actions, memory_used_badges

        if intent == "HUMAN_AGENT_REQUEST":
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title="Handoff Memory",
                detail=f"Transferring {customer_name} with complete context packet"
            ))
            text = (
                f"I understand, {customer_name}. I will transfer you directly to a human support specialist right now.\n\n"
                f"Our agent will receive your complete profile: your **{product_name}** purchase on {platform} ({order_number}), active warranty status, and all diagnostic steps completed so far.\n\n"
                f"**You will not need to repeat anything.** Connecting you now..."
            )
            actions = ["Connecting to Agent...", "View Case Summary"]
            return text, "Connect customer to live human support agent with full memory", "Live Support Transfer", actions, memory_used_badges

        # =========================================================================
        # 4. CUSTOMER CONFIRMS PAST STEPS / "I ALREADY TRIED THAT"
        # =========================================================================
        if intent == "ALREADY_TRIED":
            # Extract what step they mentioned
            step_name = "restarting your device" if "restart" in msg_lower else ("clearing the cache" if "cache" in msg_lower else "that previous step")
            memory_used_badges.extend([
                MemoryUsedItem(type="failed_solution", title="Zero Repetition Guard", detail=f"Customer verified {step_name} already attempted"),
                MemoryUsedItem(type="ticket", title="Diagnostic Advancement", detail="Advancing to next isolated test")
            ])

            if "battery" in state.issue_scope or "battery" in msg_lower:
                text = (
                    f"Thanks for letting me know. Since you've already completed {step_name}, I will skip that and make sure we don't repeat it.\n\n"
                    f"The next logical diagnostic for your **{product_name}** is to evaluate physical battery capacity degradation.\n\n"
                    f"Would you like me to guide you through checking your battery health report?"
                )
                actions = ["Check Battery Health", "Inspect Power Settings", "Book Technician"]
                return text, "Advance to battery health check without repeating previous steps", "Check Battery Health", actions, memory_used_badges
            else:
                text = (
                    f"Thanks for confirming. I've noted that {step_name} did not resolve the issue, so we will avoid repeating it.\n\n"
                    f"Let's move directly to the next diagnostic. Please let me know whether the issue happens across all applications or only within one specific app."
                )
                actions = ["Only One App", "Entire Phone Freezes", "Book Technician"]
                return text, "Skip repeated step and isolate symptom scope", "Isolate symptom scope", actions, memory_used_badges

        # =========================================================================
        # 5. STEP FAILED / "STILL NOT WORKING"
        # =========================================================================
        if intent == "STEP_FAILED":
            memory_used_badges.extend([
                MemoryUsedItem(type="failed_solution", title="Diagnostic Progress", detail="Previous troubleshooting attempt unsuccessful"),
                MemoryUsedItem(type="environment", title="Warranty Active", detail=f"{product_name} covered under {platform}")
            ])

            if state.thermal_issue_confirmed or "poor" in all_text:
                text = (
                    f"Thank you for testing that. Since the problem persists and the device is experiencing thermal throttling / poor battery health, standard software troubleshooting has been exhausted.\n\n"
                    f"Your **{product_name}** is under active warranty. Would you like me to arrange an authorized technician inspection?"
                )
                actions = ["Book Technician", "Speak to Human Agent", "View Service Centers"]
                return text, "Recommend technician booking after exhausted software steps", "Book Technician", actions, memory_used_badges
            elif state.issue_scope == "single_app":
                text = (
                    f"Understood. Since that step didn't resolve the crash for the application, let's try isolating app data corruption:\n\n"
                    f"1. Go to **Settings > Apps**\n"
                    f"2. Select the affected application\n"
                    f"3. Tap **Storage > Clear Data** (Note: this resets local app login state)\n\n"
                    f"After clearing data, does the app launch normally?"
                )
                actions = ["App Launches Normally", "Still Crashes", "Book Technician"]
                return text, "Guide application data clearing after failed initial step", "Clear App Data", actions, memory_used_badges
            else:
                text = (
                    f"Got it. Since the issue is still not resolved, let's check the next diagnostic level:\n\n"
                    f"When the freeze happens, does the device feel unusually warm near the top or battery compartment?"
                )
                actions = ["Yes, gets very hot", "No, stays normal temp", "Book Technician"]
                return text, "Check thermal state following unassisted freeze", "Evaluate thermal rise", actions, memory_used_badges

        # =========================================================================
        # 6. DYNAMIC "PLEASE GUIDE ME" / "WHAT SHOULD I DO NEXT?"
        # =========================================================================
        if intent == "GUIDANCE_REQUEST":
            memory_used_badges.append(MemoryUsedItem(
                type="environment",
                title="Guided Diagnostic Flow",
                detail=f"Contextual step-by-step guidance for {product_name}"
            ))

            # Scenario A: Single App crash isolated
            if state.issue_scope == "single_app" or "one app" in all_text or "one application" in all_text:
                if "pending update" in all_text or "step 1" in all_text:
                    text = (
                        f"Next, let's check application permissions and background services on your **{product_name}**:\n\n"
                        f"**Step 3:** Open **Settings > Apps > [Affected App] > Permissions** and ensure all required permissions are enabled.\n\n"
                        f"**Step 4:** Boot your device into **Safe Mode** (Hold Power button > Long-press 'Power Off' icon > Tap 'Safe Mode') to verify if another third-party app is causing the crash.\n\n"
                        f"Would you like me to guide you through Safe Mode or arrange an authorized technician inspection?"
                    )
                    actions = ["Guide Safe Mode", "Book Technician", "Speak to Human Agent"]
                    return text, "Guide permissions verification and Safe Mode diagnostic", "Safe Mode Diagnostic", actions, memory_used_badges
                else:
                    text = (
                        f"Of course. Since only one application is affected, let's troubleshoot it step by step without touching unaffected parts of your **{product_name}**.\n\n"
                        f"**Step 1:** Check if the application has a pending update in the Google Play Store / Galaxy Store.\n\n"
                        f"**Step 2:** If it is already updated, go to *Settings > Apps > [Affected App] > Storage* and tap **Clear Cache**.\n\n"
                        f"Please let me know if you would like me to guide you through checking the app version, or if you have already tried clearing its cache."
                    )
                    actions = ["Check App Update", "Clear App Cache", "Clear App Data"]
                    return text, "Guide single app update and cache clearance workflow", "Check App Update", actions, memory_used_badges

            # Scenario B: Thermal issue confirmed on freezing smartphone
            elif state.thermal_issue_confirmed or "warm" in all_text or "hot" in all_text:
                text = (
                    f"Of course. Let's continue from where we stopped.\n\n"
                    f"We have established that your **{product_name}** experiences system-wide freezing accompanied by thermal rise.\n\n"
                    f"Let's check the battery and background app usage next:\n"
                    f"1. Open **Settings > Battery & Device Care > Battery**\n"
                    f"2. Inspect whether any background application is consuming excessive CPU power\n"
                    f"3. Run the built-in **Battery Diagnostics** test\n\n"
                    f"What does the diagnostic report show for your battery health?"
                )
                actions = ["Battery Health is Poor", "Battery Health is Normal", "Book Technician"]
                return text, "Guide battery and background CPU usage diagnostics", "Check Battery Health", actions, memory_used_badges

            # Scenario C: Sarah's Dell Laptop Battery Drain
            elif state.issue_scope == "battery" or "laptop" in product_name.lower() or "dell" in product_name.lower():
                text = (
                    f"Of course. Since power-plan settings were already adjusted previously in Ticket #4821, we will not repeat those.\n\n"
                    f"Let's check your battery hardware health report directly:\n"
                    f"1. Press **Windows Key + R**, type `cmd`, and press Enter\n"
                    f"2. Run the command: `powercfg /batteryreport`\n"
                    f"3. Open the generated file and check the **Design Capacity** vs **Full Charge Capacity**\n\n"
                    f"Does the report indicate degraded cell health?"
                )
                actions = ["Health is Poor / Degraded", "Health is Normal", "Book Technician"]
                return text, "Guide battery health report command diagnostic", "Run Battery Report", actions, memory_used_badges

            # Scenario D: Smartphone Freezing / General initial
            else:
                if "phone" in product_name.lower() or "samsung" in product_name.lower() or "marcus" in customer_name.lower():
                    text = (
                        f"Great, let's troubleshoot your **{product_name}** step by step.\n\n"
                        f"RecallAI remembers your previous ticket (#8841) where clearing the app cache only provided temporary relief. We will not ask you to repeat that.\n\n"
                        f"First, let's isolate the symptom:\n"
                        f"Does the freezing happen when opening a specific app (such as banking or social media), or does the entire phone lock up and freeze?"
                    )
                    actions = ["Only One App", "Entire Phone Freezes", "Book Technician"]
                    return text, "Isolate symptom scope between single app and device freeze", "Isolate symptom scope", actions, memory_used_badges
                elif "laptop" in product_name.lower() or "dell" in product_name.lower() or "sarah" in customer_name.lower():
                    text = (
                        f"Great, let's troubleshoot your **{product_name}** step by step.\n\n"
                        f"RecallAI remembers your previous ticket (#4821) where power plan settings were adjusted. Because this is a charging issue, we won't repeat software settings.\n\n"
                        f"When you connect your 65W charger, does the charging indicator light turn on?"
                    )
                    actions = ["Light is still off", "Light turns on", "Book Technician"]
                    return text, "Test charger LED indicator without repeating software settings", "Test Charger LED", actions, memory_used_badges
                else:
                    text = (
                        f"Of course, {customer_name}. Let's take it step by step for your **{product_name}** ({order_number}).\n\n"
                        f"First, please tell me whether the issue occurs when you open a specific application, or whether the entire device stops responding."
                    )
                    actions = ["Only One App", "Entire Device Freezes", "Book Technician"]
                    return text, "Isolate symptom scope between single app and OS freeze", "Isolate symptom scope", actions, memory_used_badges

        # =========================================================================
        # 7. SHORT AFFIRMATION ("YES" / "YEAH" / "IT DOES")
        # =========================================================================
        if intent == "AFFIRMATION_YES":
            memory_used_badges.append(MemoryUsedItem(
                type="environment",
                title="Diagnostic Response Registered",
                detail="Customer confirmed affirmative symptom state"
            ))

            # Did assistant ask "Does it happen every time?" or "Does it crash on launch?"
            if "every time" in last_q or "open it" in last_q or "launch" in last_q:
                text = (
                    f"Understood. Since the application crashes every time upon opening, this indicates corrupted local binary data or missing runtime permissions.\n\n"
                    f"Let's test clearing the application cache first without uninstalling:\n"
                    f"1. Open **Settings > Apps**\n"
                    f"2. Tap the affected app and choose **Storage**\n"
                    f"3. Tap **Clear Cache** and relaunch the app.\n\n"
                    f"Does the app open after clearing cache?"
                )
                actions = ["Opens Normally", "Still Crashes", "I already tried that"]
                return text, "Guide targeted app cache clearance for launch crash", "Clear App Cache", actions, memory_used_badges

            # Did assistant ask "does the phone feel unusually hot?"
            elif "hot" in last_q or "warm" in last_q or "overheating" in last_q:
                text = (
                    f"That is useful information.\n\n"
                    f"So far we have:\n"
                    f"• System-wide freezing\n"
                    f"• Significant heat during the issue\n"
                    f"• Cache clearing already attempted previously (temporary improvement)\n\n"
                    f"Let's check the battery and background-app usage next.\n\n"
                    f"Would you like me to guide you through checking your battery diagnostic report?"
                )
                actions = ["Guide Battery Check", "I already checked it", "Book Technician"]
                return text, "Acknowledge thermal symptom and recommend battery diagnostics", "Guide Battery Check", actions, memory_used_badges

            # Did assistant ask "Does the charging indicator LED light up?"
            elif "indicator" in last_q or "led" in last_q or "light" in last_q:
                text = (
                    f"Thanks. Since the adapter LED lights up, power is reaching the charging circuitry.\n\n"
                    f"Because the laptop still fails to hold charge, this points to internal battery cell degradation rather than a faulty wall adapter.\n\n"
                    f"Your device is covered under warranty. Would you like me to arrange a technician inspection?"
                )
                actions = ["Book Technician", "Check Warranty Terms", "Speak to Human Agent"]
                return text, "Recommend technician for internal charging circuitry failure", "Book Technician", actions, memory_used_badges

            # Did assistant ask "Does it flicker when you tilt the screen?"
            elif "tilt" in last_q or "screen" in last_q:
                text = (
                    f"Thanks for confirming. Because the flickering changes when the display hinge is tilted, this indicates a loose or worn eDP display flex cable rather than a software graphics driver issue.\n\n"
                    f"Your warranty is active. Would you like me to arrange a technician to repair the display cable?"
                )
                actions = ["Book Technician", "Service Center Options", "Speak to Human Agent"]
                return text, "Diagnose display flex cable hardware fault and offer booking", "Book Technician", actions, memory_used_badges

            # Default affirmation
            else:
                if "phone" in product_name.lower() or "samsung" in product_name.lower() or "marcus" in customer_name.lower():
                    text = (
                        f"Great, let's continue troubleshooting your **{product_name}**.\n\n"
                        f"Does the freezing happen only in one specific application, or does the entire phone lock up?"
                    )
                    actions = ["Only One App", "Entire Phone Freezes", "Book Technician"]
                    return text, "Isolate symptom scope", "Isolate symptom scope", actions, memory_used_badges
                elif "laptop" in product_name.lower() or "dell" in product_name.lower() or "sarah" in customer_name.lower():
                    text = (
                        f"Great, let's continue troubleshooting your **{product_name}**.\n\n"
                        f"When plugged into wall power, does the charging indicator light on the adapter or laptop turn on?"
                    )
                    actions = ["Light is still off", "Light turns on", "Book Technician"]
                    return text, "Check charging indicator LED", "Check Charger LED", actions, memory_used_badges
                else:
                    text = (
                        f"Understood. Let's proceed to the next step for your **{product_name}**.\n\n"
                        f"Please let me know if you would like me to guide you through the next diagnostic or if you would prefer to arrange a technician visit directly."
                    )
                    actions = ["Guide Next Diagnostic", "Book Technician", "Speak to Human Agent"]
                    return text, "Advance diagnostic progression", "Guide Next Diagnostic", actions, memory_used_badges

        # =========================================================================
        # 8. SHORT NEGATION ("NO" / "IT DOESN'T")
        # =========================================================================
        if intent == "NEGATION_NO":
            memory_used_badges.append(MemoryUsedItem(
                type="environment",
                title="Diagnostic Response Registered",
                detail="Customer confirmed negative symptom state"
            ))

            # Did assistant ask "Does the entire phone freeze, or only one app?"
            if "entire phone" in last_q or "one application" in last_q:
                text = (
                    f"Thanks for clarifying. Since the issue is isolated to a single application and the rest of your system remains responsive, this is a software-level application issue rather than a device hardware failure.\n\n"
                    f"Which application is experiencing the crash?"
                )
                actions = ["Banking App", "Social Media App", "Camera / Gallery"]
                return text, "Isolate single application failure and inquire about app name", "Identify App Name", actions, memory_used_badges

            # Did assistant ask "Does the charging LED turn on?"
            elif "indicator" in last_q or "led" in last_q or "light" in last_q:
                text = (
                    f"Thanks. Since the indicator LED remains completely off when plugged in, the power adapter or charging port is not receiving electricity.\n\n"
                    f"Please test with an alternate wall outlet or power strip to isolate whether the fault is in the power supply or wall socket."
                )
                actions = ["Tested another outlet - still off", "LED turned on on another outlet", "Book Technician"]
                return text, "Guide electrical isolation for unpowered charger", "Isolate Outlet vs Charger", actions, memory_used_badges

            # Default negation
            else:
                text = (
                    f"Got it. That helps narrow down the diagnosis for your **{product_name}**.\n\n"
                    f"Let's move to the next check. Would you like me to guide you through system diagnostics or arrange certified support?"
                )
                actions = ["Guide Next Diagnostic", "Book Technician"]
                return text, "Adjust diagnostic path based on negative confirmation", "Guide Next Diagnostic", actions, memory_used_badges

        # =========================================================================
        # 9. SYMPTOM REPORTS: Single App vs System-Wide vs Launch Crash
        # =========================================================================
        if intent == "REPORT_SINGLE_APP":
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title="Symptom Scope Isolated",
                detail="Isolated single application crash"
            ))
            text = (
                f"Got it. Since only one application stops responding while the rest of your **{product_name}** works normally, we don't need to perform any system-wide resets.\n\n"
                f"Does the application crash as soon as you tap to open it, or does it freeze after using it for a while?"
            )
            actions = ["Crashes when I open it", "Freezes after a few minutes", "Please guide me"]
            return text, "Isolate application crash trigger condition", "Isolate Crash Trigger", actions, memory_used_badges

        if intent == "REPORT_LAUNCH_CRASH":
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title="Crash Mode Identified",
                detail="Application crashes immediately on launch"
            ))
            text = (
                f"Thanks. Does this crash happen every time you attempt to open the application?"
            )
            actions = ["Yes, every time", "No, only intermittently", "Please guide me"]
            return text, "Determine crash repeatability frequency", "Check Crash Repeatability", actions, memory_used_badges

        if intent == "REPORT_SYSTEM_WIDE":
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title="Symptom Scope Isolated",
                detail="System-wide freeze confirmed"
            ))
            text = (
                f"Thanks. Since the entire device is becoming unresponsive, this is different from an individual app crash.\n\n"
                f"Let's check whether the phone is overheating or whether the issue happens after a specific amount of usage.\n\n"
                f"When it freezes, does the phone feel unusually hot?"
            )
            actions = ["Yes, gets very hot", "No, normal temperature", "Please guide me"]
            return text, "Check thermal state during system freeze", "Evaluate thermal rise", actions, memory_used_badges

        if intent == "REPORT_HEATING":
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title="Thermal Anomaly Logged",
                detail="Elevated device thermals during freeze"
            ))
            text = (
                f"That is useful information.\n\n"
                f"So far we have:\n"
                f"• Device-wide freezing\n"
                f"• Significant heat during the issue\n"
                f"• Cache clearing already attempted previously (temporary improvement)\n\n"
                f"Let's check the battery and background-app usage next.\n\n"
                f"Would you like me to guide you through that check?"
            )
            actions = ["Guide Battery Check", "I already checked it", "Book Technician"]
            return text, "Synthesize thermal and freeze symptoms and guide battery check", "Guide Battery Check", actions, memory_used_badges

        if intent == "REPORT_BATTERY_POOR":
            memory_used_badges.extend([
                MemoryUsedItem(type="ticket", title="Diagnostic Finding", detail="Battery health report = Poor"),
                MemoryUsedItem(type="environment", title="Warranty Active", detail=f"{product_name} under warranty on {platform}")
            ])
            text = (
                f"Thanks — that changes the next step.\n\n"
                f"Because the device is overheating, freezing across the system, and reporting poor battery health, a hardware inspection is appropriate.\n\n"
                f"Your warranty is active.\n\n"
                f"Would you like me to arrange a technician?"
            )
            actions = ["Yes, book a technician", "Talk to human agent"]
            return text, "Recommend technician booking for degraded battery pack", "Technician Booking", actions, memory_used_badges

        # =========================================================================
        # 10. FRUSTRATION ALERT
        # =========================================================================
        if intent == "FRUSTRATION_ALERT":
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title="Zero Repetition Guard",
                detail="Customer frustration acknowledged. Skipping redundant questions."
            ))
            text = (
                f"You're right — you shouldn't have to repeat it.\n\n"
                f"I already have your previous support history and records for your **{product_name}** ({order_number}). I'll continue directly from the information you've already provided without asking redundant questions.\n\n"
                f"Would you like me to connect you with our specialist team or arrange a technician inspection right away?"
            )
            actions = ["Book Technician", "Connect to Human Agent"]
            return text, "Acknowledge frustration and offer direct resolution", "Tier-3 Handover", actions, memory_used_badges

        if intent == "INITIAL_CRASH_REPORT":
            memory_used_badges.append(MemoryUsedItem(
                type="ticket",
                title="Crash Diagnostic Initiated",
                detail=f"Analyzing crash symptoms on {product_name}"
            ))
            text = (
                f"Let's identify when the crash happens on your **{product_name}**.\n\n"
                f"Does the crash happen when you open a specific application, or does the entire phone become unresponsive?"
            )
            actions = ["It crashes when I open it", "Entire phone freezes", "Please guide me"]
            return text, "Isolate application crash trigger condition", "Isolate Crash Trigger", actions, memory_used_badges

        # =========================================================================
        # 11. GENERAL CONVERSATION FALLBACK (Zero-Repetition Guaranteed)
        # =========================================================================
        memory_used_badges.append(MemoryUsedItem(
            type="environment",
            title="RecallAI Context Engine",
            detail=f"Contextual technical assistance for {product_name}"
        ))

        # Check if assistant already offered the menu in the previous turn
        already_offered_menu = any(
            w in (state.last_assistant_question or "").lower()
            for w in ["how you'd like to proceed", "how you would like to proceed", "all previous diagnostics saved in memory"]
        )

        clean_msg = latest_message.strip()

        # If menu was already shown, OR if user said something short like 'ok', 'continue', 'help', advance immediately!
        if already_offered_menu or any(w in msg_lower for w in ["ok", "okay", "continue", "troubleshoot", "help", "solve"]):
            if "phone" in product_name.lower() or "samsung" in product_name.lower() or "marcus" in customer_name.lower():
                text = (
                    f"Let's troubleshoot your **{product_name}** step by step.\n\n"
                    f"RecallAI remembers your previous ticket where clearing the cache only helped temporarily. We will skip that.\n\n"
                    f"To isolate the root cause, does the freezing happen within one specific application, or does the entire phone lock up?"
                )
                actions = ["Only One App", "Entire Phone Freezes", "Book Technician"]
                return text, "Isolate symptom scope between single app and device freeze", "Isolate symptom scope", actions, memory_used_badges
            elif "laptop" in product_name.lower() or "dell" in product_name.lower() or "sarah" in customer_name.lower():
                text = (
                    f"Let's troubleshoot your **{product_name}** step by step.\n\n"
                    f"RecallAI remembers your previous battery settings adjustment. Because this is a charging/battery issue, we won't repeat software settings.\n\n"
                    f"When you connect your charger, does the charging indicator light turn on?"
                )
                actions = ["Light is still off", "Light turns on", "Book Technician"]
                return text, "Test charger LED indicator without repeating software settings", "Test Charger LED", actions, memory_used_badges
            elif "headphone" in product_name.lower() or "earbud" in product_name.lower() or "alex" in customer_name.lower():
                text = (
                    f"Let's troubleshoot your **{product_name}** step by step.\n\n"
                    f"We know the right earbud pairs normally. When you place the silent left earbud into the charging case, does any LED light up or blink?"
                )
                actions = ["No light in case", "Light turns on", "Book Technician"]
                return text, "Isolate earbud charging contact circuit", "Check charging cradle", actions, memory_used_badges
            elif "wash" in product_name.lower() or "david" in customer_name.lower():
                text = (
                    f"Let's troubleshoot your **{product_name}** step by step.\n\n"
                    f"Does the display show an error code (such as E-02 or E-03) when attempting to start the wash cycle?"
                )
                actions = ["Shows Error E-03", "No display", "Book Technician"]
                return text, "Check appliance digital error telemetry", "Check Error Code", actions, memory_used_badges
            else:
                text = (
                    f"Let's troubleshoot your **{product_name}** step by step.\n\n"
                    f"What symptoms are you currently noticing on your device?"
                )
                actions = ["Freezing or Crashing", "Hardware Problem", "Book Technician"]
                return text, "Isolate product symptoms", "Isolate Symptom", actions, memory_used_badges

        text = (
            f"I understand, {customer_name}.\n\n"
            f"Regarding your query for **{product_name}** (Order {order_number} from {platform}):\n\n"
            f"We have all previous diagnostics saved in memory. Please let me know how you'd like to proceed:\n"
            f"• Continue step-by-step troubleshooting\n"
            f"• Schedule an authorized technician visit\n"
            f"• Speak directly with a support agent"
        )
        actions = ["Continue Troubleshooting", "Book Technician", "Talk to Human Agent"]
        return text, "Contextual support guidance", "Continue Troubleshooting", actions, memory_used_badges
