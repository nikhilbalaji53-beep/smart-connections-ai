// Real-Time WebSocket Service for RecallAI 3-Way Support

export interface WSMessage {
  type: string;
  sender?: 'customer' | 'assistant' | 'technician' | 'technician_internal' | 'system' | 'agent';
  sender_name?: string;
  content?: string;
  is_internal?: boolean;
  badge?: string;
  timestamp?: string;
  delivery_status?: 'Sending...' | 'Sent' | 'Delivered' | 'Read' | string;
  memory_used?: any[];
  sentiment?: string;
  sentiment_label?: string;
  failed_solutions_avoided?: string[];
  recommended_action?: string;
  why_reasons?: string[];
  new_memory_detected?: string;
  status?: string;
  message?: string;
  event?: string;
  priority?: string;
  customer_id?: string;
  customer_name?: string;
  organization?: string;
  issue?: string;
  reason?: string;
  hindsight?: string;
  analysis?: {
    issue?: string;
    previous_action?: string;
    previous_result?: string;
    current_status?: string;
    customer_intent?: string;
    priority?: string;
  };
  suggested_reply?: string;
  previous_troubleshooting?: Array<{ step: string; result: string; status?: string }>;
  telemetry?: string;
  finding?: string;
  recommended_fix?: string;
  customer_message?: string;
  resolution_detail?: string;
  new_memory?: any;
  text?: string;
  timeline?: Array<{ time: string; text: string }>;
  product?: string;
  order?: string;
  options?: string[];
  voice_prompt?: string;
}

export type WSCallback = (msg: WSMessage) => void;

class LiveSupportWSClient {
  private socket: WebSocket | null = null;
  private listeners: Set<WSCallback> = new Set();
  private customerId: string = 'cust_marcus';
  private role: string = 'customer';
  private reconnectTimer: any = null;
  public isConnected: boolean = false;

  public getCustomerId(): string {
    return this.customerId;
  }

  public getRole(): string {
    return this.role;
  }

