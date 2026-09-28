import React, { useState, useEffect } from 'react';
import type {
  Customer,
  Ticket,
  MemoryTimelineEvent,
  TicketGraphData,
  KnowledgeArticle,
  EscalationSummary,
  AnalyticsSummary
} from '../types';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  FileText,
  BookOpen,
  AlertOctagon,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Server,
  Copy,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AgentDashboardProps {
  customers: Customer[];
  activeCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  onOpenCustomerPortal: () => void;
}

type TabType = 'overview' | 'customers' | 'timeline' | 'graph' | 'tickets' | 'kb' | 'escalations' | 'analytics';

export const AgentDashboard: React.FC<AgentDashboardProps> = ({
  customers,
  activeCustomer,
  onSelectCustomer,
  onOpenCustomerPortal
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [timeline, setTimeline] = useState<MemoryTimelineEvent[]>([]);
  const [ticketGraph, setTicketGraph] = useState<TicketGraphData>({ nodes: [], edges: [] });
  const [kbArticles, setKbArticles] = useState<KnowledgeArticle[]>([]);
  const [escalationSummary, setEscalationSummary] = useState<EscalationSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [structuredMemory, setStructuredMemory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [activeCustomer.id]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tList, tLine, tGraph, kbList, summary, anal, structMem] = await Promise.all([
        api.getTickets(activeCustomer.id),
        api.getMemoryTimeline(activeCustomer.id),
        api.getTicketGraph(activeCustomer.id),
        api.getKnowledgeArticles(),
        api.getEscalationSummary(activeCustomer.id),
        api.getAnalytics(),
        api.getStructuredMemory(activeCustomer.id)
      ]);

      setTickets(tList);
      setTimeline(tLine);
      setTicketGraph(tGraph);
      setKbArticles(kbList);
      setEscalationSummary(summary);
      setAnalytics(anal);
      setStructuredMemory(structMem);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (escalationSummary) {
      navigator.clipboard.writeText(escalationSummary.raw_markdown);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      const updated = await api.updateTicket(ticketId, { status: newStatus as any });
      setTickets(prev => prev.map(t => t.id === ticketId ? updated : t));
    } catch (err) {
      console.error('Failed to update ticket status', err);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Agent Center</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-white truncate">
            {activeCustomer.organization}
          </div>
          <div className="mt-1">
            <select
              value={activeCustomer.id}
              onChange={(e) => {
                const found = customers.find(c => c.id === e.target.value);
                if (found) onSelectCustomer(found);
              }}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 text-xs">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'customers', label: 'Customer 360 & Memory', icon: Users },
            { id: 'timeline', label: 'AI Memory Timeline', icon: Clock },
            { id: 'graph', label: 'Related Ticket Graph', icon: GitBranch },
            { id: 'tickets', label: 'Support Tickets', icon: FileText, badge: tickets.length },
            { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
            { id: 'escalations', label: 'Smart Escalations', icon: AlertOctagon, badge: 'Live' },
            { id: 'analytics', label: 'Enterprise Analytics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Launch Customer Support Session */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onOpenCustomerPortal}
            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Open Customer Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Operations Dashboard</h2>
                <p className="text-xs text-slate-500">Autonomous support monitoring, memory retrieval KPIs, and customer health</p>
              </div>
              <button
                onClick={loadDashboardData}
                disabled={isLoading}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span>Refresh Metrics</span>
              </button>
            </div>

            {/* SECTION 18: TOP CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">ACTIVE CONVERSATIONS</span>
                <div className="text-2xl font-black mt-1 tracking-tight text-blue-600">14</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">OPEN TICKETS</span>
                <div className="text-2xl font-black mt-1 tracking-tight text-amber-600">8</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">ESCALATIONS</span>
                <div className="text-2xl font-black mt-1 tracking-tight text-purple-600">2</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">RESOLVED TODAY</span>
                <div className="text-2xl font-black mt-1 tracking-tight text-emerald-600">32</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">AVG HANDLE TIME</span>
                <div className="text-2xl font-black mt-1 tracking-tight text-indigo-600">3.8 min</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">REPEAT ISSUES DETECTED</span>
                <div className="text-2xl font-black mt-1 tracking-tight text-rose-600">3</div>
              </div>
            </div>

            {/* SECTION 18: BELOW CARDS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">CURRENT CUSTOMER</span>
                <div className="text-sm font-black text-slate-900 mt-1">{activeCustomer.name}</div>
                <span className="text-[11px] text-slate-500">{activeCustomer.organization}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">CURRENT ISSUE</span>
                <div className="text-sm font-black text-rose-950 mt-1">Recurring pipeline timeout</div>
                <span className="text-[11px] text-rose-700">Ticket #8841</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">MEMORY STATUS</span>
                <div className="text-sm font-black text-blue-900 mt-1">7 relevant memories found</div>
                <span className="text-[11px] text-emerald-600 font-semibold">✓ Zero-Repetition Active</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">HINDSIGHT</span>
                <div className="text-sm font-black text-amber-900 mt-1">3 previous occurrences</div>
                <span className="text-[11px] text-amber-700 font-semibold">Rule-outs enforced</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">AI ACTION</span>
                <div className="text-sm font-black text-indigo-950 mt-1">Investigate recurring cause</div>
                <span className="text-[11px] text-indigo-700 font-semibold">Prescriptive patch ready</span>
              </div>
            </div>

            {/* Middle Grid: Active Customer Status + Frustration Index */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Profile Snapshot */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Customer Focus</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {activeCustomer.tier}
                  </span>
                </div>
                <div className="mt-4 flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                    {activeCustomer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{activeCustomer.name}</h4>
                    <p className="text-xs text-slate-500">{activeCustomer.role_title} @ {activeCustomer.organization}</p>
                    <p className="text-[11px] text-slate-400">{activeCustomer.email}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating System:</span>
                    <span className="font-semibold text-slate-800">{activeCustomer.environment?.operating_system} {activeCustomer.environment?.os_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">App Version:</span>
                    <span className="font-semibold text-slate-800">v{activeCustomer.environment?.application_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Frustration Baseline:</span>
                    <span className="font-semibold text-rose-600">{activeCustomer.baseline_frustration} / 10.0</span>
                  </div>
                </div>
              </div>

              {/* Frustration / Sentiment Gauge */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sentiment Calibration</h3>
                  <span className="text-[10px] text-slate-400">Conversational Signals</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-emerald-700 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> CALM (Technical Flow)
                      </span>
                      <span className="font-bold text-slate-700">{analytics?.frustration_distribution.CALM || 12}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-purple-700 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> CONFUSED (Clarification Mode)
                      </span>
                      <span className="font-bold text-slate-700">{analytics?.frustration_distribution.CONFUSED || 4}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-amber-700 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> FRUSTRATED (Skip Repetition)
                      </span>
                      <span className="font-bold text-slate-700">{analytics?.frustration_distribution.FRUSTRATED || 3}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-rose-700 flex items-center">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" /> URGENT (Immediate Action Plan)
                      </span>
                      <span className="font-bold text-slate-700">{analytics?.frustration_distribution.URGENT || 2}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zero Repetition Highlights */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Memory Guarantee</h3>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    RecallAI prevents customer frustration by filtering out failed attempts before generating any troubleshooting plan.
                  </p>
                  <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
                    <strong>Rule-Out Filter Active:</strong> {structuredMemory?.failed_solutions?.length || 2} previously failed steps are completely ruled out for {activeCustomer.name}.
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('escalations')}
                  className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Generate Case Summary</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recent Tickets Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Historical Support Cases ({tickets.length})</h3>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All Tickets →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Ticket ID</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.slice(0, 5).map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-600">#{t.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">{t.title}</td>
                        <td className="px-4 py-3 text-slate-500">{t.category}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                            t.status === 'Escalated' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {new Date(t.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER 360 & MEMORY */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer 360 & Persistent Memory Graph</h2>
                <p className="text-xs text-slate-500">Multi-layered structured memory profile for {activeCustomer.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Technical Environment Profile */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  <Server className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Environment Specifications</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Operating System</span>
                    <span className="font-semibold text-slate-800">{activeCustomer.environment?.operating_system} {activeCustomer.environment?.os_version}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cloud Infrastructure</span>
                    <span className="font-semibold text-slate-800">{activeCustomer.environment?.cloud_provider}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Application & Version</span>
                    <span className="font-semibold text-slate-800">{activeCustomer.environment?.application_name} v{activeCustomer.environment?.application_version}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Runtime Environment</span>
                    <span className="font-semibold text-slate-800">{activeCustomer.environment?.runtime_environment}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hardware Tier</span>
                    <span className="font-semibold text-slate-800">{activeCustomer.environment?.hardware_tier}</span>
                  </div>
                </div>
              </div>

              {/* Memory: Failed Solutions (Ruled Out) */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Failed Solutions (Ruled Out)</h3>
                </div>

                <div className="space-y-3 text-xs">
                  {structuredMemory?.failed_solutions && structuredMemory.failed_solutions.length > 0 ? (
                    structuredMemory.failed_solutions.map((item: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-900">
                        <span className="text-[10px] font-bold text-rose-700 uppercase block">Rule-Out #{i + 1}</span>
                        <p className="font-medium text-xs mt-0.5">{item.value}</p>
                        {item.ticket_id && (
                          <span className="text-[10px] text-rose-600 block mt-1">Source: Ticket #{item.ticket_id}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs">No failed solutions stored.</p>
                  )}
                </div>
              </div>

              {/* Memory: Successful Solutions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Verified Solutions</h3>
                </div>

                <div className="space-y-3 text-xs">
                  {structuredMemory?.successful_solutions && structuredMemory.successful_solutions.length > 0 ? (
                    structuredMemory.successful_solutions.map((item: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">Verified Fix #{i + 1}</span>
                        <p className="font-medium text-xs mt-0.5">{item.value}</p>
                        {item.ticket_id && (
                          <span className="text-[10px] text-emerald-600 block mt-1">Source: Ticket #{item.ticket_id}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs">No verified solutions stored.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VISUAL MEMORY TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Customer Memory Timeline</h2>
              <p className="text-xs text-slate-500">Chronological visualization of issues reported, attempts made, and environment transitions</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
                {timeline.map((event, idx) => {
                  let badgeBg = 'bg-blue-600';
                  let icon = <Clock className="w-3.5 h-3.5 text-white" />;

                  if (event.badge_variant === 'danger') {
                    badgeBg = 'bg-rose-500';
                    icon = <AlertTriangle className="w-3.5 h-3.5 text-white" />;
                  } else if (event.badge_variant === 'success') {
                    badgeBg = 'bg-emerald-500';
                    icon = <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
                  } else if (event.badge_variant === 'warning') {
                    badgeBg = 'bg-amber-500';
                    icon = <AlertOctagon className="w-3.5 h-3.5 text-white" />;
                  }

                  return (
                    <div key={idx} className="relative pl-6 group">
                      <div className={`absolute -left-2.5 top-1 w-5 h-5 rounded-full ${badgeBg} flex items-center justify-center shadow-xs ring-4 ring-white`}>
                        {icon}
                      </div>

                      <div className="bg-slate-50 group-hover:bg-blue-50/50 transition-colors border border-slate-200 rounded-lg p-4 max-w-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{event.title}</span>
                          <span className="text-[11px] font-mono text-slate-400">{event.event_date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                        {event.related_ticket_id && (
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-blue-600">
                            Ticket #{event.related_ticket_id}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RELATED TICKET GRAPH */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Related Ticket Graph</h2>
              <p className="text-xs text-slate-500">Autonomous clustering of recurring issues, version migrations, and subsystem dependencies</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ticketGraph.nodes.map((node) => (
                  <div key={node.id} className="relative p-4 rounded-xl border border-slate-200 bg-slate-50/60 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                      <span className="font-mono text-xs font-bold text-blue-600">#{node.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        node.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                    <div className="mt-2 font-semibold text-xs text-slate-900">{node.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1">Category: {node.category}</div>
                    <div className="text-[10px] text-slate-400 mt-2">{node.date}</div>

                    {ticketGraph.edges.filter(e => e.source === node.id || e.target === node.id).map((e, eIdx) => (
                      <div key={eIdx} className="mt-2 p-1.5 rounded bg-blue-50 border border-blue-200 text-[10px] text-blue-800 flex items-center">
                        <GitBranch className="w-3 h-3 mr-1 text-blue-600" />
                        <span>Connected to #{e.source === node.id ? e.target : e.source} ({e.relation})</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Support Ticket Management</h2>
                <p className="text-xs text-slate-500">Autonomous ticket creation, linking, and status transitions</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Troubleshooting Attempts</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">#{t.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 max-w-xs">{t.title}</td>
                      <td className="px-4 py-3 text-slate-500">{t.category}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Escalated">Escalated</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                        {t.troubleshooting_performed}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setActiveTab('escalations');
                          }}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Handoff
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: KNOWLEDGE BASE */}
        {activeTab === 'kb' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Support Knowledge Base</h2>
                <p className="text-xs text-slate-500">Verified diagnostic procedures and remediation playbooks</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search articles & error codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {kbArticles
                .filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.error_codes.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((art) => (
                  <div key={art.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-600">{art.article_id}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {art.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{art.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{art.summary}</p>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                      Error Codes: {art.error_codes}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 7: SMART ESCALATIONS */}
        {activeTab === 'escalations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Smart Escalation Handoff Center</h2>
                <p className="text-xs text-slate-500">Instant AI-Generated Case Summary for Tier-3 Engineers with ZERO customer repetition</p>
              </div>
              <button
                onClick={handleCopySummary}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? 'Copied to Clipboard' : 'Copy Case Summary'}</span>
              </button>
            </div>

            {escalationSummary && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300">Executive Handoff Brief</span>
                      <h3 className="text-base font-bold tracking-tight mt-0.5">{escalationSummary.customer_name} ({escalationSummary.organization})</h3>
                      <p className="text-xs text-slate-300 mt-1">{escalationSummary.environment_snapshot}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-amber-300">Frustration Index</span>
                      <div className="text-lg font-bold text-white">{escalationSummary.frustration_level}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Current Issue</h4>
                    <p className="mt-1 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
                      {escalationSummary.current_issue}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-rose-700 uppercase tracking-wider text-[11px] flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      Previously Attempted Solutions (DO NOT ASK CUSTOMER TO REPEAT)
                    </h4>
                    <div className="mt-2 space-y-1.5">
                      {escalationSummary.previous_attempts.map((att, i) => (
                        <div key={i} className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-900 font-medium flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-2 shrink-0"></span>
                          <span>{att}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Related Ticket IDs</h4>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {escalationSummary.related_tickets.map((tId) => (
                          <span key={tId} className="px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
                            #{tId}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Recommended Next Action for Human Agent</h4>
                      <p className="mt-2 text-slate-700 bg-blue-50/50 p-2.5 rounded border border-blue-100 font-medium">
                        {escalationSummary.recommended_next_action}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Enterprise Support Analytics</h2>
              <p className="text-xs text-slate-500">Cross-session resolution efficiency, repeat issue reduction, and sentiment distribution</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat Issue Reduction</span>
                <div className="text-3xl font-extrabold text-emerald-600">{analytics?.repeat_issue_reduction_rate}%</div>
                <p className="text-xs text-slate-500">Zero-repetition enforcement eliminates customer loopbacks on identical issues.</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Autonomous Resolution</span>
                <div className="text-3xl font-extrabold text-blue-600">{analytics?.ai_resolution_rate}%</div>
                <p className="text-xs text-slate-500">Tickets solved autonomously without needing human agent escalation.</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Resolution Time</span>
                <div className="text-3xl font-extrabold text-indigo-600">{analytics?.average_resolution_time_mins} mins</div>
                <p className="text-xs text-slate-500">Down from legacy enterprise average of 18.4 minutes.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
