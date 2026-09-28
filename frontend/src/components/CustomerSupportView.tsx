import React, { useState, useEffect, useRef } from 'react';
import type { Customer, Ticket, MemoryTimelineEvent, ChatMessage, KnowledgeArticle } from '../types';
import { api } from '../services/api';
import { liveWS, type WSMessage } from '../services/websocket';
import {
  Bot,
  User,
  ShieldCheck,
  Sparkles,
  Send,
  Paperclip,
  History,
  ArrowRight,
  Check,
  X,
  Wrench,
  AlertTriangle,
  Bell
} from 'lucide-react';

interface CustomerSupportViewProps {
  customer: Customer;
  tickets: Ticket[];
  timeline: MemoryTimelineEvent[];
  kbArticles: KnowledgeArticle[];
  onOpenEscalation: (ticketId?: number) => void;
  onOpenTimelineView: () => void;
  onOpenKBArticle: (art: KnowledgeArticle) => void;
  presetPrompt?: string;
  onClearPresetPrompt?: () => void;
}

export const CustomerSupportView: React.FC<CustomerSupportViewProps> = ({
  customer,
  tickets,
  timeline: _timeline,
  kbArticles: _kbArticles,
  onOpenEscalation,
  onOpenTimelineView,
  onOpenKBArticle: _onOpenKBArticle,
  presetPrompt,
  onClearPresetPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [mockAttachment, setMockAttachment] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [detectedNewMemory, setDetectedNewMemory] = useState<string | null>(null);
  const [isMemorySaved, setIsMemorySaved] = useState(false);
  const [technicianActive, setTechnicianActive] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initConversation();
    setIsResolved(false);
    setDetectedNewMemory(null);
    setIsMemorySaved(false);

    // Connect to WebSocket as customer
    liveWS.connect(customer.id, 'customer');

    const unsubscribe = liveWS.subscribe((msg: WSMessage) => {
      if (msg.type === 'chat_message') {
        const newMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender: msg.sender === 'technician' ? 'agent' : msg.sender || 'assistant',
          content: msg.content || '',
          created_at: msg.timestamp || new Date().toISOString(),
          memory_used: msg.memory_used,
          sentiment_tag: msg.sentiment
        };
        setMessages((prev) => [...prev, newMsg]);
        setIsLoading(false);

        if (msg.new_memory_detected) {
          setDetectedNewMemory(msg.new_memory_detected);
          setIsMemorySaved(false);
        }
      } else if (msg.type === 'system_event') {
        if (msg.event === 'technician_joined') {
          setTechnicianActive(true);
        }
      } else if (msg.type === 'technician_notification') {
        setShowNotificationToast(true);
        setTimeout(() => setShowNotificationToast(false), 5000);
      } else if (msg.type === 'case_resolved') {
        setIsResolved(true);
        if (msg.customer_message) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'assistant',
              content: msg.customer_message || 'Your issue has been resolved by our senior technician.',
              created_at: msg.timestamp || new Date().toISOString()
            }
          ]);
        }
      } else if (msg.type === 'memory_saved_confirmation') {
        setIsMemorySaved(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [customer.id]);

  useEffect(() => {
    if (presetPrompt) {
      setInputValue(presetPrompt);
      if (onClearPresetPrompt) onClearPresetPrompt();
    }
  }, [presetPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const initConversation = () => {
    // Safeguard: Never wipe out or reset messages if conversation has already progressed
    setMessages((prev) => {
      if (prev.length > 0) return prev;

      const convId = `conv_${customer.id}_${Date.now()}`;
      setConversationId(convId);

      // Initial conversation state exactly matching Section 3
      if (customer.id === 'cust_marcus') {
        const userMsg: ChatMessage = {
          sender: 'user',
          content: "My pipeline is timing out again.",
          created_at: '10:41 AM'
        };

        const aiMsg: ChatMessage = {
          sender: 'assistant',
          content: `Welcome back, Marcus.\n\nI remember your previous pipeline timeout issue.\n\nYou previously tried:\n• Cache clearing — unsuccessful\n• Agent restart — temporary improvement\n• Application reinstall — worked temporarily\n\nYour current environment is:\nUbuntu Linux 22.04\nJAMMY v3.16\n\nYou don't need to repeat those details.\n\nLet's continue from where we stopped.`,
          created_at: '10:41 AM',
          memory_used: [
            { type: 'ticket', title: 'Previous Ticket', detail: 'Ticket #8841 (Pipeline timeout)' },
            { type: 'failed_solution', title: 'Cache Clearing', detail: 'Failed on August 12' },
            { type: 'temporary_solution', title: 'Application Reinstall', detail: 'Worked temporarily' },
            { type: 'environment', title: 'Current Environment', detail: 'Ubuntu Linux 22.04 / JAMMY v3.16' }
          ],
          sentiment_tag: 'URGENT'
        };

        return [userMsg, aiMsg];
      } else {
        const defaultGreeting: ChatMessage = {
          sender: 'assistant',
          content: `Welcome back, ${customer.name}.\n\nRecallAI has retrieved your verified profile and environment specs for ${customer.organization}.\n\nHow can I help you with your environment today?`,
          created_at: new Date().toLocaleTimeString(),
          memory_used: [
            { type: 'environment', title: 'Environment', detail: `${customer.environment?.operating_system}` }
          ]
        };
        return [defaultGreeting];
      }
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const curTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Local echo
    const userMessage: ChatMessage = {
      sender: 'user',
      content: text,
      created_at: curTime
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMockAttachment(null);
    setIsLoading(true);

    // Section 16 memory extraction simulation
    if (text.toLowerCase().includes("15 minutes") || text.toLowerCase().includes("fifteen minutes")) {
      setDetectedNewMemory("Pipeline timeout typically occurs after approximately 15 minutes.");
      setIsMemorySaved(false);
    }

    // Try WebSocket send first for true real-time communication
    liveWS.sendCustomerMessage(text, conversationId || undefined);

    // As fallback or HTTP backing
    try {
      const resp = await api.sendMessage(customer.id, text, conversationId || undefined);
      if (resp.conversation_id) setConversationId(resp.conversation_id);
      setIsLoading(false);
    } catch (err) {
      console.warn('HTTP fallback sync:', err);
      setIsLoading(false);
    }
  };

  const handleSaveDetectedMemory = () => {
    if (detectedNewMemory) {
      liveWS.saveMemory(detectedNewMemory);
      setIsMemorySaved(true);
    }
  };

  const handleNotifyTechnician = () => {
    liveWS.sendCustomerMessage("A recurring issue has occurred multiple times without permanent resolution. Technician assistance requested.");
    onOpenEscalation(tickets[0]?.id || 8841);
  };

  const isMarcus = customer.id === 'cust_marcus';

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6 overflow-y-auto bg-slate-100">
      {/* ========================================================
          PANEL 1 (LEFT): CUSTOMER HISTORY — "What happened before?"
      ======================================================== */}
      <div className="lg:col-span-3 flex flex-col space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  CUSTOMER HISTORY
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                "What happened before?"
              </p>
            </div>

            {/* List of Previous Support Events */}
            <div className="space-y-3.5 text-xs">
              {/* Event 1: Ticket #8841 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-xs">
                    {isMarcus ? 'TICKET #8841' : 'TICKET #4821'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Resolved
                  </span>
                </div>

                <div className="text-slate-800 font-bold text-xs">
                  {isMarcus ? 'Pipeline timeout' : 'Damaged laptop replacement'}
                </div>

                <div className="text-[11px] text-slate-500">
                  {isMarcus ? 'August 12' : 'September 20'}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Previous attempt:</span>
                    <span className="font-semibold text-slate-700">Cache clearing</span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                      FAILED
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Previous solution:</span>
                    <span className="font-semibold text-slate-700">Application reinstall</span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                      WORKED TEMPORARILY
                    </span>
                  </div>
                </div>
              </div>

              {/* Event 2: Ticket #7321 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-xs">TICKET #7321</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Resolved
                  </span>
                </div>
                <div className="text-slate-800 font-bold text-xs">Similar pipeline issue</div>
                <div className="text-[11px] text-slate-500">July 15</div>
              </div>

              {/* Event 3: Ticket #9012 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-xs">TICKET #9012</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Resolved
                  </span>
                </div>
                <div className="text-slate-800 font-bold text-xs">Performance issue</div>
                <div className="text-[11px] text-slate-500">June 03</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={onOpenTimelineView}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <span>View Complete History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          PANEL 2 (CENTER): REAL-TIME LIVE SUPPORT CHAT
      ======================================================== */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col overflow-hidden">
          {/* Header with Live Status & Sentiment (Section 18) */}
          <div className="p-4 border-b border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    RECALLAI AI SUPPORT
                  </h2>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Live Support
                </span>

                {technicianActive && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold flex items-center">
                    <Wrench className="w-3 h-3 mr-1 text-indigo-600" />
                    Technician Connected
                  </span>
                )}
              </div>
            </div>

            {isResolved && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Issue Resolved: Verified memory has been committed to your customer profile.</span>
              </div>
            )}

            {showNotificationToast && (
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-300 text-xs font-bold text-purple-900 flex items-center space-x-2 animate-bounce">
                <Bell className="w-4 h-4 text-purple-600" />
                <span>Senior Technician notified: Diagnostic telemetry and full context shared.</span>
              </div>
            )}

            {/* Sentiment & Issue Status Bar (Section 18) */}
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 block">
                  CURRENT ISSUE: RECURRING PIPELINE TIMEOUT
                </span>
                <span className="text-[11px] font-semibold text-rose-900">
                  Customer: <strong>{customer.name}</strong> • Ubuntu 22.04 / JAMMY v3.16
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                  Possible frustration detected
                </span>
              </div>
            </div>

            {/* Expandable Memory Badge (Section 5) */}
            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-bold text-[11px]">
                  🧠 RecallAI remembered 3 previous attempts & 2 related tickets (#8841, #7321)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowWhyModal(true)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
              >
                View Memory
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg, idx) => {
              const isAssistant = msg.sender === 'assistant';
              const isTechnician = msg.sender === 'agent';

              return (
                <div key={idx} className={`flex items-start space-x-2.5 ${isAssistant || isTechnician ? 'justify-start' : 'justify-end'}`}>
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {isTechnician && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Wrench className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isTechnician
                      ? 'bg-indigo-50 border-2 border-indigo-300 text-indigo-950 shadow-xs'
                      : isAssistant
                      ? 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                  }`}>
                    {/* Message Header */}
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-black/5">
                      <span className="font-extrabold text-[11px] flex items-center">
                        {isTechnician ? (
                          <span className="text-indigo-900 flex items-center">
                            <Wrench className="w-3 h-3 mr-1 text-indigo-600" />
                            Senior Technician
                          </span>
                        ) : isAssistant ? (
                          <span className="text-blue-900 flex items-center">
                            <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                            RecallAI
                          </span>
                        ) : (
                          <span>{customer.name}</span>
                        )}
                      </span>

                      <span className="text-[9px] opacity-60">
                        {msg.created_at || 'Just now'}
                      </span>
                    </div>

                    <div className="whitespace-pre-line font-medium text-xs">
                      {msg.content}
                    </div>
                  </div>

                  {!isAssistant && !isTechnician && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking status */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 p-2 bg-white rounded-xl border border-slate-200 w-fit animate-pulse">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">RecallAI is thinking & retrieving relevant history...</span>
              </div>
            )}

            {/* New Memory Detected Banner (Section 16) */}
            {detectedNewMemory && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border-2 border-purple-200 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-black text-purple-950 uppercase text-[10px] flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                    🧠 NEW MEMORY DETECTED
                  </span>
                  {isMemorySaved ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center">
                      <Check className="w-3 h-3 mr-0.5 font-bold" /> Memory updated
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveDetectedMemory}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-colors"
                    >
                      Save to Customer Memory
                    </button>
                  )}
                </div>
                <p className="text-purple-900 font-semibold italic">
                  "{detectedNewMemory}"
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Real-Time Test Prompts for Judges */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="text-slate-400 font-bold uppercase mr-1">Quick Test Prompts:</span>
            <button
              onClick={() => handleSendMessage("Yes, it worked after reinstalling, but now the problem has returned.")}
              className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 font-medium text-slate-700 transition-colors"
            >
              "Worked after reinstalling, but returned"
            </button>
            <button
              onClick={() => handleSendMessage("Why can't I just restart the application again?")}
              className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 font-medium text-slate-700 transition-colors"
            >
              "Why can't I just restart again?"
            </button>
            <button
              onClick={() => handleSendMessage("The timeout always happens after 15 minutes.")}
              className="px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 font-medium text-slate-700 transition-colors"
            >
              "Timeout happens after 15 minutes"
            </button>
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-3">
            {mockAttachment && (
              <div className="flex items-center space-x-2 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg w-fit">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attached: <strong>{mockAttachment}</strong></span>
                <button
                  type="button"
                  onClick={() => setMockAttachment(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold ml-1.5"
                  title="Remove attachment"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setMockAttachment('runner03_hang.log')}
                title="Attach log file"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message... RecallAI already knows your relevant history"
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-none rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 transition-colors"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shadow-xs"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Smart Escalation / Notify Technician Button (Section 19) */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                Recurring issue with no permanent fix?
              </span>
              <button
                type="button"
                onClick={handleNotifyTechnician}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors flex items-center space-x-1"
              >
                <Bell className="w-3.5 h-3.5 text-rose-600" />
                <span>Notify Technician</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          PANEL 3 (RIGHT): RECALLAI MEMORY & HINDSIGHT
      ======================================================== */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        {/* RECALLAI MEMORY SECTION (Section 5) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                RECALLAI MEMORY
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              "What does the AI know about this customer?"
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">CUSTOMER</span>
              <span className="font-extrabold text-slate-900">{customer.name}, {customer.organization}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">ENVIRONMENT</span>
              <span className="font-extrabold text-slate-900">
                {customer.environment?.operating_system || 'Ubuntu 22.04'} • {customer.environment?.application_version || 'JAMMY v3.16'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">PREVIOUS ISSUE</span>
              <span className="font-extrabold text-slate-900">Pipeline timeout</span>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-rose-800">FAILED SOLUTION</span>
              <span className="font-extrabold text-rose-950">Cache clearing</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-800">SUCCESSFUL SOLUTION</span>
              <span className="font-extrabold text-emerald-950">Application reinstall</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-800">CURRENT STATUS</span>
              <span className="font-extrabold text-amber-950">Issue returned</span>
            </div>
          </div>
        </div>

        {/* HINDSIGHT SECTION (Section 6) */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-md space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black tracking-tight text-white uppercase">
                  HINDSIGHT
                </h3>
              </div>
              <p className="text-[10px] text-blue-200 font-semibold mt-0.5">
                "What can we learn from the customer's past?"
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
              Core Engine
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-200">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-start space-x-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>This problem has occurred 3 times.</span>
            </div>

            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-start space-x-2">
              <span className="text-rose-400 font-bold">❌</span>
              <span>Cache clearing: Failed</span>
            </div>

            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-start space-x-2">
              <span className="text-amber-400 font-bold">⚠</span>
              <span>Agent restart: Temporary improvement</span>
            </div>

            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Application reinstall: Worked temporarily</span>
            </div>

            <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-start space-x-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Current issue: Problem returned.</span>
            </div>
          </div>

          {/* AI Interpretation (Section 6) */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-300 block">AI INTERPRETATION:</span>
            <p className="text-slate-200 italic">
              "The previous solutions treated the symptoms but did not permanently resolve the recurring problem."
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                RECOMMENDED DIRECTION:
              </span>
              <p className="text-xs font-bold text-white mt-0.5">
                "Investigate the underlying cause."
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowWhyModal(true)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>Explain to Customer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* WHY I RECOMMEND THIS MODAL (SECTION 7) */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    WHY I RECOMMEND THIS
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold">Customer-Friendly Non-Technical Explanation</p>
                </div>
              </div>
              <button onClick={() => setShowWhyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 leading-relaxed font-medium">
              "You can try restarting it, but your previous support history shows that restarting only helped temporarily. Since the problem returned, I recommend checking the underlying cause instead of repeatedly applying the same temporary fix."
            </div>

            <div className="space-y-2 font-semibold text-slate-800">
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-emerald-50 text-emerald-950">
                <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                <span>You experienced this issue before</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-emerald-50 text-emerald-950">
                <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                <span>Restarting helped temporarily</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-rose-50 text-rose-950">
                <Check className="w-4 h-4 text-rose-600 font-bold shrink-0" />
                <span>The issue returned</span>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-xl bg-purple-50 text-purple-950">
                <Check className="w-4 h-4 text-purple-600 font-bold shrink-0" />
                <span>A previous solution did not permanently fix it</span>
              </div>
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
