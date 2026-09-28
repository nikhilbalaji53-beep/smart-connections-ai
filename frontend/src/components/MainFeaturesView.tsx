import React from 'react';
import {
  Brain,
  History,
  Sparkles,
  GitBranch,
  CheckCircle2,
  XCircle,
  UserCheck,
  AlertOctagon,
  FileText,
  ArrowDown,
  Layers,
  ArrowRight
} from 'lucide-react';

export const MainFeaturesView: React.FC = () => {
  const features = [
    {
      num: "1",
      name: "PERSISTENT MEMORY",
      icon: Brain,
      quote: "Remembers relevant customer history across conversations.",
      color: "border-blue-200 bg-blue-50/60 text-blue-950"
    },
    {
      num: "2",
      name: "CUSTOMER 360",
      icon: UserCheck,
      quote: "Shows the complete customer context in one place.",
      color: "border-indigo-200 bg-indigo-50/60 text-indigo-950"
    },
    {
      num: "3",
      name: "HINDSIGHT",
      icon: History,
      quote: "Understands what worked, what failed, and what happened before.",
      color: "border-amber-200 bg-amber-50/60 text-amber-950"
    },
    {
      num: "4",
      name: "RECURRING ISSUE DETECTION",
      icon: Layers,
      quote: "Recognizes when today's problem is connected to an old problem.",
      color: "border-rose-200 bg-rose-50/60 text-rose-950"
    },
    {
      num: "5",
      name: "SUCCESS MEMORY",
      icon: CheckCircle2,
      quote: "Remembers solutions that actually worked.",
      color: "border-emerald-200 bg-emerald-50/60 text-emerald-950"
    },
    {
      num: "6",
      name: "FAILURE MEMORY",
      icon: XCircle,
      quote: "Prevents the AI from repeatedly suggesting failed solutions.",
      color: "border-red-200 bg-red-50/60 text-red-950"
    },
    {
      num: "7",
      name: "PERSONALIZED AI SUPPORT",
      icon: Sparkles,
      quote: "Uses customer history to provide contextual responses.",
      color: "border-purple-200 bg-purple-50/60 text-purple-950"
    },
    {
      num: "8",
      name: "RELATED TICKETS",
      icon: GitBranch,
      quote: "Connects previous and current support cases.",
      color: "border-cyan-200 bg-cyan-50/60 text-cyan-950"
    },
    {
      num: "9",
      name: "SMART ESCALATION",
      icon: AlertOctagon,
      quote: "Gives human agents the complete story when escalation is needed.",
      color: "border-orange-200 bg-orange-50/60 text-orange-950"
    },
    {
      num: "10",
      name: "AI CASE SUMMARY",
      icon: FileText,
      quote: "Creates an instant summary of the customer's support journey.",
      color: "border-teal-200 bg-teal-50/60 text-teal-950"
    }
  ];

  const flowSteps = [
    { label: "CUSTOMER", color: "bg-blue-600 text-white font-extrabold" },
    { label: "Previous Conversation", color: "bg-slate-100 text-slate-800" },
    { label: "Previous Ticket", color: "bg-slate-100 text-slate-800" },
    { label: "Previous Solutions", color: "bg-emerald-50 text-emerald-900 border-emerald-200 font-bold" },
    { label: "Failed Attempts", color: "bg-rose-50 text-rose-900 border-rose-200 font-bold" },
    { label: "Current Problem", color: "bg-amber-50 text-amber-950 border-amber-200 font-bold" },
    { label: "HINDSIGHT", color: "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black" },
    { label: "AI RECOMMENDATION", color: "bg-blue-900 text-white font-bold" },
    { label: "RESOLUTION", color: "bg-emerald-600 text-white font-bold" },
    { label: "MEMORY UPDATED", color: "bg-indigo-600 text-white font-bold" },
    { label: "BETTER FUTURE SUPPORT", color: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black" }
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-10 max-w-6xl mx-auto">
      {/* 1. SECTION 16: MAIN FEATURES TITLE */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block">
          Platform Architecture
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          MAIN FEATURES
        </h1>
        <p className="text-sm text-slate-600 font-medium max-w-lg mx-auto">
          "Don't make customers repeat their story." • Ten architectural pillars powering RecallAI.
        </p>
      </div>

      {/* 2. SECTION 17: SIMPLE CUSTOMER MEMORY FLOW */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
            Cognitive Lifecycle
          </span>
          <h2 className="text-xl font-black text-slate-900">
            SIMPLE CUSTOMER MEMORY FLOW
          </h2>
          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            How continuous memory loop turns prior issues into effortless future resolutions.
          </p>
        </div>

        {/* Visual Flow diagram (Horizontal on Desktop, Vertical on Mobile) */}
        <div className="hidden lg:grid grid-cols-11 gap-1 items-center text-center">
          {flowSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className={`p-2.5 rounded-xl border text-[11px] shadow-2xs flex items-center justify-center min-h-[58px] ${step.color}`}>
                {step.label}
              </div>
              {idx < flowSteps.length - 1 && (
                <div className="flex justify-center text-slate-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Vertical Flow on smaller screens */}
        <div className="lg:hidden flex flex-col items-center space-y-2 max-w-xs mx-auto text-center">
          {flowSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className={`w-full p-2.5 rounded-xl border text-xs shadow-2xs ${step.color}`}>
                {step.label}
              </div>
              {idx < flowSteps.length - 1 && (
                <ArrowDown className="w-4 h-4 text-slate-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 3. EXACT 10 MAJOR FEATURES GRID (SECTION 16) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((feat) => {
          const Icon = feat.icon;

          return (
            <div
              key={feat.num}
              className={`p-5 rounded-2xl border-2 ${feat.color} shadow-xs flex flex-col justify-between space-y-3`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black opacity-60">
                    FEATURE {feat.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/90 border border-slate-200/80 flex items-center justify-center shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-black text-sm tracking-tight text-slate-900">
                  {feat.num}. {feat.name}
                </h3>

                <p className="text-xs font-semibold text-slate-700 leading-relaxed italic">
                  "{feat.quote}"
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
