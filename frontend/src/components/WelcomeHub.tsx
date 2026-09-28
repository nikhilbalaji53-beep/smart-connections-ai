import React from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  XCircle,
  CheckCircle2,
  Brain
} from 'lucide-react';

interface WelcomeHubProps {
  onSelectOption: (option: 'support' | 'dashboard' | 'judge') => void;
}

export const WelcomeHub: React.FC<WelcomeHubProps> = ({ onSelectOption }) => {
  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-10 max-w-6xl mx-auto">
      {/* 1. WELCOME HERO SECTION */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold tracking-wide">
          <Brain className="w-3.5 h-3.5 text-blue-600" />
          <span>Microsoft AI Hackathon Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          WELCOME TO <span className="text-blue-600">RECALLAI</span>
        </h1>
        <p className="text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          "Your AI support agent remembers the story, so your customers don't have to repeat it."
        </p>
      </div>

      {/* 2. THREE PROMINENT OPTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Option 1: Customer Support */}
        <button
          onClick={() => onSelectOption('support')}
          className="group text-left p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              Customer Support
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Experience the end-user support interface with real-time persistent memory and zero-repetition diagnostics.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-blue-600 pt-2">
            <span>Launch Live Support</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Option 2: Agent Dashboard */}
        <button
          onClick={() => onSelectOption('dashboard')}
          className="group text-left p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-indigo-600 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              Agent Dashboard
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tier-3 specialist operations center: visual memory timelines, related ticket graphs, and operational analytics.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-indigo-600 pt-2">
            <span>Open Agent Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Option 3: Judge Demo (Special Highlight) */}
        <button
          onClick={() => onSelectOption('judge')}
          className="group text-left p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 border-2 border-amber-400 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between space-y-4 transform hover:scale-[1.02]"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-950">
                Judge Demo
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>
            <p className="text-xs text-slate-900 font-semibold leading-relaxed">
              Step-by-step interactive walkthrough demonstrating the 3 real-world problems: Laptop Replacement, Software Crash, and Internet Outage.
            </p>
          </div>
          <div className="flex items-center text-xs font-black text-slate-950 pt-2">
            <span>Launch Judge Experience</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* 3. THE REAL-LIFE PROBLEM & SOLUTION SHOWCASE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">The Problem</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Why Normal AI Fails</h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto font-medium">
            Customers shouldn't have to repeat their story every time they contact support.
          </p>
        </div>

        {/* Side-by-Side Reality Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Normal AI Failure Box */}
          <div className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-rose-200">
                <XCircle className="w-4 h-4 text-rose-600" />
                <h4 className="font-black text-xs text-rose-950 uppercase tracking-wider">NORMAL CUSTOMER SUPPORT</h4>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-rose-100 text-slate-800">
                  <strong className="text-slate-900 block text-[11px]">Customer:</strong>
                  "I ordered a laptop last week. It arrived with a cracked screen. Someone told me a replacement was already on the way."
                </div>

                <div className="p-2.5 rounded-lg bg-rose-100/60 border border-rose-200 text-rose-900">
                  <strong className="text-rose-950 block text-[11px]">Standard Chatbot:</strong>
                  "Hello! How can I help you today?"
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-rose-100 text-slate-800">
                  <strong className="text-slate-900 block text-[11px]">Customer:</strong>
                  "I already explained this yesterday."
                </div>

                <div className="p-2.5 rounded-lg bg-rose-100/60 border border-rose-200 text-rose-900">
                  <strong className="text-rose-950 block text-[11px]">Standard Chatbot:</strong>
                  "Could you please provide your order number?"
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200 space-y-1.5 text-[11px] text-rose-900 font-medium">
              <div className="flex items-center">❌ No historical context</div>
              <div className="flex items-center">❌ Customer repeats information</div>
              <div className="flex items-center">❌ Previous solution forgotten</div>
              <div className="flex items-center">❌ Customer frustration increases</div>
            </div>
          </div>

          {/* RecallAI Solution Box */}
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="font-black text-xs text-emerald-950 uppercase tracking-wider">WITH RECALLAI</h4>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-emerald-100 text-slate-800">
                  <strong className="text-slate-900 block text-[11px]">Customer:</strong>
                  "My replacement still hasn't arrived."
                </div>

                <div className="p-3 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-950 space-y-1.5 leading-relaxed">
                  <strong className="text-emerald-900 block text-[11px]">RecallAI:</strong>
                  <p>"Welcome back. I found your previous support case regarding your laptop replacement.</p>
                  <p>Your laptop was reported with a cracked screen on September 20. A replacement was requested in <strong>Ticket #4821</strong>.</p>
                  <p>The replacement was expected to arrive by September 25, but your latest message indicates it has not arrived.</p>
                  <p className="font-bold text-emerald-800">You don't need to repeat the previous details."</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200 space-y-1.5 text-[11px] text-emerald-900 font-medium">
              <div className="flex items-center">✓ Customer identified automatically</div>
              <div className="flex items-center">✓ Previous ticket #4821 retrieved</div>
              <div className="flex items-center">✓ Delivery window verified without prompting</div>
              <div className="flex items-center font-bold text-emerald-950">✓ Customer never repeats their story</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
