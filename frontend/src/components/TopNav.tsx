import React from 'react';
import type { Customer, DemoScenario } from '../types';
import {
  Brain,
  ShieldCheck,
  Search,
  Bell,
  Sparkles,
  RotateCcw,
  User,
  ChevronDown,
  Home,
  Bot,
  Wrench,
  Split,
  Globe
} from 'lucide-react';

export type UserRole = 'customer' | 'agent' | 'technician' | 'dual';

interface TopNavProps {
  customers: Customer[];
  activeCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  scenarios: DemoScenario[];
  onSelectScenario: (scenario: DemoScenario) => void;
  onResetDemo: () => void;
  isResetting: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenJudgeDemo?: () => void;
  onOpenWelcomeHub?: () => void;
  onOpenKnowledgeTrainer?: () => void;
  currentRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  customers,
  activeCustomer,
  onSelectCustomer,
  scenarios,
  onSelectScenario,
  onResetDemo,
  isResetting,
  searchQuery,
  onSearchChange,
  onOpenJudgeDemo,
  onOpenWelcomeHub,
  onOpenKnowledgeTrainer,
  currentRole = 'agent',
  onSelectRole,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Taglines */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Brain className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Recall<span className="text-blue-600">AI</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                  Memory Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Bought it once. We'll remember it.</p>
            </div>
          </div>

          {/* Central Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search customers, tickets, or anything..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Central Role Switcher per Section 2: "WHO ARE YOU?" */}
          <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-wider">Role:</span>
            <button
              onClick={() => onSelectRole?.('customer')}
              title="Customer: Experience support that remembers your history"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentRole === 'customer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => onSelectRole?.('agent')}
              title="Support Agent: RecallAI gives you instant customer context and hindsight"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentRole === 'agent'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Support Agent</span>
            </button>
            <button
              onClick={() => onSelectRole?.('technician')}
              title="Technician: Live technical context, diagnostic tools, and 3-way collaboration"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentRole === 'technician'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Technician</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
            <button
              onClick={() => onSelectRole?.('dual')}
              title="Dual Live View: Real-Time Customer Chat on Left, Support Console on Right"
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentRole === 'dual'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Dual View</span>
            </button>
          </div>

          {/* Right Controls: Customer Selector, Scenarios, Notifications, Profile */}
          <div className="flex items-center space-x-2.5">
            {/* Welcome Hub Button */}
            {onOpenWelcomeHub && (
              <button
                onClick={onOpenWelcomeHub}
                title="Return to Welcome Hub"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Hub</span>
              </button>
            )}

            {/* Knowledge Trainer Button */}
            {onOpenKnowledgeTrainer && (
              <button
                onClick={onOpenKnowledgeTrainer}
                title="Crawl web docs & train universal problem solver"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>🌐 Web Trainer</span>
              </button>
            )}

            {/* Prominent Demo Center Button (Section 3 & 25) */}
            {onOpenJudgeDemo && (
              <button
                onClick={onOpenJudgeDemo}
                title="Experience Customer Support That Remembers"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-xs transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>✨ DEMO</span>
              </button>
            )}

            {/* 1-Click Demo Scenarios Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-all">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Stories</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-600 ml-0.5" />
              </button>
              <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  1-Click Hackathon Scenarios
                </div>
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScenario(sc)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50 transition-colors text-xs group/item"
                  >
                    <div className="font-semibold text-slate-800 group-hover/item:text-blue-700">{sc.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{sc.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Demo State Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reset sample customer memories and tickets"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Active Customer Selector */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <div className="text-xs">
                <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider leading-none">Active Customer</span>
                <select
                  value={activeCustomer.id}
                  onChange={(e) => {
                    const found = customers.find(c => c.id === e.target.value);
                    if (found) onSelectCustomer(found);
                  }}
                  className="bg-transparent font-bold text-slate-900 text-xs focus:outline-none cursor-pointer py-0.5"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.organization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600"></span>
            </button>

            {/* Support Agent Profile Badge */}
            <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <span className="font-semibold text-slate-800 block leading-tight">Tier-3 Specialist</span>
                <span className="text-[10px] text-emerald-600 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
