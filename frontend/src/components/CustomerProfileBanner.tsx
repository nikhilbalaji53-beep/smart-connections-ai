import React from 'react';
import type { Customer, Ticket } from '../types';
import {
  User,
  Building,
  Mail,
  ShieldCheck,
  Calendar,
  Server,
  Layers,
  MapPin,
  Tag,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';

interface CustomerProfileBannerProps {
  customer: Customer;
  activeTicket: Ticket | null;
}

export const CustomerProfileBanner: React.FC<CustomerProfileBannerProps> = ({
  customer,
  activeTicket,
}) => {
  return (
    <div className="bg-white border-b border-slate-200">
      {/* 1. Permanent Customer Identity & Environment Strip */}
      <div className="px-4 lg:px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-y-2 text-xs border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold text-slate-100 text-sm">
            <User className="w-4 h-4 text-blue-400" />
            <span>{customer.name}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-300">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{customer.organization}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <div className="flex items-center space-x-1 text-slate-300">
            <span className="text-slate-400">Role:</span>
            <span className="font-medium text-slate-200">{customer.role_title}</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-300">
            <span className="text-slate-400">Team:</span>
            <span className="font-medium text-slate-200">{customer.team || 'DevOps'}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <div className="flex items-center space-x-1 text-slate-300">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-200 font-mono text-[11px]">{customer.email}</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
              {customer.customer_status || 'Active Customer'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>Since {customer.customer_since || 'March 2023'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 text-[11px]">
          <div className="flex items-center space-x-1">
            <Server className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">Env:</span>
            <span className="font-semibold text-slate-200">{customer.environment?.operating_system} {customer.environment?.os_version}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span className="text-slate-400">App:</span>
            <span className="font-semibold text-blue-300">{customer.environment?.application_name} {customer.environment?.application_version}</span>
          </div>

          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{customer.location || 'Remote'}</span>
          </div>

          <div className="flex items-center space-x-1 font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
            <Tag className="w-3 h-3 text-slate-400 mr-0.5" />
            ID: {customer.account_id || 'CT-7842'}
          </div>
        </div>
      </div>

      {/* 2. Current Problem Context Banner */}
      <div className="px-4 lg:px-6 py-2.5 bg-gradient-to-r from-amber-50 via-orange-50/50 to-blue-50/40 border-b border-amber-200/70 flex flex-wrap items-center justify-between gap-y-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="uppercase text-[10px] tracking-wider text-amber-700 font-bold">Current Issue:</span>
            <span className="text-xs text-slate-900 font-extrabold">{activeTicket?.title || 'Recurring Pipeline Timeout'}</span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Priority:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              {activeTicket?.priority || 'High'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Status:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center">
              <Clock className="w-3 h-3 mr-1 text-blue-600 animate-spin" />
              {activeTicket?.status || 'Investigating'}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-slate-700">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase text-slate-400">Related Issue:</span>
            <span className="font-semibold text-blue-800 underline cursor-pointer">
              Previous pipeline timeout ticket (#8841)
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1" />
          <span>Zero-Repetition Protocol Active</span>
        </div>
      </div>
    </div>
  );
};
