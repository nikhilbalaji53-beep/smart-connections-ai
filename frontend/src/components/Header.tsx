import React from 'react';
import type { Customer, DemoScenario } from '../types';
import {
  Brain,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  customers: Customer[];
  activeCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
  viewMode: 'portal' | 'dashboard';
  onToggleViewMode: (mode: 'portal' | 'dashboard') => void;
  scenarios: DemoScenario[];
  onSelectScenario: (scenario: DemoScenario) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  customers,
  activeCustomer,
  onSelectCustomer,
  viewMode,
  onToggleViewMode,
  scenarios,
  onSelectScenario,
  onResetDemo,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Vision Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Brain className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">Recall<span className="text-blue-600">AI</span></span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                  Persistent Memory
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Customer Support That Remembers</p>
            </div>
          </div>

          {/* Quick Demo Scenario Selector */}
          <div className="hidden lg:flex items-center space-x-2">
            <div className="relative group">
              <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-all">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Scenarios</span>
                <ChevronDown className="w-3.5 h-3.5 text-amber-600 ml-1" />
              </button>
              <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                  1-Click Hackathon Scenarios
                </div>
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScenario(sc)}
                    className="w-full text-left p-2 rounded-md hover:bg-blue-50 transition-colors text-xs group/item"
                  >
                    <div className="font-medium text-slate-800 group-hover/item:text-blue-700">{sc.name}</div>
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
              className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          {/* Customer Switcher & Mode Toggle */}
          <div className="flex items-center space-x-3">
            {/* Customer Dropdown */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
              <UserCheck className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold leading-none">Customer Profile</span>
                <select
                  value={activeCustomer?.id || ''}
                  onChange={(e) => {
                    const found = customers.find(c => c.id === e.target.value);
                    if (found) onSelectCustomer(found);
                  }}
                  className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer py-0.5"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.organization})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Portal vs Dashboard View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => onToggleViewMode('portal')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'portal'
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                <span>Customer Portal</span>
              </button>
              <button
                onClick={() => onToggleViewMode('dashboard')}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
                <span>Agent Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
