from typing import Dict, Any, List, Optional, Tuple
from ...schemas.schemas import MemoryUsedItem
from .security_agent import SecurityRecoveryAgent
from .hardware_agent import HardwareDiagnosticsAgent
from .connectivity_agent import ConnectivitySoftwareAgent
from .general_agent import GeneralSupportAgent

class AIAgentRouter:
    """
    Multi-Agent Coordination and Dispatch Engine for RecallAI.
    Inspects user intent, customer profile, device record, and historical context
    to dispatch to the most qualified specialized AI Agent.
    """

    @classmethod
    def dispatch_agent(
        cls,
        user_message: str,
        customer_name: str,
        product_name: str,
        order_number: str,
        platform: str,
        warranty_status: str,
        memory_used_badges: List[MemoryUsedItem]
    ) -> Tuple[str, str, str, List[str], List[MemoryUsedItem], str]:
        """
        Dispatches to the appropriate specialized AI agent and returns:
        (reply_text, recommended_action, contingency_step, suggested_actions, memory_badges, agent_name)
        """
        msg_l = user_message.lower().strip()

        # 1. Security & Device Recovery Agent
        if SecurityRecoveryAgent.can_handle(msg_l):
            reply, rec_action, cont_step, actions, badges = SecurityRecoveryAgent.resolve(
                user_message=user_message,
                customer_name=customer_name,
                product_name=product_name,
                order_number=order_number,
                platform=platform,
                warranty_status=warranty_status,
                memory_used_badges=memory_used_badges
            )
            return reply, rec_action, cont_step, actions, badges, SecurityRecoveryAgent.AGENT_NAME

        # 2. Hardware Diagnostics & Repair Agent
        if HardwareDiagnosticsAgent.can_handle(msg_l):
            reply, rec_action, cont_step, actions, badges = HardwareDiagnosticsAgent.resolve(
                user_message=user_message,
                customer_name=customer_name,
                product_name=product_name,
                order_number=order_number,
                platform=platform,
                warranty_status=warranty_status,
                memory_used_badges=memory_used_badges
            )
            return reply, rec_action, cont_step, actions, badges, HardwareDiagnosticsAgent.AGENT_NAME

        # 3. Connectivity, SIM & Software Agent
        if ConnectivitySoftwareAgent.can_handle(msg_l):
            reply, rec_action, cont_step, actions, badges = ConnectivitySoftwareAgent.resolve(
                user_message=user_message,
                customer_name=customer_name,
                product_name=product_name,
                order_number=order_number,
                platform=platform,
                warranty_status=warranty_status,
                memory_used_badges=memory_used_badges
            )
            return reply, rec_action, cont_step, actions, badges, ConnectivitySoftwareAgent.AGENT_NAME

        # 4. General Support & Assistant Agent (Universal Fallback)
        reply, rec_action, cont_step, actions, badges = GeneralSupportAgent.resolve(
            user_message=user_message,
            customer_name=customer_name,
            product_name=product_name,
            order_number=order_number,
            platform=platform,
            warranty_status=warranty_status,
            memory_used_badges=memory_used_badges
        )
        return reply, rec_action, cont_step, actions, badges, GeneralSupportAgent.AGENT_NAME
