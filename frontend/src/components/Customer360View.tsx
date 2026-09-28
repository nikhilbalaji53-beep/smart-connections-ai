import React from 'react';
import type { Customer, Ticket, MemoryTimelineEvent } from '../types';
import {
  Server,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface Customer360ViewProps {
  customer: Customer;
  tickets: Ticket[];
  timeline: MemoryTimelineEvent[];
}

export const Customer360View: React.FC<Customer360ViewProps> = ({
  customer,
  tickets,
  timeline,
}) => {
  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress');
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved');

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 block">Single Pane of Glass</span>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Customer 360 Context Center</h2>
          <p className="text-xs text-slate-500 font-medium">ONE SCREEN = COMPLETE CUSTOMER CONTEXT</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            100% Context Retention
          </span>
        </div>
      </div>

      {/* Row 1: Profile & Identity + Environment Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{customer.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{customer.role_title} • {customer.organization}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
              <span className="font-semibold text-slate-800">{customer.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Team</span>
              <span className="font-semibold text-slate-800">{customer.team || 'DevOps'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Account Number</span>
              <span className="font-mono font-semibold text-slate-800">{customer.account_id || 'CT-7842'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
              <span className="font-semibold text-slate-800">{customer.location || 'Remote'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Since</span>
              <span className="font-semibold text-slate-800">{customer.customer_since || 'March 2023'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Status</span>
              <span className="font-bold text-emerald-600">{customer.customer_status || 'Active Customer'}</span>
            </div>
          </div>
        </div>

        {/* Technical Environment Specs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Technical Environment Matrix</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Operating System:</span>
              <span className="font-bold text-slate-900">{customer.environment?.operating_system} {customer.environment?.os_version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Application & Version:</span>
              <span className="font-bold text-blue-700">{customer.environment?.application_name} {customer.environment?.application_version}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Cloud Platform:</span>
              <span className="font-semibold text-slate-800">{customer.environment?.cloud_provider}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Hardware Tier:</span>
              <span className="font-semibold text-slate-800">{customer.environment?.hardware_tier}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Runtime Dependencies:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[220px]">{customer.environment?.runtime_environment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Solutions That Worked vs Failed Solutions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">Solutions That Worked</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs">
            <span className="font-bold block text-[11px] uppercase">Reinstall application v3.16</span>
            <p className="mt-1">Reinstalling the application with the latest patch resolved the pipeline crash in Ticket #8841.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-rose-100">
            <XCircle className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider">Failed Attempts (Do Not Repeat)</h3>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-900 text-xs">
            <span className="font-bold block text-[11px] uppercase">Cache clearing</span>
            <p className="mt-1">Attempted twice in Ticket #8841; failed to resolve the root cause. Ruled out permanently.</p>
          </div>
        </div>
      </div>

      {/* Row 3: Ticket History Summary & Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Complete Ticket & Interaction History</h3>
          <span className="text-xs text-slate-400 font-medium">{tickets.length} Historical Records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold uppercase text-amber-700">Open & Active Tickets</span>
            <div className="text-2xl font-black text-amber-950 mt-1">{openTickets.length}</div>
            <span className="text-[11px] text-amber-800">Requires investigation</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase text-emerald-700">Resolved Cases</span>
            <div className="text-2xl font-black text-emerald-950 mt-1">{resolvedTickets.length}</div>
            <span className="text-[11px] text-emerald-800">Archived with resolution logs</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[10px] font-bold uppercase text-blue-700">Recurring Issues</span>
            <div className="text-2xl font-black text-blue-950 mt-1">1</div>
            <span className="text-[11px] text-blue-800">Pipeline timeout recurrence</span>
          </div>
        </div>

        {/* Timeline Event Trail */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-3">Chronological Support Journey ({timeline.length} events):</span>
          <div className="space-y-2">
            {timeline.slice(0, 4).map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold text-slate-800">{ev.title}</span>
                  <span className="text-slate-400 text-[11px]">— {ev.description}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{ev.event_date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
