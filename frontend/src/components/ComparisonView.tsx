import React from 'react';
import {
  XCircle,
  CheckCircle2,
  Brain
} from 'lucide-react';

export const ComparisonView: React.FC = () => {
  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
          The Core Differentiator
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          WHY NORMAL AI FAILS
        </h1>
        <p className="text-sm text-slate-600 font-medium max-w-xl mx-auto">
          "Don't make customers repeat their story." • See the dramatic difference between stateless chatbots and RecallAI.
        </p>
      </div>

      {/* Main Defining Promise Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white text-center shadow-lg border border-slate-800">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider mb-2">
          <Brain className="w-3.5 h-3.5" />
          <span>RecallAI Philosophy</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          "Past issues. Real context. Better support."
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl mx-auto font-medium">
          Normal AI starts every conversation from zero. RecallAI starts with context.
        </p>
      </div>

      {/* SIDE-BY-SIDE REAL-WORLD EXAMPLE (INTERNET OUTAGE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: NORMAL CHATBOT */}
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-rose-100">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-950 uppercase tracking-wider">
                  NORMAL CHATBOT
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Stateless, Session-Scoped AI</p>
              </div>
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
                <strong className="block text-[11px] text-slate-500 uppercase font-bold">Customer:</strong>
                "My internet is down again."
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                <strong className="block text-[11px] text-rose-700 uppercase font-bold">Chatbot:</strong>
                "Hello! How can I help you today?"
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
                <strong className="block text-[11px] text-slate-500 uppercase font-bold">Customer:</strong>
                "I already told you yesterday."
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                <strong className="block text-[11px] text-rose-700 uppercase font-bold">Chatbot:</strong>
                "Please provide your account number."
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
                <strong className="block text-[11px] text-slate-500 uppercase font-bold">Customer:</strong>
                "I already provided it."
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">
              Result:
            </span>
            <ul className="space-y-1.5 text-xs font-semibold text-rose-950">
              <li className="flex items-center">❌ Customer repeats the story</li>
              <li className="flex items-center">❌ Previous solution forgotten</li>
              <li className="flex items-center">❌ Previous ticket disconnected</li>
              <li className="flex items-center">❌ Frustration increases</li>
            </ul>
          </div>
        </div>

        {/* RIGHT: RECALLAI */}
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 shadow-md ring-2 ring-emerald-500/10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-emerald-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                  RECALLAI
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Persistent Cross-Session Memory</p>
              </div>
            </div>

            {/* Simulated Chat Dialogue */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900">
                <strong className="block text-[11px] text-slate-500 uppercase font-bold">Customer:</strong>
                "My internet is down again."
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                <strong className="block text-[11px] text-emerald-800 uppercase font-bold">RecallAI:</strong>
                <p className="leading-relaxed">
                  "Welcome back.<br /><br />
                  I found your previous connectivity case.<br /><br />
                  <strong>Yesterday:</strong> Router restart restored the connection temporarily.<br />
                  <strong>Last month:</strong> A technician visit did not permanently resolve the issue.<br /><br />
                  The issue has now returned.<br /><br />
                  <span className="font-bold text-emerald-900 underline">You don't need to repeat those details.</span><br />
                  Let's continue from where we stopped."
                </p>
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
              Result:
            </span>
            <ul className="space-y-1.5 text-xs font-semibold text-emerald-950">
              <li className="flex items-center">✓ Customer recognized</li>
              <li className="flex items-center">✓ Previous history found</li>
              <li className="flex items-center">✓ Previous solutions remembered</li>
              <li className="flex items-center">✓ Failed attempts remembered</li>
              <li className="flex items-center">✓ Current issue connected</li>
              <li className="flex items-center">✓ Personalized next action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
