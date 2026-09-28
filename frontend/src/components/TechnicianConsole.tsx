import React, { useState, useEffect, useRef } from 'react';
import type { Customer, Ticket } from '../types';
import { liveWS, type WSMessage } from '../services/websocket';
import {
  Wrench,
  Bot,
  User,
  Sparkles,
  Send,
  Lock,
  CheckCircle2,
  Clock,
  Wifi,
  MessageSquare,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface TechnicianConsoleProps {
  customer: Customer;
  tickets: Ticket[];
  onOpenCustomerSupport?: () => void;
  onOpenKnowledgeArticle?: (articleId: string) => void;
}

interface ChatItem {
  id: string;
  sender: 'customer' | 'assistant' | 'agent' | 'technician' | 'technician_internal' | 'system';
  content: string;
  is_internal?: boolean;
  badge?: string;
  timestamp: string;
  memory_used?: any[];
  sentiment?: string;
}

interface TimelineItem {
  time: string;
  text: string;
}

export const TechnicianConsole: React.FC<TechnicianConsoleProps> = ({
  customer,
  tickets: _tickets,
  onOpenCustomerSupport,
  onOpenKnowledgeArticle: _onOpenKnowledgeArticle
}) => {
  const isMarcus = customer?.name?.toLowerCase().includes('marcus');

  // Case details state (Sections 18, 19, 20, 21, 22)
  const [currentCase, setCurrentCase] = useState({
    product: isMarcus ? 'Samsung Smartphone' : 'Dell Laptop',
    platform: isMarcus ? 'Flipkart' : 'Amazon',
    order: isMarcus ? '#FK-98213' : '#AMZ-78241',
    issue: isMarcus ? 'Application crash' : 'Laptop not charging',
    warranty: 'Active',
    customerName: customer?.name || (isMarcus ? 'Marcus Vance' : 'Sarah'),
    organization: customer?.organization || (isMarcus ? 'Flipkart — Demo' : 'Amazon — Demo'),
    priority: 'HIGH',
    previousIssue: isMarcus ? 'App crash' : 'Battery drain',
    previousSolution: isMarcus ? 'Cache cleared (temporary)' : 'Battery settings adjustment (Ticket #4821)',
    currentTroubleshooting: [
      '✓ Charger reconnect attempted',
      '✓ Basic charging check completed',
      '✗ Problem still present (Indicator LED off)'
    ]
  });

  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: 'm1',
      sender: 'customer',
      content: 'My laptop is not charging. The charger indicator light is completely off even after reconnecting.',
      timestamp: '10:02 AM'
    },
    {
      id: 'm2',
      sender: 'assistant',
      content: "I've verified your Dell Laptop order (#AMZ-78241 from Amazon) and confirmed your warranty is active.\n\nSince previous software battery troubleshooting was already completed in Ticket #4821 and physical charging failed, I've escalated your case to Technician A with your full product history.",
      timestamp: '10:03 AM',
      badge: 'RecallAI Grounded Support'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [technicianJoined, setTechnicianJoined] = useState(false);
  const [wsConnected, setWsConnected] = useState(true);
  const [caseStatus, setCaseStatus] = useState<'INVESTIGATING' | 'RESOLVED' | 'ESCALATED'>('INVESTIGATING');
  const [diagnosticOutput, setDiagnosticOutput] = useState<string | null>(null);
  const [isResolvingModalOpen, setIsResolvingModalOpen] = useState(false);

  // Resolution options (Section 21)
  const [selectedResolutionType, setSelectedResolutionType] = useState<string>('Faulty charging adapter identified');
  const [resolutionNote, setResolutionNote] = useState<string>('Replacement adapter requested under warranty.');
  const [verifiedResolutionMemory, setVerifiedResolutionMemory] = useState<any | null>(null);

  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([
    { time: '10:00 AM', text: 'Customer opened Dell Laptop support on RecallAI.' },
    { time: '10:01 AM', text: 'RecallAI identified Amazon Order #AMZ-78241 and active warranty.' },
    { time: '10:02 AM', text: 'Customer reported: "My laptop is not charging."' },
    { time: '10:02 AM', text: 'Previous battery troubleshooting retrieved (Ticket #4821).' },
    { time: '10:03 AM', text: 'Hindsight generated: Avoid software repeat; inspect adapter.' },
    { time: '10:03 AM', text: 'Technician A assigned to case.' }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket as technician
    liveWS.connect(customer.id, 'technician');

    const unsubscribe = liveWS.subscribe((msg: WSMessage) => {
      if (msg.type === 'connection_status') {
        setWsConnected(msg.status === 'connected');
      } else if (msg.type === 'chat_message') {
        const newMsg: ChatItem = {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender: msg.sender || 'assistant',
          content: msg.content || '',
          is_internal: msg.is_internal,
          badge: msg.badge,
          timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          memory_used: msg.memory_used,
          sentiment: msg.sentiment
        };
        setMessages((prev) => [...prev, newMsg]);
      } else if (msg.type === 'system_event') {
        const sysMsg: ChatItem = {
          id: `sys_${Date.now()}`,
          sender: 'system',
          content: msg.message || '',
          timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, sysMsg]);
      } else if (msg.type === 'technician_notification') {
        setCurrentCase((prev) => ({
          ...prev,
          product: msg.product || prev.product,
          order: msg.order || prev.order,
          issue: msg.issue || prev.issue,
          customerName: msg.customer_name || prev.customerName,
          organization: msg.organization || prev.organization,
          priority: msg.priority || 'HIGH'
        }));
        setTimelineEvents((prev) => [
          ...prev,
          {
            time: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `High-priority technician case assigned: ${msg.product || 'Dell Laptop'} (${msg.order || '#AMZ-78241'})`
          }
        ]);
      } else if (msg.type === 'diagnostic_result') {
        setDiagnosticOutput(`${msg.telemetry}\nFinding: ${msg.finding}\nRecommended: ${msg.recommended_fix}`);
        setTimelineEvents((prev) => [
          ...prev,
          {
            time: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Diagnostic executed.'
          }
        ]);
      } else if (msg.type === 'case_resolved') {
        setCaseStatus('RESOLVED');
        setVerifiedResolutionMemory(msg.new_memory);
        setTimelineEvents((prev) => [
          ...prev,
          {
            time: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Case marked resolved. New product memory saved.'
          }
        ]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [customer.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinConversation = () => {
    setTechnicianJoined(true);
    liveWS.joinAsTechnician();
    const curTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimelineEvents((prev) => [
      ...prev,
      { time: curTime, text: 'Technician A joined conversation.' }
    ]);

    // Send Section 20 greeting
    const introMsg: ChatItem = {
      id: `tech_${Date.now()}`,
      sender: 'technician',
      content:
        "Hi Sarah. I've reviewed your previous support history and the troubleshooting already completed. You don't need to repeat the details. I'll help you with the charging issue.",
      badge: '🟢 TECHNICIAN',
      timestamp: curTime
    };
    setMessages((prev) => [...prev, introMsg]);
    liveWS.sendTechnicianMessage(introMsg.content, false);
  };

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;
    const curTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isInternalNote) {
      // Internal technician note (private to technical team)
      const internalMsg: ChatItem = {
        id: `int_${Date.now()}`,
        sender: 'technician_internal',
        content: inputVal,
        is_internal: true,
        badge: '🔒 INTERNAL TECHNICIAN NOTE',
        timestamp: curTime
      };
      setMessages((prev) => [...prev, internalMsg]);
      liveWS.sendTechnicianMessage(inputVal, true);
      setTimelineEvents((prev) => [
        ...prev,
        { time: curTime, text: `Technician logged internal note: "${inputVal.slice(0, 40)}..."` }
      ]);
    } else {
      // 3-way customer message
      const techMsg: ChatItem = {
        id: `tech_${Date.now()}`,
        sender: 'technician',
        content: inputVal,
        is_internal: false,
        badge: '🟢 TECHNICIAN',
        timestamp: curTime
      };
      setMessages((prev) => [...prev, techMsg]);
      liveWS.sendTechnicianMessage(inputVal, false);
      setTimelineEvents((prev) => [
        ...prev,
        { time: curTime, text: `Technician messaged customer: "${inputVal.slice(0, 40)}..."` }
      ]);
    }

    setInputVal('');
  };

  const handleRunDiagnostic = () => {
    const curTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDiagnosticOutput(
      "⚡ HARDWARE POWER TELEMETRY:\n" +
      "• DC-In Pin Voltage: 0.0V (Expected: 19.5V)\n" +
      "• Power Brick AC Resistance: Infinite (Open Circuit Fault)\n" +
      "• Battery Cell Health: 94% (Good, No cell swelling detected)\n" +
      "• Root Cause: Internal coil fault in 65W USB-C charging adapter.\n" +
      "• Recommended Action: Request warranty replacement adapter."
    );
    setTimelineEvents((prev) => [
      ...prev,
      { time: curTime, text: 'Hardware diagnostic executed: Faulty charging adapter confirmed.' }
    ]);
  };

  const handleSelectPresetResolution = (type: string, note: string) => {
    setSelectedResolutionType(type);
    setResolutionNote(note);
  };

  const handleConfirmResolution = () => {
    const fullResolutionText = `${selectedResolutionType}: ${resolutionNote}`;
    liveWS.resolveCase(fullResolutionText);
    setIsResolvingModalOpen(false);
  };

  // Section 22: Simulate Future Return — "The Memory Moment"
  const handleSimulateFutureReturn = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 1: Customer returns 3 months later
    const futureCustMsg: ChatItem = {
      id: `fut_cust_${Date.now()}`,
      sender: 'customer',
      content: "My laptop isn't charging again.",
      timestamp: timeStr
    };

    // Step 2: RecallAI recognizes previous adapter replacement and responds
    const futureRecallMsg: ChatItem = {
      id: `fut_ai_${Date.now() + 1}`,
      sender: 'assistant',
      badge: 'RecallAI Memory Engine (3 Months Later)',
      content:
        "Welcome back, Sarah.\n\n" +
        "I found your previous charging-related support case for this Dell Laptop (#AMZ-78241). A faulty adapter was identified and replaced previously.\n\n" +
        "Since the issue has returned, I'll avoid repeating the same troubleshooting and check the previous resolution before recommending the next step.",
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, futureCustMsg, futureRecallMsg]);
    setTimelineEvents((prev) => [
      ...prev,
      { time: timeStr, text: 'Future simulation: Customer returned 3 months later. RecallAI recalled previous adapter replacement!' }
    ]);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* 1. TOP HEADER: TECHNICIAN CASE (Section 19) */}
      <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
              TECHNICIAN CASE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Priority: {currentCase.priority}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                caseStatus === 'RESOLVED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              Status: {caseStatus}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 text-sm">
            <h1 className="text-lg font-black tracking-tight text-white">
              Customer: <span className="text-blue-400">{currentCase.customerName}</span>
            </h1>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">
              Product: <strong className="text-white">{currentCase.product}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">
              Purchased from: <strong className="text-amber-300">{currentCase.platform}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">
              Order: <strong className="text-blue-400 font-mono">{currentCase.order}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold">Warranty: {currentCase.warranty}</span>
          </div>
        </div>

        {/* Real-time Status Indicator Bar */}
        <div className="flex items-center space-x-3 text-xs bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>LIVE</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1 text-slate-300">
            <Wifi className="w-3.5 h-3.5 text-blue-400" />
            <span>WS: {wsConnected ? 'Connected' : 'Offline'}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300 font-medium">Customer: <strong className="text-emerald-400">Online</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-300 font-medium">Specialist: <strong className="text-purple-400">Technician A</strong></span>
          {onOpenCustomerSupport && (
            <>
              <span className="text-slate-700">|</span>
              <button
                onClick={onOpenCustomerSupport}
                className="px-2.5 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Customer Chat</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN TECHNICIAN WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 lg:p-6 overflow-y-auto">
        {/* ========================================================
            COLUMN 1 (LEFT - 4 Columns): CASE SUMMARY & HINDSIGHT
        ======================================================== */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* TECHNICIAN CASE SUMMARY (Section 19) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  TECHNICIAN CASE CONTEXT
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800">
                Never Start From Zero
              </span>
            </div>

            {/* Case Details Box */}
            <div className="text-xs text-slate-700 leading-relaxed space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Current Issue</span>
                  <strong className="text-rose-700 font-extrabold">{currentCase.issue}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Warranty</span>
                  <strong className="text-emerald-700 font-bold">{currentCase.warranty}</strong>
                </div>
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div><strong>Previous issue:</strong> {currentCase.previousIssue}</div>
                <div><strong>Previous solution:</strong> {currentCase.previousSolution}</div>
              </div>

              {/* Current Troubleshooting Attempted (Section 19) */}
              <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Current Troubleshooting:
                </span>
                {currentCase.currentTroubleshooting.map((step, idx) => (
                  <div
                    key={idx}
                    className={`font-semibold ${
                      step.startsWith('✗') ? 'text-rose-700 font-bold' : 'text-emerald-700'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* HINDSIGHT CALLOUT BANNER (Section 19) */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="uppercase tracking-wider text-[10px]">HINDSIGHT GUIDANCE</span>
              </div>
              <p className="font-semibold text-amber-950 leading-relaxed italic">
                "Previous battery issue was resolved through software settings. Current issue appears different and requires technical inspection."
              </p>
            </div>

            {/* Action Buttons for Case Summary */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {!technicianJoined ? (
                <button
                  type="button"
                  onClick={handleJoinConversation}
                  className="col-span-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Accept Case & Join Live Chat</span>
                </button>
              ) : (
                <div className="col-span-2 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Technician Active in Conversation</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRunDiagnostic}
                className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors text-center cursor-pointer"
              >
                Run Hardware Test
              </button>

              <button
                type="button"
                onClick={() => setIsResolvingModalOpen(true)}
                className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-xs text-center cursor-pointer"
              >
                Resolve Case
              </button>
            </div>
          </div>

          {/* Section 22: Simulate Future Return — "The Memory Moment" */}
          <div className="bg-gradient-to-br from-indigo-950 to-purple-950 text-white rounded-3xl p-5 shadow-sm space-y-3 border border-indigo-800/60">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-200">
                THE "MEMORY MOMENT" (Section 22)
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Show hackathon judges what happens when the customer returns <strong>3 months later</strong>:
            </p>
            <button
              type="button"
              onClick={handleSimulateFutureReturn}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Simulate Customer Return 3 Months Later</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Diagnostic Telemetry Output Console */}
          {diagnosticOutput && (
            <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-2xl border border-slate-800 space-y-1.5">
              <div className="text-slate-400 font-sans font-bold uppercase text-[9px] flex items-center justify-between">
                <span>Hardware Telemetry Stream</span>
                <button onClick={() => setDiagnosticOutput(null)} className="text-slate-500 hover:text-white">✕</button>
              </div>
              <div className="whitespace-pre-line leading-relaxed">{diagnosticOutput}</div>
            </div>
          )}
        </div>

        {/* ========================================================
            COLUMN 2 (CENTER - 5 Columns): THREE-WAY LIVE CHAT (Section 20)
        ======================================================== */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex-1 flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    THREE-WAY LIVE CONVERSATION
                  </h3>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Customer ↔ RecallAI ↔ Technician A</p>
              </div>

              <div className="flex items-center space-x-1.5">
                {technicianJoined ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                    Technician A Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                    Observer Mode
                  </span>
                )}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {messages.map((m) => {
                const isCustomer = m.sender === 'customer';
                const isAssistant = m.sender === 'assistant';
                const isTech = m.sender === 'technician';
                const isInternal = m.is_internal || m.sender === 'technician_internal';
                const isSystem = m.sender === 'system';

                if (isSystem) {
                  return (
                    <div
                      key={m.id}
                      className="p-2 text-center text-[11px] font-bold text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200"
                    >
                      {m.content}
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex items-start space-x-2.5 ${
                      isCustomer ? 'justify-start' : isAssistant ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {/* Avatars */}
                    {isCustomer && (
                      <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {isAssistant && (
                      <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-md rounded-2xl p-3 text-xs leading-relaxed ${
                        isInternal
                          ? 'bg-amber-50 text-amber-950 border-2 border-amber-300 shadow-sm'
                          : isTech
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isCustomer
                          ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                          : 'bg-blue-50 text-slate-900 border border-blue-200 shadow-xs'
                      }`}
                    >
                      {/* Header label inside bubble */}
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-black/5 text-[10px] font-black uppercase">
                        <span>
                          {isInternal
                            ? '🔒 INTERNAL TECHNICIAN NOTE'
                            : isTech
                            ? '🟢 TECHNICIAN A'
                            : isCustomer
                            ? currentCase.customerName
                            : m.badge || 'RecallAI Grounded Assistant'}
                        </span>
                        <span className="font-normal opacity-70 text-[9px]">{m.timestamp}</span>
                      </div>

                      <div className="whitespace-pre-line font-medium">{m.content}</div>

                      {/* Internal Note Banner Warning */}
                      {isInternal && (
                        <div className="mt-2 pt-1 border-t border-amber-200 text-[10px] font-bold text-amber-900 flex items-center">
                          <Lock className="w-3 h-3 mr-1 text-amber-700" />
                          <span>Private to Technical Team • Not visible to customer</span>
                        </div>
                      )}
                    </div>

                    {/* Technician Avatar */}
                    {(isTech || isInternal) && (
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={chatEndRef} />
            </div>

            {/* Input Controls & Private Note Toggle */}
            <div className="p-4 bg-white border-t border-slate-200 space-y-2.5">
              {/* Private Note Toggle */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className={`font-bold flex items-center ${isInternalNote ? 'text-amber-800' : 'text-slate-600'}`}>
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    Internal Technician Note (Private)
                  </span>
                </label>

                {isInternalNote && (
                  <span className="text-[10px] font-bold uppercase text-amber-700 px-2 py-0.5 rounded bg-amber-100">
                    Customer Will NOT See This
                  </span>
                )}
              </div>

              {/* Message Box */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    isInternalNote
                      ? 'Type internal technician note (e.g. Verified adapter open-circuit)...'
                      : `Type message to customer ${currentCase.customerName}...`
                  }
                  className={`flex-1 border rounded-xl px-3.5 py-2 text-xs focus:outline-none transition-colors ${
                    isInternalNote
                      ? 'bg-amber-50/50 border-amber-300 text-amber-950 placeholder-amber-700/60 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white'
                  }`}
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputVal.trim()}
                  className={`px-4 py-2 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer ${
                    isInternalNote ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <span>{isInternalNote ? 'Save Note' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            COLUMN 3 (RIGHT - 3 Columns): TIMELINE & NEW PRODUCT MEMORY
        ======================================================== */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          {/* LIVE CASE TIMELINE */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  LIVE CASE TIMELINE
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-Time</span>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-[11px]">
                  <span className="font-mono text-slate-400 text-[10px] shrink-0 mt-0.5">{evt.time}</span>
                  <span className="font-medium text-slate-800 leading-snug">{evt.text}</span>
                </div>
              ))}
            </div>

            {/* NEW PRODUCT MEMORY CARD (Sections 21 & 22) */}
            {verifiedResolutionMemory ? (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-950 border-2 border-emerald-500/40 text-xs space-y-2 text-white shadow-lg animate-fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-800">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                    NEW PRODUCT MEMORY
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SAVED TO MEMORY
                  </span>
                </div>

                <div className="text-xs text-slate-200 space-y-1">
                  <div>
                    <strong className="text-slate-400">Product:</strong> {verifiedResolutionMemory.product || currentCase.product}
                  </div>
                  <div>
                    <strong className="text-slate-400">Order:</strong> {verifiedResolutionMemory.order || currentCase.order}
                  </div>
                  <div>
                    <strong className="text-slate-400">Issue:</strong> {verifiedResolutionMemory.issue || currentCase.issue}
                  </div>
                  <div>
                    <strong className="text-slate-400">Root Cause:</strong>{' '}
                    <span className="text-emerald-300 font-bold">{verifiedResolutionMemory.root_cause}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400">Resolution:</strong>{' '}
                    <span className="text-slate-200">{verifiedResolutionMemory.resolution}</span>
                  </div>
                  <div>
                    <strong className="text-slate-400">Technician:</strong> Technician A
                  </div>
                  <div>
                    <strong className="text-slate-400">Date:</strong> Today
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-800/60 text-[10px] text-emerald-300 font-medium leading-snug">
                  ✓ Future support sessions for this laptop will recall this resolution automatically.
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">
                  Product Memory Status
                </span>
                <p className="text-[11px] text-slate-500">
                  When you resolve this case, RecallAI will store a new permanent memory entry for this {currentCase.product}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RESOLUTION MODAL (Section 21) */}
      {isResolvingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in text-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  RECORD RESOLUTION & SAVE PRODUCT MEMORY
                </h3>
                <p className="text-[11px] text-slate-500">
                  Permanent fix will be saved for {currentCase.product} ({currentCase.order})
                </p>
              </div>
            </div>

            {/* Verified Resolution Options (Section 21) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase block">
                Select Verified Resolution Category:
              </label>

              <div className="space-y-2">
                {[
                  {
                    title: 'Faulty charging adapter identified',
                    desc: 'Replacement adapter requested under warranty.',
                    badge: 'Recommended for Dell Laptop'
                  },
                  {
                    title: 'Internal DC-in power jack replacement',
                    desc: 'Scheduled on-site DC connector repair.',
                    badge: 'Hardware Service'
                  },
                  {
                    title: 'Battery calibration completed',
                    desc: 'CMOS reset and battery calibration successfully restored charging.',
                    badge: 'Firmware Fix'
                  }
                ].map((opt) => (
                  <div
                    key={opt.title}
                    onClick={() => handleSelectPresetResolution(opt.title, opt.desc)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedResolutionType === opt.title
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{opt.title}</span>
                      <span className="text-[9px] font-semibold text-emerald-700 px-1.5 py-0.5 rounded bg-emerald-100/60">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase block">
                Technician Action & Notes:
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="font-bold text-blue-900 block text-[11px]">RecallAI Automated Explanation:</span>
              <p className="text-slate-700 italic">
                "The customer will receive a friendly summary confirming the adapter replacement has been requested, and RecallAI will store this in persistent memory so they never have to explain it again."
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResolvingModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmResolution}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-sm cursor-pointer"
              >
                Confirm Resolution & Save Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianConsole;
