import React, { useState, useEffect, useRef } from 'react';
import type { Customer, Ticket } from '../types';
import { liveWS, type WSMessage } from '../services/websocket';
import {
  Send,
  Sparkles,
  User,
  Wrench,
  Clock,
  HelpCircle,
  RotateCcw,
  Headphones,
  Edit3,
  Check,
  Zap,
  ShieldCheck,
  History
} from 'lucide-react';

interface SupportConsoleViewProps {
  customer: Customer;
  tickets: Ticket[];
  onOpenCustomerChat?: () => void;
  onOpenTechnicianConsole?: () => void;
}

interface ChatEntry {
  id: string;
  sender: 'customer' | 'assistant' | 'agent' | 'technician';
  senderName: string;
  content: string;
  timestamp: string;
}

export const SupportConsoleView: React.FC<SupportConsoleViewProps> = ({
  customer,
  tickets: _tickets,
  onOpenCustomerChat,
  onOpenTechnicianConsole
}) => {
  // Conversation stream
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'c1',
      sender: 'customer',
      senderName: customer.name || 'Sarah',
      content: 'My laptop is not charging.',
      timestamp: '10:02 AM'
    }
  ]);

  // Active message analysis state (Section 12, 13)
  const isSarah = customer.id === 'cust_sarah' || customer.name.includes('Sarah');
  const [latestCustomerMessage, setLatestCustomerMessage] = useState(
    isSarah
      ? 'My laptop is not charging.'
      : 'I already reinstalled it last time and it worked for a while, but now it is crashing again.'
  );

  const [analysis, setAnalysis] = useState({
    product: isSarah ? 'Dell Laptop' : 'Application',
    order: isSarah ? '#AMZ-78241' : '#CT-8841',
    issue: isSarah ? 'Laptop not charging' : 'Application crashing',
    previousAction: isSarah ? 'Battery settings adjustment (Ticket #4821)' : 'Application reinstall',
    previousResult: isSarah ? 'Resolved' : 'Temporary success',
    currentStatus: isSarah ? 'Charging failure / Light not turning on' : 'Issue returned',
    customerIntent: isSarah ? 'Reporting charging issue' : 'Requesting further assistance',
    priority: 'High'
  });

  // Suggested reply state & editable response (Section 14)
  const [suggestedReply, setSuggestedReply] = useState(
    isSarah
      ? "Hi Sarah. I found your Dell laptop order and confirmed that it is still under warranty.\n\nI also found a previous battery-related support case. Since this is a different charging issue, I'll help you with the appropriate next step."
      : "Thanks for letting me know, Marcus. I can see that you already reinstalled the application previously and that only fixed the problem temporarily.\n\nSince the issue has returned, let's avoid repeating the same step. I'll review the previous case and help identify what may be causing the recurring crash."
  );

  const [editableReply, setEditableReply] = useState(suggestedReply);
  const [isEditing, setIsEditing] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);
  const [technicianRequested, setTechnicianRequested] = useState(false);
  const [statusStage, setStatusStage] = useState<'analyzing' | 'history' | 'context' | 'ready'>('ready');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Connect to WebSocket as support agent
    liveWS.connect(customer.id, 'agent');

    const unsubscribe = liveWS.subscribe((msg: WSMessage) => {
      if (msg.type === 'chat_message') {
        const senderType = msg.sender === 'technician' ? 'technician' : msg.sender === 'agent' ? 'agent' : msg.sender === 'customer' ? 'customer' : 'assistant';
        const senderLabel = msg.sender_name || (senderType === 'technician' ? 'Technician Alex' : senderType === 'agent' ? 'Sarah (Support Agent)' : senderType === 'customer' ? customer.name : 'RecallAI Bot');

        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}_${Math.random()}`,
            sender: senderType,
            senderName: senderLabel,
            content: msg.content || '',
            timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        if (msg.sender === 'customer' && msg.content) {
          setLatestCustomerMessage(msg.content);
          handleCustomerMessageArrived(msg.content);
        }
      } else if (msg.type === 'support_agent_suggestion') {
        if (msg.customer_message) setLatestCustomerMessage(msg.customer_message);
        if (msg.analysis) {
          const a = msg.analysis as any;
          setAnalysis({
            product: a.product || (isSarah ? 'Laptop' : 'Application'),
            order: a.order || (isSarah ? '#ORD-78241' : '#CT-8841'),
            issue: a.issue || 'Application issue',
            previousAction: a.previous_action || a.previousAction || 'Troubleshooting',
            previousResult: a.previous_result || a.previousResult || 'Temporary',
            currentStatus: a.current_status || a.currentStatus || 'Returned',
            customerIntent: a.customer_intent || a.customerIntent || 'Assistance requested',
            priority: a.priority || 'Normal'
          });
        }
        if (msg.suggested_reply) {
          setSuggestedReply(msg.suggested_reply);
          setEditableReply(msg.suggested_reply);
        }
        setStatusStage('ready');
      } else if (msg.type === 'system_event' && msg.event === 'technician_requested') {
        setTechnicianRequested(true);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [customer.id]);

  const handleCustomerMessageArrived = (text: string) => {
    setStatusStage('analyzing');
    setTimeout(() => setStatusStage('history'), 300);
    setTimeout(() => setStatusStage('context'), 600);
    setTimeout(() => {
      setStatusStage('ready');
      const lower = text.toLowerCase();

      let reply = "";
      if (lower.includes("battery") && (lower.includes("drain") || lower.includes("draining"))) {
        reply = "Hi Sarah. I see your Dell laptop order (#AMZ-78241) and recall your previous battery settings adjustment. Since the drain has returned, let's check your battery health report rather than repeating past settings.";
        setAnalysis(prev => ({ ...prev, issue: 'Rapid battery drain', previousAction: 'Battery settings adjustment', previousResult: 'Resolved (Software)', customerIntent: 'Reporting battery drain' }));
      } else if (lower.includes("80") && lower.includes("20")) {
        reply = "Thanks for the details, Sarah. An 80% to 20% drop in one hour indicates significant cell degradation. Because your laptop is under warranty, let's check the battery health report.";
        setAnalysis(prev => ({ ...prev, issue: 'Rapid battery drop (80% to 20%)', previousAction: 'Settings fix verified', previousResult: 'Persistent drain', customerIntent: 'Providing discharge telemetry' }));
      } else if (lower.includes("poor") || lower.includes("health")) {
        reply = "Thanks for verifying the battery health report. Since it shows 'Poor', this confirms hardware cell failure. Your Dell laptop is under warranty—I can arrange a technician visit to replace the battery pack.";
        setAnalysis(prev => ({ ...prev, issue: 'Battery health = Poor', previousAction: 'Diagnostic report', previousResult: 'Cell failure', customerIntent: 'Hardware service required', priority: 'High' }));
      } else if (lower.includes("charging") || lower.includes("not charging")) {
        reply = "Hi Sarah. I found your Dell laptop order (#AMZ-78241) and confirmed active warranty. Since your previous battery drain was resolved via settings, this new charging failure is hardware-related. Let's verify the adapter LED.";
        setAnalysis(prev => ({ ...prev, issue: 'Charging failure', previousAction: 'Battery settings adjustment', previousResult: 'Resolved', customerIntent: 'Reporting charging failure' }));
      } else if (lower.includes("flicker") || lower.includes("screen")) {
        reply = "Hi Sarah. I see you're reporting screen flickering on your Dell Laptop. Let's check whether tilting the screen affects the display before scheduling panel service under warranty.";
        setAnalysis(prev => ({ ...prev, issue: 'Screen flickering', previousAction: 'None', previousResult: 'New issue', customerIntent: 'Reporting display issue' }));
      } else if (lower.includes("tried") || lower.includes("already")) {
        reply = "Thanks for confirming, Sarah. Since you've already completed those troubleshooting steps, I won't ask you to repeat them. Let's move directly to technician booking under your active warranty.";
        setAnalysis(prev => ({ ...prev, previousAction: 'Standard troubleshooting', previousResult: 'Failed / Exhausted', customerIntent: 'Requesting specialist escalation', priority: 'High' }));
      } else if (lower.includes("solve") || lower.includes("can you")) {
        reply = "Yes, absolutely. I'm here to resolve your issue. We have logged your purchase (#AMZ-78241) and active warranty. I can guide you through targeted checks or book an on-site technician.";
        setAnalysis(prev => ({ ...prev, customerIntent: 'Seeking resolution' }));
      } else if (lower.includes("thank")) {
        reply = "You're very welcome, Sarah! Your support context and verified records remain saved in RecallAI so you never have to repeat your story. Let me know if you need anything else.";
      } else {
        reply = `Hi Sarah. I have your Dell Laptop records (#AMZ-78241, Active Warranty) loaded. I'll ensure we don't repeat any previously attempted troubleshooting. How would you like to proceed?`;
      }

      setSuggestedReply(reply);
      setEditableReply(reply);
    }, 900);
  };

  const handleSendToCustomer = () => {
    if (!editableReply.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Local echo
    const agentMsg: ChatEntry = {
      id: `agent_${Date.now()}`,
      sender: 'agent',
      senderName: 'Sarah (Support Agent)',
      content: editableReply,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, agentMsg]);

    // Send via WebSocket to customer chat
    liveWS.sendAgentMessage(editableReply);
    setIsEditing(false);
  };

  const handleGenerateAnotherReply = () => {
    const nextIdx = (replyIndex + 1);
    setReplyIndex(nextIdx);

    liveWS.send({
      type: 'regenerate_suggestion',
      message: latestCustomerMessage || 'Dell laptop issue',
      variation_index: nextIdx
    });

    // Local variation cycle as instant fallback
    const localVariations = [
      `Hello ${customer.name || 'Sarah'}. I've reviewed your previous support history and Amazon order #AMZ-78241. Let's proceed directly with the next logical diagnostic step without repeating past actions.`,
      `Hi ${customer.name || 'Sarah'}. Your Dell Laptop is under active warranty. All prior troubleshooting is logged in RecallAI, and I am ready to dispatch a replacement part or book a specialist visit.`,
      `Thanks for your patience, ${customer.name || 'Sarah'}. I am tracking your case context in real-time and will avoid asking for information you've already shared.`
    ];
    const nextReply = localVariations[nextIdx % localVariations.length];
    setSuggestedReply(nextReply);
    setEditableReply(nextReply);
  };

  const handleRequestTechnician = () => {
    setTechnicianRequested(true);
    liveWS.requestTechnician(
      analysis.issue,
      `Support agent escalated recurring issue for ${customer.name}. Customer reported: "${latestCustomerMessage}"`
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* 1. SUPPORT CENTER TOP HEADER (SECTION 5) */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm ring-2 ring-blue-500/30">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-black text-white text-base tracking-tight">
                RECALLAI SUPPORT CENTER
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                🟢 Online
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Agent: <strong className="text-slate-200">Sarah — Tier 2 Support</strong>
            </p>
          </div>
        </div>

        {/* Current Customer Banner (Section 12) */}
        <div className="flex items-center space-x-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Customer</span>
            <span className="font-extrabold text-white text-sm">{customer.name || 'Sarah'}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Product</span>
            <span className="font-semibold text-blue-400">{analysis.product}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Platform</span>
            <span className="font-semibold text-slate-300">Amazon — Demo</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Order</span>
            <span className="font-mono font-bold text-amber-300">{analysis.order}</span>
          </div>
        </div>

        {/* Quick Route Switches */}
        <div className="flex items-center space-x-2">
          {onOpenCustomerChat && (
            <button
              onClick={onOpenCustomerChat}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Customer Chat</span>
            </button>
          )}

          {onOpenTechnicianConsole && (
            <button
              onClick={onOpenTechnicianConsole}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 text-xs font-bold border border-purple-500/40 transition-colors flex items-center space-x-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-purple-400" />
              <span>Technician Console</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN SUPPORT WORKSPACE (SECTIONS 5, 6, 7, 8) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6 overflow-hidden">
        {/* ========================================================
            COLUMN 1 (LEFT - 4 Cols): LIVE CUSTOMER CONVERSATION
        ======================================================== */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                CUSTOMER CONVERSATION
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live Stream</span>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => {
              const isCust = m.sender === 'customer';
              const isAgent = m.sender === 'agent';
              const isTech = m.sender === 'technician';

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-2xl text-xs space-y-1 ${
                    isCust
                      ? 'bg-blue-950/60 border border-blue-500/30 text-blue-100'
                      : isAgent
                      ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-100 ml-3'
                      : isTech
                      ? 'bg-purple-950/60 border border-purple-500/30 text-purple-100 ml-3'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-extrabold flex items-center space-x-1">
                      {isCust ? (
                        <User className="w-3 h-3 text-blue-400" />
                      ) : isAgent ? (
                        <Headphones className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <Wrench className="w-3 h-3 text-purple-400" />
                      )}
                      <span>{m.senderName}</span>
                    </span>
                    <span className="text-slate-400">{m.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed font-medium">
                    "{m.content}"
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Customer input synced live</span>
            <span className="text-emerald-400 font-semibold">WebSockets Active</span>
          </div>
        </div>

        {/* ========================================================
            COLUMN 2 (CENTER - 4 Cols): CUSTOMER MESSAGE ANALYSIS
        ======================================================== */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                CUSTOMER MESSAGE ANALYSIS
              </h2>
            </div>
            <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
              AI Grounding
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* What Did Customer Say? */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                WHAT DID THE CUSTOMER SAY?
              </span>
              <p className="text-xs font-bold text-white italic">
                "{latestCustomerMessage}"
              </p>
            </div>

            {/* AI Status Progress Bar (Section 20) */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Cognitive State:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className={`p-1.5 rounded-lg border font-bold flex items-center space-x-1 ${
                  statusStage === 'analyzing'
                    ? 'bg-blue-600/30 border-blue-400 text-blue-200 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}>
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>🧠 Analyzing...</span>
                </div>

                <div className={`p-1.5 rounded-lg border font-bold flex items-center space-x-1 ${
                  statusStage === 'history'
                    ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}>
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>🔍 History Checked</span>
                </div>

                <div className={`p-1.5 rounded-lg border font-bold flex items-center space-x-1 ${
                  statusStage === 'context'
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}>
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  <span>✓ Context Found</span>
                </div>

                <div className={`p-1.5 rounded-lg border font-bold flex items-center space-x-1 ${
                  statusStage === 'ready'
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>✍️ Ready to Reply</span>
                </div>
              </div>
            </div>

            {/* WHAT THE CUSTOMER IS SAYING (SECTION 12) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 block">
                RECALLAI UNDERSTANDING
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Intent:</span>
                  <span className="font-bold text-white">{analysis.customerIntent}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Product:</span>
                  <span className="font-bold text-blue-300">{analysis.product}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Order Ref:</span>
                  <span className="font-mono font-bold text-amber-300">{analysis.order}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Issue:</span>
                  <span className="font-bold text-rose-300">{analysis.issue}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Previous Action:</span>
                  <span className="font-bold text-amber-400">{analysis.previousAction}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Priority:</span>
                  <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                    analysis.priority === 'High' || analysis.priority === 'Urgent'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {analysis.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* CUSTOMER MEMORY (SECTION 13) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                  CUSTOMER MEMORY
                </span>
                <span className="text-[10px] font-bold text-slate-400">Last contact: 2 days ago</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-bold">Conversations</span>
                  <span className="font-extrabold text-white text-sm">4</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-bold">Tickets</span>
                  <span className="font-extrabold text-blue-400 text-sm">3</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-bold">Solutions</span>
                  <span className="font-extrabold text-emerald-400 text-sm">2</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-bold">Failed Attempts</span>
                  <span className="font-extrabold text-rose-400 text-sm">1</span>
                </div>
              </div>

              {/* RELEVANT MEMORY CHECKLIST (SECTION 13) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  RELEVANT HISTORY
                </span>
                {isSarah ? [
                  "✓ Customer verified: Sarah",
                  "✓ Product: Dell Laptop (#AMZ-78241 from Amazon)",
                  "✓ Warranty status: Active",
                  "✓ Previous issue: Battery drain",
                  "✓ Previous solution: Battery settings adjustment (Resolved)",
                  "✓ Current issue: Laptop not charging"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-emerald-300">
                    <span>{item}</span>
                  </div>
                )) : [
                  "✓ Customer already reported this issue in ticket #8841",
                  "✓ Cache clearing failed previously",
                  "✓ Application reinstall only worked temporarily",
                  "✓ Issue returned, confirming recurring root-cause",
                  "✓ Customer should not repeat the same failed steps"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center text-emerald-300">
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HINDSIGHT FOR SUPPORT AGENT (SECTION 15) */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>HINDSIGHT (Section 15)</span>
              </span>

              {isSarah ? (
                <div className="space-y-2 text-xs text-amber-100">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/20 space-y-1 text-[11px]">
                    <div><span className="text-slate-400 font-bold">Previous problem:</span> Battery drain</div>
                    <div><span className="text-slate-400 font-bold">Action:</span> Battery settings adjustment</div>
                    <div><span className="text-emerald-400 font-bold">Result:</span> Resolved</div>
                    <div className="pt-1 border-t border-slate-800 text-amber-200 italic">
                      "Battery-related issue was previously resolved through settings adjustment."
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] space-y-1">
                    <div><span className="text-slate-400 font-bold">Current problem:</span> Charging failure</div>
                    <div className="text-emerald-300 font-bold">
                      <span className="text-slate-400 font-bold">Recommendation:</span> Do not repeat the previous battery troubleshooting. Investigate charging hardware / adapter path.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-amber-100">
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                    <li>Customer reported recurring application crash (#8841).</li>
                    <li>Cache clearing failed.</li>
                    <li>Reinstallation provided temporary relief.</li>
                    <li>Issue returned.</li>
                  </ol>
                  <div className="pt-2 border-t border-amber-500/20 space-y-1 text-[11px]">
                    <div><span className="text-slate-400 font-bold">Previous resolution:</span> Reinstallation was temporary.</div>
                    <div><span className="text-slate-400 font-bold">Current situation:</span> Customer experiencing repeat crash.</div>
                    <div className="text-emerald-300 font-bold"><span className="text-slate-400 font-bold">Recommended action:</span> Investigate logs without repeating failed reinstall.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            COLUMN 3 (RIGHT - 4 Cols): "WHAT SHOULD I REPLY?"
        ======================================================== */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                WHAT SHOULD I REPLY? (CORE)
              </h2>
            </div>
            <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Zero-Repeat Engine
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* RecallAI Suggestion Guidance Notice (Section 14) */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>RecallAI Recommends (Section 14):</span>
              </span>
              <p className="text-slate-300 leading-relaxed font-medium">
                {isSarah ? (
                  <>
                    "Customer previously had a battery drain issue resolved via settings. Current issue is charging failure.
                    <strong className="text-white block mt-1">Do not repeat software battery troubleshooting. Investigate charging hardware / adapter path."</strong>
                  </>
                ) : (
                  <>
                    The customer has already tried reinstalling the application, and it only provided temporary relief.
                    <strong className="text-white block mt-1">Acknowledge previous attempt and avoid repeating the same step.</strong>
                  </>
                )}
              </p>
            </div>

            {/* Editable Response Textarea (Section 8, 9, 23) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                  Suggested Response (Agent Editable):
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{isEditing ? 'Locked' : 'Edit Text'}</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={editableReply}
                onChange={(e) => setEditableReply(e.target.value)}
                className="w-full bg-slate-950 border border-blue-500/40 focus:border-blue-400 focus:outline-none rounded-2xl p-3.5 text-xs text-white leading-relaxed placeholder-slate-500 transition-colors"
                placeholder="Edit your response to the customer here..."
              />
            </div>

            {/* Primary Action Buttons (Section 8 & 9) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSendToCustomer}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wide shadow-md transition-all flex items-center justify-center space-x-2 transform hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>Send to Customer</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditableReply(suggestedReply);
                    handleSendToCustomer();
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors text-center"
                >
                  Quick Send Suggestion
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAnotherReply}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Generate Another</span>
                </button>
              </div>
            </div>

            {/* WHY THIS REPLY? (SECTION 14) */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WHY THIS REPLY? (Internal Audit Only)</span>
              </span>

              <div className="space-y-1 text-[11px] text-slate-300 font-medium">
                <div className="flex items-center space-x-2 text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 font-bold" />
                  <span>Customer already reported this issue in ticket #8841</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 font-bold" />
                  <span>Previous ticket #8841 found</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 font-bold" />
                  <span>Previous solution found (Reinstallation)</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 font-bold" />
                  <span>Previous solution was temporary</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 font-bold" />
                  <span>Customer should not repeat the same step</span>
                </div>
              </div>
            </div>

            {/* TECHNICIAN HANDOFF (SECTION 16) */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-purple-400" />
                  <span>TECHNICIAN HANDOFF</span>
                </span>
                {technicianRequested && (
                  <span className="text-[10px] font-black uppercase text-purple-200 bg-purple-600 px-2 py-0.5 rounded-full">
                    Requested
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                If technical specialist investigation is required, dispatch the complete context packet without having the customer start from zero.
              </p>

              <button
                type="button"
                onClick={handleRequestTechnician}
                disabled={technicianRequested}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{technicianRequested ? 'Technician Case Dispatched' : 'Request Technician'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
