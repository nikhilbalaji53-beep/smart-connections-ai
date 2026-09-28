import React, { useState } from 'react';
import {
  Brain,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Layers
} from 'lucide-react';
import type { Customer, Ticket } from '../types';

interface HindsightViewProps {
  customers: Customer[];
  activeCustomer: Customer;
  tickets: Ticket[];
  onSelectCustomer: (cust: Customer) => void;
  onOpenCustomerSupport?: (scenarioPrompt?: string) => void;
}

export const HindsightView: React.FC<HindsightViewProps> = ({
  customers,
  activeCustomer,
  tickets,
  onSelectCustomer,
  onOpenCustomerSupport
}) => {
  const [simulationPrompt, setSimulationPrompt] = useState('Application memory spike after v3.16 update');
  const [simulatedAnalysis, setSimulatedAnalysis] = useState<{
    recurrenceCount: number;
    ruleOuts: string[];
    safeSolutions: string[];
    confidence: number;
  } | null>(null);

  const handleRunSimulation = () => {
    // Generate realistic Hindsight rule-outs based on active customer
    if (activeCustomer.id === 'cust_marcus') {
      setSimulatedAnalysis({
        recurrenceCount: 3,
        ruleOuts: [
          'DO NOT ask customer to clear /var/cache/contoso (failed on Sept 14, 2026)',
          'DO NOT ask customer to restart daemon (temporary fix only, failed under load)',
          'DO NOT ask customer to reinstall v3.16 (memory leak recurred after 48h)'
        ],
        safeSolutions: [
          'Apply CGroup v2 memory threshold patch (Hotfix v3.16.2)',
          'Adjust JVM MaxRAMPercentage to 75% in Contoso agent config'
        ],
        confidence: 0.94
      });
    } else if (activeCustomer.id === 'cust_sarah') {
      setSimulatedAnalysis({
        recurrenceCount: 2,
        ruleOuts: [
          'DO NOT ask for order number or purchase receipt (already logged in CT-4821)',
          'DO NOT ask what model was damaged (Dell XPS 15 verified on Sept 20)',
          'DO NOT re-route through standard ground freight inquiry'
        ],
        safeSolutions: [
          'Escalate regional transit courier manifest #9042-8819',
          'Issue expedited delivery confirmation token directly to Sarah'
        ],
        confidence: 0.98
      });
    } else {
      setSimulatedAnalysis({
        recurrenceCount: 2,
        ruleOuts: [
          'DO NOT ask customer to power-cycle optical router or ONT (fiber drop, not LAN)',
          'DO NOT flush DNS cache (dBm attenuation verified on physical line)'
        ],
        safeSolutions: [
          'Initiate automated loopback line diagnostic',
          'Dispatch field technician to street-level fiber terminal with past dBm log'
        ],
        confidence: 0.92
      });
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8 max-w-7xl mx-auto">
      {/* 1. HINDSIGHT HERO BANNER */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>The Hindsight Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            "Know what happened before you decide what happens next."
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
            Hindsight links support history across weeks and months. It uncovers recurrence patterns, marks failed troubleshooting steps as strictly forbidden, and isolates temporary workarounds from permanent solutions.
          </p>
        </div>

        {/* Customer Selector for Hindsight */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs shrink-0 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Inspect Customer Memory:
          </span>
          <select
            value={activeCustomer.id}
            onChange={(e) => {
              const c = customers.find(item => item.id === e.target.value);
              if (c) onSelectCustomer(c);
            }}
            className="bg-slate-900 text-white font-bold p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 w-full cursor-pointer"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.organization})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. RECURRENCE & HISTORICAL PATTERN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recurrence Meter */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
              Recurrence Frequency
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {activeCustomer.id === 'cust_marcus' ? '3x' : activeCustomer.id === 'cust_sarah' ? '2x' : '2x'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">in the last 60 days ({tickets.length} tickets analyzed)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {activeCustomer.id === 'cust_marcus'
              ? 'Marcus has encountered this crash in Ticket #1042, #1019, and today\'s session.'
              : activeCustomer.id === 'cust_sarah'
              ? 'Sarah\'s replacement delivery was delayed twice across tickets #4821 and #4802.'
              : 'David experienced fiber signal degradation across tickets #6210 and #6188.'}
          </p>
        </div>

        {/* Temporary vs Permanent */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
              Fix Longevity Classification
            </span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-900 font-medium">
              <strong className="block text-[11px] text-rose-950 font-bold">Failed:</strong>
              {activeCustomer.id === 'cust_marcus' ? 'Cache clearing & daemon restart' : 'Standard tracking inquiry'}
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 font-medium">
              <strong className="block text-[11px] text-emerald-950 font-bold">Permanent:</strong>
              {activeCustomer.id === 'cust_marcus' ? 'Targeted hotfix patch v3.16.2' : 'Courier hub dispatch override'}
            </div>
          </div>
        </div>

        {/* Zero-Repetition Confidence */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Zero-Repetition Score
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600">100%</span>
            <span className="text-xs text-slate-500 font-semibold">Guardrail Active</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All previously failed troubleshooting attempts have been injected into the AI negative constraint prompt.
          </p>
        </div>
      </div>

      {/* 3. RULE-OUT GUARDRAILS (THE ANTI-SCRIPT) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Active Rule-Out Guardrails for {activeCustomer.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Steps marked strictly FORBIDDEN. Normal chatbots ask these repeatedly; RecallAI permanently suppresses them.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
              Rule-Out #1
            </span>
            <h4 className="font-extrabold text-rose-950">
              {activeCustomer.id === 'cust_marcus' ? 'Never Ask to Clear Cache' : 'Never Ask for Order Number'}
            </h4>
            <p className="text-rose-900 leading-relaxed font-medium">
              {activeCustomer.id === 'cust_marcus'
                ? 'Tested in Ticket #1042 on Sept 14. Failed within 30 minutes under peak telemetry load.'
                : 'Customer provided order number in Ticket #4821. Repeating this will trigger severe frustration.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
              Rule-Out #2
            </span>
            <h4 className="font-extrabold text-rose-950">
              {activeCustomer.id === 'cust_marcus' ? 'Never Suggest Daemon Restart' : 'Never Ask for Model Details'}
            </h4>
            <p className="text-rose-900 leading-relaxed font-medium">
              {activeCustomer.id === 'cust_marcus'
                ? 'Tested in Ticket #1019. Restarting mask memory leaks without freeing exhausted cgroup handles.'
                : 'Customer hardware environment is fully registered as Dell XPS 15 (9530).'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider">
              Rule-Out #3
            </span>
            <h4 className="font-extrabold text-rose-950">
              {activeCustomer.id === 'cust_marcus' ? 'Never Ask for OS or Environment' : 'Never Ask "What is the issue?"'}
            </h4>
            <p className="text-rose-900 leading-relaxed font-medium">
              {activeCustomer.id === 'cust_marcus'
                ? 'Ubuntu 22.04 LTS (Jammy) and Agent v3.16 already indexed in Customer Profile CT-7842.'
                : 'Sarah stated "My replacement still hasn\'t arrived" — previous cracked screen case is already linked.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE HINDSIGHT RULE-OUT SIMULATOR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Interactive Hindsight Simulator
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Test how the Hindsight engine intercepts an incoming problem statement and filters out failed paths before drafting a response.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={simulationPrompt}
              onChange={(e) => setSimulationPrompt(e.target.value)}
              placeholder="Enter a customer symptom (e.g. crashing again, replacement delayed...)"
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-colors"
            />
            <button
              onClick={handleRunSimulation}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 shrink-0"
            >
              <History className="w-4 h-4" />
              <span>Run Hindsight Analysis</span>
            </button>
          </div>

          {/* Simulation Output Card */}
          {simulatedAnalysis && (
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-extrabold text-blue-400 flex items-center">
                  <Brain className="w-4 h-4 mr-1.5" />
                  Hindsight Analysis Completed
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                  Confidence {(simulatedAnalysis.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Forbidden Rules */}
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 block">
                    Strictly Forbidden Steps (Rule-Outs)
                  </span>
                  <ul className="space-y-1.5 text-rose-200">
                    {simulatedAnalysis.ruleOuts.map((r, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Approved Path */}
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                    Recommended Grounded Solutions
                  </span>
                  <ul className="space-y-1.5 text-emerald-200">
                    {simulatedAnalysis.safeSolutions.map((s, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onOpenCustomerSupport?.(simulationPrompt)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center space-x-1.5"
                >
                  <span>Inject into Live Customer Support</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
