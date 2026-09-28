import React from 'react';
import type { Customer, Ticket } from '../types';
import { CustomerChatView } from './CustomerChatView';
import { SupportConsoleView } from './SupportConsoleView';
import { Split, Headphones, User } from 'lucide-react';

interface DualSplitViewProps {
  customer: Customer;
  tickets: Ticket[];
  onOpenCustomerOnly: () => void;
  onOpenSupportOnly: () => void;
  onOpenTechnicianConsole?: () => void;
}

export const DualSplitView: React.FC<DualSplitViewProps> = ({
  customer,
  tickets,
  onOpenCustomerOnly,
  onOpenSupportOnly,
  onOpenTechnicianConsole
}) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Banner explaining the Dual Live Architecture */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-300 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-blue-600/30 text-blue-400">
            <Split className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white">REAL-TIME DUAL VIEW DEMO:</span>
          <span className="hidden md:inline text-slate-400">
            Left: Clean Customer Chat (No internal AI leakage) • Right: Support Console (Analysis & Suggested Reply)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenCustomerOnly}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1"
          >
            <User className="w-3 h-3 text-blue-400" />
            <span>Maximize Customer</span>
          </button>

          <button
            onClick={onOpenSupportOnly}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1"
          >
            <Headphones className="w-3 h-3 text-indigo-400" />
            <span>Maximize Support</span>
          </button>
        </div>
      </div>

      {/* 2-Pane Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Pane: Customer Chat (5 Columns) */}
        <div className="lg:col-span-5 h-full overflow-hidden flex flex-col bg-slate-50">
          <CustomerChatView
            customer={customer}
            onOpenSupportAgent={onOpenSupportOnly}
          />
        </div>

        {/* Right Pane: Support Console (7 Columns) */}
        <div className="lg:col-span-7 h-full overflow-hidden flex flex-col bg-slate-950">
          <SupportConsoleView
            customer={customer}
            tickets={tickets}
            onOpenCustomerChat={onOpenCustomerOnly}
            onOpenTechnicianConsole={onOpenTechnicianConsole}
          />
        </div>
      </div>
    </div>
  );
};
