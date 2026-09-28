import React, { useState, useEffect, useRef } from 'react';
import type { Customer, ChatMessage } from '../types';
import { api } from '../services/api';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Server,
  FileText,
  UserCheck,
  Paperclip,
  Check
} from 'lucide-react';

interface CustomerPortalProps {
  customer: Customer;
  onOpenEscalation: (ticketId?: number) => void;
  presetPrompt?: string;
  onClearPresetPrompt?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  customer,
  onOpenEscalation,
  presetPrompt,
  onClearPresetPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [failedSolutions, setFailedSolutions] = useState<string[]>([]);
  const [successfulSolutions, setSuccessfulSolutions] = useState<string[]>([]);
  const [mockAttachment, setMockAttachment] = useState<string | null>(null);
  const [expandedMemoryIdx, setExpandedMemoryIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reload conversation for active customer
  useEffect(() => {
    loadCustomerData();
  }, [customer.id]);

  // Handle incoming preset prompts from 1-click demo scenarios
  useEffect(() => {
    if (presetPrompt) {
      setInputValue(presetPrompt);
      if (onClearPresetPrompt) onClearPresetPrompt();
    }
  }, [presetPrompt]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch tickets to locate active ticket
      const tickets = await api.getTickets(customer.id);
      const open = tickets.find(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Escalated');
      setActiveTicket(open || tickets[0] || null);

      // 2. Fetch memory items
      const memoryItems = await api.getMemoryItems(customer.id);
      const failed = memoryItems.filter(m => m.memory_type === 'failed_solution').map(m => m.value);
      const success = memoryItems.filter(m => m.memory_type === 'successful_solution').map(m => m.value);
      setFailedSolutions(failed);
      setSuccessfulSolutions(success);

      // 3. Reset conversation with smart initial greeting
      const convId = `conv_${customer.id}_${Date.now()}`;
      setConversationId(convId);

      const initialGreeting: ChatMessage = {
        sender: 'assistant',
        content: `Hello ${customer.name}. RecallAI has loaded your verified profile at **${customer.organization}**.\n\nI have persistent awareness of your active environment (${customer.environment?.operating_system || 'Enterprise'} ${customer.environment?.os_version || ''}) and your previous support history.\n\nHow can I assist you with your environment today?`,
        created_at: new Date().toISOString(),
        memory_used: [
          {
            type: 'environment',
            title: `Environment Verified`,
            detail: `${customer.environment?.operating_system || 'OS'} | ${customer.environment?.application_name || 'App'} v${customer.environment?.application_version || ''}`,
            source_id: 'ENV-INIT'
          },
          ...(open ? [{
            type: 'ticket',
            title: `Active Ticket #${open.id}`,
            detail: open.title,
            source_id: `#${open.id}`
          }] : [])
        ]
      };

      setMessages((prev) => (prev.length > 0 ? prev : [initialGreeting]));
    } catch (err) {
      console.error('Failed to load customer portal context', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      content: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setMockAttachment(null);
    setIsLoading(true);

    try {
      const resp = await api.sendMessage(customer.id, textToSend, conversationId || undefined);

      const assistantMessage: ChatMessage = {
        sender: 'assistant',
        content: resp.message,
        created_at: new Date().toISOString(),
        memory_used: resp.memory_used,
        sentiment_tag: resp.sentiment
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (resp.conversation_id) setConversationId(resp.conversation_id);

      // Refresh memory items and tickets in case new items were extracted
      if (resp.new_memory_extracted && resp.new_memory_extracted.length > 0) {
        const mems = await api.getMemoryItems(customer.id);
        setFailedSolutions(mems.filter(m => m.memory_type === 'failed_solution').map(m => m.value));
        setSuccessfulSolutions(mems.filter(m => m.memory_type === 'successful_solution').map(m => m.value));
      }

      if (resp.should_escalate) {
        onOpenEscalation(resp.active_ticket_id);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          content: `Unable to reach RecallAI reasoning engine. Please try again. (${err.message})`,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSentimentBadge = (sentiment?: string) => {
    if (!sentiment) return null;
    switch (sentiment) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-red-600" />
            Urgent • High Ownership Protocol
          </span>
        );
      case 'FRUSTRATED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1 text-amber-600" />
            Frustrated • Skipping Repetition
          </span>
        );
      case 'CONFUSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <HelpCircle className="w-3 h-3 mr-1 text-purple-600" />
            Clarification Mode
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Calm • Technical Support
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Personalized Enterprise Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-xl p-5 text-white shadow-md mb-6 border border-blue-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight">
                  Welcome back, {customer.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30 font-mono">
                  {customer.tier}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                RecallAI maintains persistent cross-session memory of your technical environment and prior tickets.
                <strong className="text-blue-200 ml-1">You will never have to repeat previously failed troubleshooting steps.</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onOpenEscalation(activeTicket?.id)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-all backdrop-blur-xs text-white"
            >
              <UserCheck className="w-4 h-4 text-blue-300" />
              <span>Request Human Specialist</span>
            </button>
          </div>
        </div>

        {/* Injected Context Quick Strip */}
        <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Environment</span>
            <span className="font-medium text-slate-200 truncate block">
              {customer.environment?.operating_system} {customer.environment?.os_version}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Application</span>
            <span className="font-medium text-slate-200 truncate block">
              {customer.environment?.application_name} v{customer.environment?.application_version}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Case</span>
            <span className="font-medium text-amber-300 truncate block">
              {activeTicket ? `#${activeTicket.id} - ${activeTicket.title}` : 'No open cases'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ruled-Out Fixes</span>
            <span className="font-medium text-rose-300 truncate block">
              {failedSolutions.length} steps explicitly bypassed
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Support Chat + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window Column (2 cols) */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs h-[720px]">
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800">RecallAI Active Support Session</h3>
                <p className="text-[11px] text-slate-500">Autonomous Reasoning with Persistent Memory</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-medium text-emerald-700">Memory Graph Connected</span>
            </div>
          </div>

          {/* Messages List Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => {
              const isAssistant = msg.sender === 'assistant';
              const hasMemory = msg.memory_used && msg.memory_used.length > 0;
              const isExpanded = expandedMemoryIdx === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isAssistant
                      ? 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                      : 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                  }`}>
                    {/* Header meta for assistant */}
                    {isAssistant && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                        <span className="font-semibold text-blue-900 text-[11px] flex items-center">
                          <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                          RecallAI Assistant
                        </span>
                        {renderSentimentBadge(msg.sentiment_tag)}
                      </div>
                    )}

                    {/* Formatted Message Content */}
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content}
                    </div>

                    {/* WOW FEATURE: "Memory Used" Transparent Inspector */}
                    {isAssistant && hasMemory && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200">
                        <button
                          onClick={() => setExpandedMemoryIdx(isExpanded ? null : idx)}
                          className="flex items-center justify-between w-full text-[11px] font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                        >
                          <span className="flex items-center">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Memory Used ({msg.memory_used!.length} historical items recalled)
                          </span>
                          <span className="text-[10px] underline">{isExpanded ? 'Hide' : 'Inspect'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 bg-blue-50/80 rounded-lg p-2.5 border border-blue-100 text-[11px]">
                            {msg.memory_used!.map((item, mIdx) => (
                              <div key={mIdx} className="flex items-start space-x-1.5">
                                <Check className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-semibold text-blue-900">{item.title}:</span>{' '}
                                  <span className="text-slate-600">{item.detail}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 rounded-tl-xs flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] text-slate-600">Cross-referencing customer memory and ruling out failed troubleshooting...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context-Aware Scenario Chips */}
          <div className="px-5 py-2 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 uppercase font-semibold tracking-wider text-[10px] shrink-0">Quick Queries:</span>
            <button
              onClick={() => handleSendMessage(customer.id === 'cust_marcus' ? "It's happening again on runner-03. Same timeout error as Tuesday. Fix this." : "My application keeps crashing again after updating this morning.")}
              className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 font-medium shrink-0 transition-colors"
            >
              {customer.id === 'cust_marcus' ? "Runner-03 Timeout Recurrence" : "App Crash Post-Update"}
            </button>
            <button
              onClick={() => handleSendMessage("We tried restarting the runner daemon, but the memory exhaustion returned.")}
              className="px-2.5 py-1 rounded bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 font-medium shrink-0 transition-colors"
            >
              Confirm Failed Step
            </button>
            <button
              onClick={() => onOpenEscalation(activeTicket?.id)}
              className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-medium shrink-0 transition-colors flex items-center"
            >
              <UserCheck className="w-3 h-3 mr-1" />
              Escalate to Tier-3
            </button>
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
            {mockAttachment && (
              <div className="mb-2 flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-xs">
                <span className="flex items-center truncate">
                  <Paperclip className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Attached: {mockAttachment}
                </span>
                <button onClick={() => setMockAttachment(null)} className="text-blue-600 hover:text-blue-800 ml-2">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setMockAttachment('diagnostic_trace_runner03.log')}
                title="Simulate attaching diagnostic log / screenshot"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Describe your issue naturally (RecallAI already knows your ${customer.environment?.operating_system || 'environment'})...`}
                className="flex-1 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-colors"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Customer Memory & Zero-Repetition Guarantee */}
        <div className="space-y-6">
          {/* Active Ticket Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-800">Current Support Ticket</h4>
              </div>
              {activeTicket && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTicket.status === 'Open'
                    ? 'bg-amber-100 text-amber-800'
                    : activeTicket.status === 'Escalated'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {activeTicket.status}
                </span>
              )}
            </div>

            {activeTicket ? (
              <div className="mt-3 space-y-2 text-xs">
                <div className="font-semibold text-slate-900 leading-snug">
                  Ticket #{activeTicket.id}: {activeTicket.title}
                </div>
                <p className="text-slate-500 text-[11px] line-clamp-2">
                  {activeTicket.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Category: {activeTicket.category}</span>
                  <span className="font-medium text-rose-600">Priority: {activeTicket.priority}</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">No open ticket. A new ticket will be generated when you describe an issue.</p>
            )}
          </div>

          {/* Zero-Repetition Guarantee Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <XCircle className="w-4 h-4 text-rose-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Zero-Repetition Protocol</h4>
                <p className="text-[10px] text-slate-400">Previously Failed Steps Ruled Out</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              {failedSolutions.length > 0 ? (
                failedSolutions.map((sol, sIdx) => (
                  <div key={sIdx} className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-900 flex items-start space-x-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[11px] block">RULED OUT:</span>
                      <span className="text-[11px] text-rose-800">{sol}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No failed solutions on record.</p>
              )}
            </div>

            {/* Verified Successful Solutions */}
            {successfulSolutions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Verified Prior Solutions:
                </span>
                <div className="space-y-1.5">
                  {successfulSolutions.map((sol, scIdx) => (
                    <div key={scIdx} className="p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-900 text-[11px] flex items-start space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{sol}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Environment Specs */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs text-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Server className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800">Verified System Profile</h4>
            </div>

            <div className="mt-3 space-y-2.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Operating System:</span>
                <span className="font-semibold text-slate-800">{customer.environment?.operating_system} {customer.environment?.os_version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Application:</span>
                <span className="font-semibold text-slate-800">{customer.environment?.application_name} v{customer.environment?.application_version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Runtime:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">{customer.environment?.runtime_environment}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Hardware Tier:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">{customer.environment?.hardware_tier}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