  public connect(customerId: string, role: string = 'customer') {
    this.customerId = customerId;
    this.role = role;

    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        // ignore
      }
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/ws/live/${customerId}?role=${role}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.notifyListeners({
          type: 'connection_status',
          status: 'connected',
          timestamp: new Date().toLocaleTimeString()
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WSMessage = jsonParseSafe(event.data);
          this.notifyListeners(data);
        } catch (err) {
          console.error('[RecallAI WS] Failed to parse message:', err);
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.notifyListeners({
          type: 'connection_status',
          status: 'disconnected',
          timestamp: new Date().toLocaleTimeString()
        });
      };

      this.socket.onerror = (err) => {
        console.warn('[RecallAI WS] Connection error:', err);
      };
    } catch (err) {
      console.warn('[RecallAI WS] Failed to initialize WebSocket:', err);
    }
  }

  public subscribe(callback: WSCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(msg: WSMessage) {
    this.listeners.forEach((cb) => {
      try {
        cb(msg);
      } catch (err) {
        console.error('[RecallAI WS Callback Error]', err);
      }
    });
  }

  public sendCustomerMessage(message: string, conversationId?: string, productInfo?: any) {
    this.send({
      type: 'customer_message',
      message,
      conversation_id: conversationId,
      product_info: productInfo
    });
  }

  public sendMessage(message: string, conversationId?: string, productInfo?: any) {
    this.sendCustomerMessage(message, conversationId, productInfo);
  }

  public sendAgentMessage(message: string) {
    this.send({
      type: 'agent_message',
      message
    });
  }

  public requestTechnician(issue?: string, reason?: string) {
    this.send({
      type: 'request_technician',
      issue: issue || 'Recurring technical issue requiring specialist investigation',
      reason: reason || 'Customer requested technician escalation'
    });
  }

  public sendTechnicianMessage(message: string, isInternalNote: boolean = false) {
    this.send({
      type: 'technician_message',
      message,
      is_internal_note: isInternalNote
    });
  }

  public joinAsTechnician() {
    this.send({
      type: 'technician_join'
    });
  }

  public runDiagnostic() {
    this.send({
      type: 'technician_action',
      action: 'run_diagnostic'
    });
  }

  public askAI(query: string) {
    this.send({
      type: 'technician_action',
      action: 'ask_ai',
      query
    });
  }

  public resolveCase(resolutionDetail: string) {
    this.send({
      type: 'technician_action',
      action: 'resolve_case',
      resolution: resolutionDetail
    });
  }

  public saveMemory(memoryText: string) {
    this.send({
      type: 'save_memory',
      memory_text: memoryText
    });
  }

  public bookTechnician(technicianName: string, timeSlot: string, issue: string) {
    this.send({
      type: 'book_technician',
      technician_name: technicianName,
      time_slot: timeSlot,
      issue: issue
    });
  }

  public send(payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    } else {
      // In case WebSocket is not connected or reconnecting, dispatch locally to listeners
      console.warn('[RecallAI WS] Socket not open, dispatching local fallback simulation');
      this.simulateLocalResponse(payload);
    }
  }

  private simulateLocalResponse(payload: any) {
    const curTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (payload.type === 'customer_message') {
      const msg = (payload.message || '').trim();
      const msgLower = msg.toLowerCase();

      this.notifyListeners({
        type: 'chat_message',
        sender: 'customer',
        content: msg,
        timestamp: curTime
      });

      // Show progressive pipeline
      this.notifyListeners({
        type: 'typing_status',
        status: 'processing',
        message: '🔍 Checking product information...'
      });

      // If socket is not open, call HTTP support chat API asynchronously
      try {
        const prod = payload.product_info || {};
        fetch('/api/support/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: this.customerId || 'cust_marcus',
            message: msg,
            order_id: prod.orderNumber || '#AMZ-78241',
            product_name: prod.name || 'Dell Laptop',
            platform: prod.platform || 'Amazon',
            warranty_status: prod.warrantyStatus || 'Active'
          })
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              this.notifyListeners({
                type: 'chat_message',
                sender: 'assistant',
                content: data.reply,
                options: data.suggested_actions || [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                delivery_status: 'Delivered',
                voice_prompt: data.voice_prompt
              });
            } else {
              this.fallbackOfflineDiagnosis(msg, msgLower);
            }
          })
          .catch(() => {
            this.fallbackOfflineDiagnosis(msg, msgLower);
          });
      } catch (_) {
        this.fallbackOfflineDiagnosis(msg, msgLower);
      }
    }
  }

  private fallbackOfflineDiagnosis(msg: string, msgLower: string) {
    let reply = "";
    let options: string[] = [];

    if (msgLower.includes("flashing continuously") || msgLower.includes("continuous amber")) {
      reply = "On your **Dell Laptop**, an LED continuously flashing amber indicates a power supply negotiation failure (unrecognized AC adapter), inadequate voltage, or a battery cell fault preventing charge intake.\n\n### 🛠️ Immediate Action Steps:\n1. **Flea Power Drain & Hard Reset:** Disconnect the AC adapter. Press and hold down the laptop's **Power button for 20–30 seconds** with the charger unplugged to completely discharge residual flea power.\n2. **Direct Wall Outlet Test:** Inspect the charger tip for damage, plug directly into an independent wall outlet, and reconnect firmly.\n\nSince your purchase carries **Active Warranty Protection** (Order #AMZ-78241 on Amazon), if the amber blinking persists, we can arrange an authorized technician visit or file an expedited warranty claim.";
      options = ["Reset Completed - Still Blinking Amber", "Reset Succeeded - Light Steady White", "Book Technician", "Claim Warranty"];
    } else if (msgLower.includes("still blinking") || msgLower.includes("still amber") || msgLower.includes("reset failed")) {
      reply = "Thank you for completing the flea power drain. Because the amber light continues to flash after discharging residual current, this confirms internal battery cell degradation or a failure on the motherboard charging circuit (PMIC).\n\nUnder your **Active Warranty** (Order #AMZ-78241 via Amazon), you are eligible for zero-cost authorized component replacement.\n\nWould you like to book an authorized technician visit or file a direct warranty replacement claim?";
      options = ["Book Technician", "Claim Warranty", "Speak with Specialist"];
    } else if (msgLower.includes("steady white") || msgLower.includes("white light now") || msgLower.includes("reset succeeded")) {
      reply = "Great progress! The steady white light indicates that the power management IC has successfully negotiated charge delivery with your AC adapter.\n\nAllow the laptop to charge for at least 30 minutes before powering it on to ensure safe operating voltage.";
      options = ["Run Battery Health Report", "Save Troubleshooting Record", "All Set"];
    } else if (msgLower.includes("hardware diagnostic") || msgLower.includes("diagnostic suite") || msgLower.includes("epsa")) {
      reply = "Let's immediately begin **Step 1 of the Hardware Diagnostic Routine** for your **Dell Laptop**:\n\n1. Ensure the AC power adapter is connected firmly.\n2. Power off the laptop completely.\n3. Press and hold down the **Fn key**, then press the **Power button** once and release both.\n\nThis will trigger the built-in Dell **ePSA (Enhanced Pre-boot System Assessment)** hardware diagnostic.\n\nDo you see any flashing amber lights or hear specific beep sequences?";
      options = ["Flashing Continuously", "2 Amber, 3 White", "Diagnostic Beeps Heard", "No Lights or Beeps"];
    } else if (msgLower.includes("poor") || (msgLower.includes("health") && msgLower.includes("poor"))) {
      reply = "Thanks — that changes the diagnosis.\n\nSince the battery-health report shows 'Poor' and previous software troubleshooting did not resolve the issue, this indicates physical cell degradation requiring hardware service.\n\nYour device is still under warranty.\n\nWould you like me to arrange a technician inspection?";
      options = ["Yes, book a technician.", "I want to talk to a human."];
    } else if (msgLower.includes("80") && msgLower.includes("20")) {
      reply = "That's a significant battery drop.\n\nYour laptop is still under warranty. I also found that a previous battery-settings adjustment was attempted.\n\nLet's avoid repeating that step. The next useful check is whether the battery health has degraded.\n\nWould you like me to guide you through that check?";
      options = ["I already checked the battery health. It says poor.", "Book Technician"];
    } else if (msgLower.includes("battery") && (msgLower.includes("drain") || msgLower.includes("draining") || msgLower.includes("fast"))) {
      reply = "I understand. You're experiencing unusually fast battery drain on your Dell laptop.\n\nI found a previous battery-related support case for this device. Before I recommend anything you've already tried, I'll check that history.\n\nWhat happens now when the laptop is unplugged?";
      options = ["It goes from 80% to 20% in about an hour.", "I already tried the settings you suggested.", "Book Technician"];
    } else if (msgLower.includes("not charging") || msgLower.includes("charging")) {
      reply = "Got it. You're having a charging issue with your Dell Laptop purchased from Amazon (Order #AMZ-78241).\n\nYour previous battery drain was resolved via power settings. Because this is a charging failure, I won't ask you to repeat those settings.\n\nYour laptop is still under warranty. Please disconnect the charger and reconnect it firmly. Does the small charging indicator LED light up?";
      options = ["The light is still not turning on.", "Flashing Amber / White Light", "Book Technician"];
    } else if (msgLower.includes("screen") || msgLower.includes("flicker")) {
      reply = "I understand your Dell Laptop screen is flickering (Order #AMZ-78241). Your warranty is active.\n\nDoes the flickering change when you tilt the screen back and forth, or does it happen continuously in all apps?";
      options = ["It flickers when I tilt the screen.", "Book Technician"];
    } else if (msgLower.includes("overheat") || msgLower.includes("hot")) {
      reply = "I see your laptop is overheating. Your device is covered under warranty.\n\nAre the cooling fans spinning loudly, and is the bottom chassis hot during normal web browsing?";
      options = ["Fans are very loud.", "Book Technician"];
    } else if (msgLower.includes("already tried") || msgLower.includes("tried that")) {
      reply = "Thanks for confirming. Since you've already completed those troubleshooting steps, I won't ask you to repeat them.\n\nYour Dell Laptop is covered under active warranty on Amazon. Would you like me to arrange an authorized technician inspection?";
      options = ["Yes, book a technician.", "Talk to a human agent."];
    } else if (msgLower.includes("can you solve") || msgLower.includes("solve my issue") || msgLower.includes("solve this")) {
      reply = "Yes, absolutely. I'm here to resolve your issue.\n\n• **Product:** Dell Laptop (Order #AMZ-78241)\n• **Warranty:** Active\n• **Context:** We have saved all previous support steps so you never start from zero.\n\nI can guide you through targeted hardware checks or book a certified technician right away. How would you like to proceed?";
      options = ["Book Technician", "Continue With Support"];
    } else if (msgLower.includes("technician") || msgLower.includes("book")) {
      reply = "I've reviewed your previous support history and the available information for your Dell Laptop (Order #AMZ-78241).\n\nYou don't need to explain everything again. Would you like to confirm Technician A for an on-site visit?";
      options = ["Yes, book Technician A (10:00 AM)"];
    } else if (msgLower.includes("human") || msgLower.includes("agent")) {
      reply = "I'll connect you directly with a human specialist. All your previous product and troubleshooting records will be transferred so you won't need to repeat yourself.";
      options = [];
    } else if (msgLower.includes("thank")) {
      reply = "You're very welcome! Your product details and support history are saved in RecallAI so you never have to repeat your story. Have a great day!";
      options = [];
    } else {
      reply = `I understand your message: "${msg}". I've pulled up your Dell Laptop records (Order #AMZ-78241, Active Warranty). We will avoid repeating previous steps and help you get this resolved. What symptoms are you currently seeing?`;
      options = ["Hardware Diagnostic Suite", "Battery Diagnostics", "Book Technician"];
    }

    this.notifyListeners({
      type: 'chat_message',
      sender: 'assistant',
      content: reply,
      options: options,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      delivery_status: 'Delivered',
      memory_used: [
        { type: 'ticket', title: 'Product Record', detail: 'Dell Laptop • Amazon Order #AMZ-78241' },
        { type: 'environment', title: 'Warranty Status', detail: 'Active (Covered under warranty)' },
        { type: 'failed_solution', title: 'Zero Repetition Guard', detail: 'Avoid repeating previous settings troubleshooting' }
      ]
    });
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {
        // ignore
      }
      this.socket = null;
    }
    this.isConnected = false;
  }
}

function jsonParseSafe(str: string): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}

export const liveWS = new LiveSupportWSClient();
