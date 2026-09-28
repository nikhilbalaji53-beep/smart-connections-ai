import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Search,
  Check,
  UserCheck,
  AlertOctagon,
  Award,
  Wrench,
  Terminal,
  Bot,
  ShieldCheck,
  Activity,
  Clock,
  Zap,
  MessageSquare
} from 'lucide-react';
import type { Customer } from '../types';

interface JudgeDemoViewProps {
  customers: Customer[];
  onOpenCustomerSupport?: (scenarioPrompt?: string) => void;
  onOpenEscalationModal?: (ticketId?: number) => void;
  onOpenTechnicianConsole?: () => void;
}

interface ScenarioConfig {
  id: string;
  name: string;
  shortTitle: string;
  icon: string;
  customerName: string;
  organization: string;
  ticketId: number;
  problem: string;
  customerMessage: string;
  customerFollowUp: string;
  environment: string;
  failedSolutions: string[];
  workedSolution: string;
  hindsightInsight: string;
  aiResponse: string;
  nextAction: string;
  techName: string;
  techJoinMessage: string;
  newMemoryDetected: string;
  diagnosticResult: string;
  resolutionText: string;
  storedResolution: string;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'laptop',
    name: 'LAPTOP CHARGING ISSUE',
    shortTitle: '💻 LAPTOP CHARGING',
    icon: '💻',
    customerName: 'Sarah',
    organization: 'Amazon (Order #AMZ-78241)',
    ticketId: 7824,
    problem: 'Dell Laptop is not charging.',
    customerMessage: 'My laptop is not charging.',
    customerFollowUp: 'The charging LED does not light up when plugged in.',
    environment: 'Dell XPS 15 • Amazon #AMZ-78241 • Warranty: Active',
    failedSolutions: ['Battery settings adjustment (Verified previous fix, does not apply to charging failure)'],
    workedSolution: 'Faulty charging adapter identified & replacement approved',
    hindsightInsight: 'Previous problem: Battery drain. Previous action: Battery settings adjustment (Resolved). Current problem: Charging failure. HINDSIGHT: Do not repeat battery settings. Investigate charging adapter.',
    aiResponse: "Welcome back, Sarah. I found your Dell Laptop purchased from Amazon (Order #AMZ-78241) with active warranty.\n\nI see your previous battery drain issue was resolved through battery settings. For this new charging issue, let's verify if the LED lights up or if the adapter has failed.",
    nextAction: 'Investigate charging hardware/adapter path without repeating battery settings troubleshooting.',
    techName: 'Technician A (Dell Certified Hardware Specialist)',
    techJoinMessage: "Hi Sarah, Technician A here. I've reviewed your Dell Laptop charging issue and previous battery history. You don't need to repeat the details. I'll help you with the charging issue.",
    newMemoryDetected: 'Adapter DC output test: 0V. Internal pin connection failure identified.',
    diagnosticResult: 'Charging adapter output failure verified. Laptop battery health 94%.',
    resolutionText: 'Faulty charging adapter identified. Replacement 65W Dell adapter dispatched under active warranty.',
    storedResolution: 'Faulty charging adapter identified. Replacement adapter requested under warranty.'
  },
  {
    id: 'smartphone',
    name: 'SMARTPHONE FREEZE & RESTART',
    shortTitle: '📱 SMARTPHONE CRASH',
    icon: '📱',
    customerName: 'Marcus',
    organization: 'Flipkart (Order #FK-98213)',
    ticketId: 8841,
    problem: 'Samsung Galaxy freezing and restarting.',
    customerMessage: 'My phone keeps freezing and restarting.',
    customerFollowUp: 'I already tried clearing the cache last time and it only helped for a day.',
    environment: 'Samsung Galaxy S24 • Flipkart #FK-98213 • Warranty: Active',
    failedSolutions: ['Cache partition clearing (FAILED - temporary fix only)'],
    workedSolution: 'System kernel patch rollback v2.4 applied',
    hindsightInsight: 'Cache clearing was previously attempted and only worked temporarily. Avoid repeating. Check firmware kernel logs directly.',
    aiResponse: "Hello Marcus. I found your Samsung Smartphone purchased from Flipkart (Order #FK-98213).\n\nI see that clearing the cache only helped temporarily. We will not repeat that step. Let's inspect the system crash logs directly.",
    nextAction: 'Review crash telemetry without asking customer to clear cache again.',
    techName: 'Technician B (Mobile OS Specialist)',
    techJoinMessage: "Hello Marcus, Technician B joining. I have your Flipkart ticket #FK-98213 loaded and know cache clearing didn't hold.",
    newMemoryDetected: 'Kernel memory dump indicates corrupted OneUI system update patch.',
    diagnosticResult: 'System partition patch collision detected in background telephony thread.',
    resolutionText: 'Safe-mode OTA partition rollback executed. Device running smooth.',
    storedResolution: 'OS patch rollback applied. Freezing resolved permanently.'
  },
  {
    id: 'headphones',
    name: 'HEADPHONE SILENT EARBUD',
    shortTitle: '🎧 HEADPHONE AUDIO',
    icon: '🎧',
    customerName: 'Alex',
    organization: 'Meesho (Order #MS-67281)',
    ticketId: 6728,
    problem: 'Left earbud is completely silent.',
    customerMessage: 'My left earbud is completely silent.',
    customerFollowUp: 'The right earbud still works fine and pairs immediately.',
    environment: 'Wireless ANC Headphones • Meesho #MS-67281 • Warranty: Active',
    failedSolutions: ['Bluetooth re-pairing (Attempted during initial setup, audio remained dead)'],
    workedSolution: 'Charging contact pin reset & replacement authorized',
    hindsightInsight: 'Bluetooth pairing was confirmed working for the right earbud. Hardware contact pin check required.',
    aiResponse: "Hi Alex. I found your Wireless Headphones purchased from Meesho (Order #MS-67281) with active warranty.\n\nSince Bluetooth pairing is confirmed for the right earbud, we will avoid asking you to re-pair. Let's inspect the charging contact pins in the case.",
    nextAction: 'Inspect hardware charging contacts before initiating warranty replacement.',
    techName: 'Technician C (Audio Specialist)',
    techJoinMessage: "Hi Alex, Audio Specialist joining. I have your Meesho order #MS-67281 and know the right earbud works fine.",
    newMemoryDetected: 'Left earbud contact pin shows zero voltage from cradle due to oxidation.',
    diagnosticResult: 'Contact pin micro-cleaning performed and charging circuit reactivated.',
    resolutionText: 'Left earbud contact pin cleaned and charging circuit verified at 100%.',
    storedResolution: 'Left earbud contact pin cleaned and charging restored under warranty.'
  },
  {
    id: 'washingmachine',
    name: 'APPLIANCE MOTOR LOCK',
    shortTitle: '🧺 WASHING MACHINE',
    icon: '🧺',
    customerName: 'David',
    organization: 'Demo Partner Store (Order #DPS-44109)',
    ticketId: 4410,
    problem: 'Washing machine motor will not start.',
    customerMessage: 'My washing machine will not start after delivery.',
    customerFollowUp: 'The display panel shows error code E-03.',
    environment: 'Front-Load Washer 8kg • Demo Partner Store #DPS-44109 • Warranty: Active',
    failedSolutions: ['Power cycle reboot (Attempted, error E-03 remains)'],
    workedSolution: 'Field technician appointment booked for transit bolt removal',
    hindsightInsight: 'Delivered yesterday via Demo Partner Store. Error E-03 indicates transit shipping bolts remain locked in drum assembly.',
    aiResponse: "Hello David. I pulled up your Washing Machine from Demo Partner Store (Order #DPS-44109).\n\nSince this was just delivered and displays error E-03, this typically indicates transit shipping bolts remain locked. Would you like me to book a technician visit?",
    nextAction: 'Schedule field technician for on-site transit bolt removal without redundant reboot requests.',
    techName: 'Technician A (Appliance Field Specialist)',
    techJoinMessage: "Hello David, Appliance Field Specialist here. I have your order #DPS-44109 and error code E-03 on my screen.",
    newMemoryDetected: 'Transit safety locking bolts engaged in rear chassis preventing drum rotation.',
    diagnosticResult: 'Transit bolts safely dismounted and calibration cycle passed 100%.',
    resolutionText: 'Transit bolts removed and drum motor rotation verified stable.',
    storedResolution: 'Transit bolts removed & drum calibration verified.'
  },
  {
    id: 'recurring',
    name: 'RECURRING ISSUE GUARD',
    shortTitle: '🔁 ZERO REPETITION',
    icon: '🔁',
    customerName: 'Sarah',
    organization: 'Amazon (Order #AMZ-78241)',
    ticketId: 7824,
    problem: 'Customer returning 3 months later with charging issue.',
    customerMessage: 'My laptop is not charging again.',
    customerFollowUp: 'You guys already replaced my adapter 3 months ago.',
    environment: 'Dell XPS 15 • Amazon #AMZ-78241 • Warranty: Active',
    failedSolutions: ['Standard adapter replacement (Already performed in Ticket #7824)'],
    workedSolution: 'Internal DC-in motherboard charging port service authorized',
    hindsightInsight: 'RECALLAI MEMORY TRIGGER: Customer already had adapter replaced 3 months ago. DO NOT troubleshoot adapter again. Escalate directly to internal DC jack repair.',
    aiResponse: "Welcome back, Sarah. RecallAI remembers that 3 months ago your 65W charging adapter was replaced under warranty for Order #AMZ-78241.\n\nSince this issue has returned despite a new adapter, we will NOT repeat adapter troubleshooting. I am routing your ticket directly to Senior Hardware Engineering for DC-in jack replacement.",
    nextAction: 'Bypass all basic troubleshooting and initiate direct motherboard DC-in port servicing.',
    techName: 'Technician A (Dell Certified Hardware Specialist)',
    techJoinMessage: "Hi Sarah. I see your full history: previous battery settings fix, followed by adapter replacement 3 months ago. Skipping all basic steps.",
    newMemoryDetected: 'Internal motherboard DC-in power jack pin loosened due to thermal cycling.',
    diagnosticResult: 'DC-in harness continuity test failed at solder joint.',
    resolutionText: 'Internal DC-in power harness replaced on-site under extended warranty.',
    storedResolution: 'Internal DC-in power harness replaced. Zero customer repetition.'
  },
  {
    id: 'technician',
    name: 'TECHNICIAN 1-CLICK BOOKING',
    shortTitle: '🔧 SPECIALIST BOOKING',
    icon: '🔧',
    customerName: 'Sarah',
    organization: 'Amazon (Order #AMZ-78241)',
    ticketId: 7824,
    problem: 'Self-service exhausted, specialist booking requested.',
    customerMessage: 'I already tried everything and it still does not charge. I want to book a technician.',
    customerFollowUp: 'Can someone come check it tomorrow morning?',
    environment: 'Dell XPS 15 • Amazon #AMZ-78241 • Warranty: Active',
    failedSolutions: ['Self-service troubleshooting exhausted', 'LED off, charger reconnect attempted'],
    workedSolution: 'Technician A confirmed for 10:00 AM with full history forwarded',
    hindsightInsight: 'Customer verified. Product identified. Troubleshooting checklist pre-populated. Full history forwarded to technician so customer repeats nothing.',
    aiResponse: "I've checked your Dell Laptop history on Amazon (Order #AMZ-78241) and all troubleshooting attempted so far.\n\nYou don't need to explain anything again. I've prepared your complete case for Technician A (⭐ 4.9). Would you like to confirm the 10:00 AM slot?",
    nextAction: '1-click appointment confirmation with pre-forwarded memory packet.',
    techName: 'Technician A (Dell Certified Hardware Specialist)',
    techJoinMessage: "Hi Sarah. I've reviewed your Dell Laptop support journey and the troubleshooting already completed. You don't need to repeat the details. I'll help you with the charging issue.",
    newMemoryDetected: 'Customer confirmed 10:00 AM slot. Pre-diagnostic intake attached.',
    diagnosticResult: 'Hardware diagnostic kit pre-dispatched with Dell replacement parts.',
    resolutionText: 'Technician visit scheduled and pre-authorized under Amazon warranty.',
    storedResolution: 'Technician A booked for 10:00 AM with complete memory packet.'
  }
];

export const JudgeDemoView: React.FC<JudgeDemoViewProps> = ({
  customers: _customers,
  onOpenCustomerSupport,
  onOpenEscalationModal,
  onOpenTechnicianConsole
}) => {
  const [demoMode, setDemoMode] = useState<'live' | 'walkthrough'>('live');
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  
  // Section 25 Live Demo State (10 stages)
  const [liveStage, setLiveStage] = useState(1);
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const [liveTimeline, setLiveTimeline] = useState<string[]>([]);
  
  // 10-Step Walkthrough State
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [resolvedScenarios, setResolvedScenarios] = useState<Record<string, boolean>>({});

  const scenario = SCENARIOS[activeScenarioIndex];

  // Auto-play timer for Live Demo (Section 25)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isLivePlaying) {
      timer = setInterval(() => {
        setLiveStage((prev) => {
          if (prev >= 10) {
            setIsLivePlaying(false);
            return 10;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isLivePlaying]);

  // Sync timeline events as live stage advances
  useEffect(() => {
    const stageEvents: Record<number, string> = {
      1: `Customer [${scenario.customerName}] submitted: "${scenario.customerMessage}"`,
      2: `RecallAI retrieved Ticket #${scenario.ticketId} and ruled out failed steps`,
      3: `Zero-Repetition Guard active: Ruled out ${scenario.failedSolutions.join(', ')}`,
      4: `Technician [${scenario.techName}] joined the live session`,
      5: `Customer provided follow-up: "${scenario.customerFollowUp}"`,
      6: `🧠 NEW MEMORY DETECTED: "${scenario.newMemoryDetected}"`,
      7: `Technician executed diagnostic: ${scenario.diagnosticResult}`,
      8: `Technician resolved issue: ${scenario.resolutionText}`,
      9: `✓ RESOLUTION STORED: ${scenario.storedResolution}`,
      10: `Customer profile updated with permanent verified resolution`
    };

    if (demoMode === 'live') {
      const events: string[] = [];
      for (let s = 1; s <= liveStage; s++) {
        if (stageEvents[s]) events.push(stageEvents[s]);
      }
      setLiveTimeline(events);
    }
  }, [liveStage, activeScenarioIndex, demoMode]);

  // Auto-play steps timer for Walkthrough
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 10) {
            setIsPlaying(false);
            return 10;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectScenario = (index: number) => {
    setActiveScenarioIndex(index);
    setCurrentStep(1);
    setLiveStage(1);
    setIsPlaying(false);
    setIsLivePlaying(false);
  };

  const handleStartLiveDemo = () => {
    setLiveStage(1);
    setIsLivePlaying(true);
  };

  const handleLiveNext = () => {
    if (liveStage < 10) setLiveStage(liveStage + 1);
  };

  const handleLivePrev = () => {
    if (liveStage > 1) setLiveStage(liveStage - 1);
  };

  const handleLiveReset = () => {
    setLiveStage(1);
    setIsLivePlaying(false);
  };

  const handleNextStep = () => {
    if (currentStep < 10) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setIsPlaying(false);
  };

  const handleResolveIssue = () => {
    setResolvedScenarios((prev) => ({ ...prev, [scenario.id]: true }));
  };

  const handleEscalate = () => {
    if (onOpenEscalationModal) {
      onOpenEscalationModal(scenario.ticketId);
    } else {
      alert(`Executive Escalation Packet generated for ${scenario.customerName} (Ticket #${scenario.ticketId}). Handing off with complete historical context.`);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-8 max-w-6xl mx-auto">
      {/* 1. RECALLAI DEMO CENTER BANNER (SECTION 3) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>RECALLAI DEMO CENTER • Bought it once. We'll remember it.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Post-Purchase Support That Remembers
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Experience centralized customer support across Amazon, Flipkart, Meesho, and partner stores. RecallAI remembers purchased products, order numbers, previous troubleshooting, and coordinates seamlessly with human technicians.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenCustomerSupport?.(scenario.customerMessage)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <span>Open in Customer Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {onOpenTechnicianConsole && (
            <button
              onClick={onOpenTechnicianConsole}
              className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Technician Console</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SIX INTERACTIVE DEMO SCENARIOS (SECTION 3 & 26) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Interactive Post-Purchase Scenarios ({SCENARIOS.length})
          </h2>
          <span className="text-[11px] text-slate-400">Click any scenario to test instant memory recall</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {SCENARIOS.map((sc, idx) => {
            const isSelected = activeScenarioIndex === idx;
            const isResolved = resolvedScenarios[sc.id];

            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-blue-600 shadow-md ring-4 ring-blue-500/10'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Scenario {idx + 1}
                    </span>
                    {isResolved && (
                      <span className="flex items-center text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Resolved
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-black text-slate-900 flex items-center space-x-1">
                    <span>{sc.shortTitle}</span>
                  </div>

                  <div className="space-y-0.5 text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase font-bold block">Customer</span>
                      <span className="font-extrabold text-slate-800">{sc.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase font-bold block">Platform</span>
                      <span className="font-medium text-slate-600 truncate block">{sc.organization}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] uppercase font-bold block">Problem</span>
                      <span className="font-semibold text-rose-700 line-clamp-1">{sc.problem}</span>
                    </div>
                  </div>
                </div>

                <div className={`w-full py-1.5 rounded-lg font-black text-[11px] text-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}>
                  {isSelected ? 'Active Scenario' : 'Select'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2B. CONNECTED PLATFORMS INTEGRATION ARCHITECTURE (SECTION 8) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-slate-900">Connected Commerce Platforms</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                DEMO CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              RecallAI acts as an intelligent support layer between connected e-commerce platforms, brand support, and field technicians.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Mock Integration Layer Active</span>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: 'Amazon', order: 'Order #AMZ-78241', product: 'Dell Laptop', count: '1,420 orders synced', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
            { name: 'Flipkart', order: 'Order #FK-98213', product: 'Samsung Smartphone', count: '980 orders synced', color: 'text-blue-800', bg: 'bg-blue-50', border: 'border-blue-200' },
            { name: 'Meesho', order: 'Order #MS-67281', product: 'Wireless Headphones', count: '640 orders synced', color: 'text-pink-800', bg: 'bg-pink-50', border: 'border-pink-200' },
            { name: 'Demo Partner Store', order: 'Order #DPS-44109', product: 'Washing Machine', count: '310 orders synced', color: 'text-indigo-800', bg: 'bg-indigo-50', border: 'border-indigo-200' }
          ].map((platform) => (
            <div
              key={platform.name}
              className={`p-3.5 rounded-2xl border ${platform.border} ${platform.bg} flex flex-col justify-between text-left space-y-2 shadow-2xs`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-black text-xs ${platform.color}`}>{platform.name}</span>
                <span className="inline-flex items-center text-[9px] font-bold text-emerald-700 bg-white/70 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  Demo Connected
                </span>
              </div>
              <div className="text-[11px] text-slate-700">
                <div className="font-bold">{platform.product}</div>
                <div className="font-mono text-[10px] text-slate-500">{platform.order}</div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium border-t border-slate-200/60 pt-1">
                {platform.count}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture flow indicator */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-semibold gap-2">
          <span>Commerce Platform (Webhook / Order Sync)</span>
          <span className="text-slate-400">→</span>
          <span>RecallAI Integration Layer</span>
          <span className="text-slate-400">→</span>
          <span>Product & Warranty Context</span>
          <span className="text-slate-400">→</span>
          <span>AI Memory & Hindsight Engine</span>
          <span className="text-slate-400">→</span>
          <span>Brand Support & Field Technician</span>
          <span className="text-slate-400">→</span>
          <span className="text-blue-700 font-bold">Zero-Repetition Customer Experience</span>
        </div>
      </div>

      {/* 2C. VISUAL COMPARISON: NORMAL CHATBOT VS RECALLAI (SECTION 31) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Normal Chatbot Card */}
        <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h3 className="font-extrabold text-rose-950 text-xs uppercase tracking-wider">
              Normal Chatbot (Starts From Zero)
            </h3>
          </div>
          <div className="space-y-2 text-xs font-mono bg-white p-3 rounded-2xl border border-rose-200 text-slate-700">
            <p><strong className="text-slate-900">Customer:</strong> "My Dell laptop isn't charging."</p>
            <p><strong className="text-rose-600">Bot:</strong> "Which platform did you buy from? What is your order ID?"</p>
            <p><strong className="text-slate-900">Customer:</strong> "Amazon, order AMZ-78241. I already told support last month."</p>
            <p><strong className="text-rose-600">Bot:</strong> "Have you tried adjusting battery power saver settings?"</p>
          </div>
          <p className="text-[11px] text-rose-700 font-bold">❌ Forced repetition. Recommends irrelevant battery settings for charging failure.</p>
        </div>

        {/* RecallAI Card */}
        <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
              RecallAI (Remembers Customer & Products)
            </h3>
          </div>
          <div className="space-y-2 text-xs font-mono bg-white p-3 rounded-2xl border border-emerald-200 text-slate-700">
            <p><strong className="text-slate-900">Customer:</strong> "My laptop is not charging."</p>
            <p><strong className="text-emerald-700">RecallAI:</strong> "Welcome back, Sarah. I found your Dell Laptop from Amazon (Order #AMZ-78241). Your previous battery drain was resolved via settings. For this new charging issue, let's verify if the adapter LED lights up."</p>
          </div>
          <p className="text-[11px] text-emerald-700 font-bold">✓ Zero repetition. Recognizes purchase, warranty, and avoids repeating past steps.</p>
        </div>
      </div>

      {/* 2. DEMO MODE TOGGLE: SECTION 25 LIVE SIMULATOR vs 10-STEP COGNITIVE WALKTHROUGH */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setDemoMode('live')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all ${
              demoMode === 'live'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>⚡ LIVE SCENARIO LOOP (Section 25)</span>
          </button>

          <button
            onClick={() => setDemoMode('walkthrough')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
              demoMode === 'walkthrough'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <span>📋 10-STEP COGNITIVE PIPELINE</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium px-2">
          {demoMode === 'live'
            ? 'Interactive 3-Way Customer ↔ RecallAI ↔ Technician execution loop'
            : 'Step-by-step cognitive transparency breakdown'}
        </div>
      </div>

      {/* SECTION 25: LIVE REAL-TIME DEMO VIEW */}
      {demoMode === 'live' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header & Live Playback Control Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  LIVE REAL-TIME SCENARIO (Section 25)
                </span>
                <span className="text-xs font-black text-slate-900">
                  • Stage {liveStage} of 10
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>{scenario.shortTitle}</span>
                <span className="text-xs font-bold text-slate-500">
                  (Customer: {scenario.customerName} • Ticket #{scenario.ticketId})
                </span>
              </h3>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={handleLivePrev}
                disabled={liveStage === 1}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Stage"
              >
                <ArrowLeft className="w-4 h-4 text-slate-700" />
              </button>

              <button
                onClick={() => {
                  if (isLivePlaying) {
                    setIsLivePlaying(false);
                  } else {
                    handleStartLiveDemo();
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md transition-all ${
                  isLivePlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isLivePlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Simulation</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START LIVE DEMO</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLiveNext}
                disabled={liveStage === 10}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Stage"
              >
                <ArrowRight className="w-4 h-4 text-slate-700" />
              </button>

              <button
                onClick={handleLiveReset}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {onOpenTechnicianConsole && (
                <button
                  onClick={onOpenTechnicianConsole}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Technician Console</span>
                </button>
              )}
            </div>
          </div>

          {/* Stage Progress Pills */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {[
              '1. Message',
              '2. RecallAI',
              '3. Retrieval',
              '4. Tech Joins',
              '5. Customer Info',
              '6. New Memory',
              '7. Diagnostic',
              '8. Resolution',
              '9. Write Memory',
              '10. Verified'
            ].map((label, idx) => {
              const stageNum = idx + 1;
              const isDone = stageNum < liveStage;
              const isCur = stageNum === liveStage;
              return (
                <button
                  key={stageNum}
                  onClick={() => {
                    setLiveStage(stageNum);
                    setIsLivePlaying(false);
                  }}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center truncate transition-all ${
                    isCur
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Main 2-Column Live Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: Live 3-Way Conversation Simulation (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 shadow-inner min-h-[460px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-extrabold text-white">3-WAY REAL-TIME CONVERSATION</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Channel: ws/live/{scenario.customerName.toLowerCase()}</span>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
                {/* Stage 1: Customer initial message */}
                {liveStage >= 1 && (
                  <div className="flex items-start space-x-2.5 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {scenario.customerName[0]}
                    </div>
                    <div className="max-w-[85%] bg-blue-600/20 border border-blue-500/30 rounded-2xl p-3.5 text-xs text-white space-y-1">
                      <div className="flex items-center justify-between space-x-2">
                        <span className="font-bold text-blue-300">{scenario.customerName} (Customer)</span>
                        <span className="text-[10px] text-slate-400">10:02 AM</span>
                      </div>
                      <p className="font-medium text-slate-100">"{scenario.customerMessage}"</p>
                    </div>
                  </div>
                )}

                {/* Stage 2 & 3: RecallAI Instant Grounded Response */}
                {liveStage >= 2 && (
                  <div className="flex items-start space-x-2.5 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] bg-slate-900 border border-indigo-500/40 rounded-2xl p-3.5 text-xs text-white space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                          <span>RecallAI Support Agent</span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                            ⚡ 0.8s Instant Recall
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400">10:02 AM</span>
                      </div>
                      <p className="font-medium text-slate-200 whitespace-pre-line leading-relaxed">
                        {scenario.aiResponse}
                      </p>
                      {liveStage >= 3 && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 text-[10px] text-amber-300 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Zero-Repetition Enforcement: Ruled out {scenario.failedSolutions.join(' & ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stage 4: Technician Joins */}
                {liveStage >= 4 && (
                  <div className="flex items-center justify-center my-2 animate-fade-in">
                    <div className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[11px] font-bold flex items-center space-x-2 shadow-sm">
                      <Wrench className="w-3.5 h-3.5 text-purple-400" />
                      <span>{scenario.techJoinMessage}</span>
                    </div>
                  </div>
                )}

                {/* Stage 5: Customer follow up */}
                {liveStage >= 5 && (
                  <div className="flex items-start space-x-2.5 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      {scenario.customerName[0]}
                    </div>
                    <div className="max-w-[85%] bg-blue-600/20 border border-blue-500/30 rounded-2xl p-3.5 text-xs text-white space-y-1">
                      <div className="flex items-center justify-between space-x-2">
                        <span className="font-bold text-blue-300">{scenario.customerName}</span>
                        <span className="text-[10px] text-slate-400">10:04 AM</span>
                      </div>
                      <p className="font-medium text-slate-100">"{scenario.customerFollowUp}"</p>
                    </div>
                  </div>
                )}

                {/* Stage 6: NEW MEMORY DETECTED */}
                {liveStage >= 6 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-2 animate-pulse shadow-md">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-black text-amber-300 uppercase text-[10px] block">
                          🧠 NEW MEMORY DETECTED (Auto-Extracted)
                        </span>
                        <span className="font-semibold text-white">{scenario.newMemoryDetected}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase shrink-0">
                      Auto Staged
                    </span>
                  </div>
                )}

                {/* Stage 7: Technician Diagnostic Execution */}
                {liveStage >= 7 && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-purple-500/40 font-mono text-[11px] text-slate-300 space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-purple-400 font-bold">
                      <span className="flex items-center space-x-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Technician Live Diagnostic Output</span>
                      </span>
                      <span className="text-emerald-400 font-normal">Exit Code: 0 (MATCH)</span>
                    </div>
                    <div className="text-slate-400">&gt; telemetry_inspect --ticket #{scenario.ticketId} --depth root_cause</div>
                    <div className="text-emerald-300 font-semibold">{scenario.diagnosticResult}</div>
                  </div>
                )}

                {/* Stage 8: Technician Resolution */}
                {liveStage >= 8 && (
                  <div className="flex items-start space-x-2.5 animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div className="max-w-[85%] bg-purple-950/40 border border-purple-500/40 rounded-2xl p-3.5 text-xs text-white space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300">{scenario.techName}</span>
                        <span className="text-[10px] text-slate-400">10:06 AM</span>
                      </div>
                      <p className="font-medium text-slate-200">{scenario.resolutionText}</p>
                    </div>
                  </div>
                )}

                {/* Stage 9 & 10: RecallAI Saves Verified Memory & Close Case */}
                {liveStage >= 9 && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 space-y-1.5 animate-fade-in">
                    <div className="flex items-center space-x-2 font-black text-emerald-300 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>✓ VERIFIED RESOLUTION WRITTEN TO SQLITE CUSTOMER MEMORY</span>
                    </div>
                    <p className="text-slate-200 font-mono text-[11px] pl-6">
                      {scenario.storedResolution}
                    </p>
                    {liveStage >= 10 && (
                      <div className="pt-2 border-t border-emerald-800/60 text-[11px] text-emerald-400 flex items-center justify-between">
                        <span>Status: Closed with Verified Memory</span>
                        <span className="font-bold">Repetition Count: 0</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Simulator Status Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Participant Sockets: 3 Connected</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {liveStage === 10 ? 'Case Successfully Resolved' : `Simulating Stage ${liveStage}...`}
                </span>
              </div>
            </div>

            {/* RIGHT: Real-Time Cognitive Memory Monitor (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* 1. Grounded Context Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  1. GROUNDED CUSTOMER CONTEXT
                </span>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Customer:</span>
                    <span className="font-bold text-slate-900">{scenario.customerName} ({scenario.organization})</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Environment:</span>
                    <span className="font-mono text-slate-700 text-[11px]">{scenario.environment}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Active Ticket:</span>
                    <span className="font-bold text-blue-600">#{scenario.ticketId}</span>
                  </div>
                </div>
              </div>

              {/* 2. Zero-Repetition Ruled-Out Guard */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center space-x-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                  <span>2. ZERO-REPETITION RULED-OUT STEPS</span>
                </span>
                <div className="space-y-1.5 text-xs">
                  {scenario.failedSolutions.map((fail, fIdx) => (
                    <div key={fIdx} className="flex items-center space-x-2 text-rose-900 line-through decoration-rose-500 font-medium">
                      <span className="w-3.5 h-3.5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-[9px] font-black shrink-0">
                        ✕
                      </span>
                      <span>{fail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Live Chronological Timeline */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  3. REAL-TIME CASE TIMELINE
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {liveTimeline.map((item, tIdx) => (
                    <div key={tIdx} className="text-[11px] flex items-start space-x-2 text-slate-700 animate-fade-in">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Action Hand-off Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => onOpenCustomerSupport?.(scenario.customerMessage)}
                  className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Open in Live Chat</span>
                </button>

                {onOpenTechnicianConsole && (
                  <button
                    onClick={onOpenTechnicianConsole}
                    className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Wrench className="w-3.5 h-3.5 text-purple-600" />
                    <span>Open Technician</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 10-STEP INTERACTIVE WALKTHROUGH (SECTION 13) */}
      {demoMode === 'walkthrough' && (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Playbar Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                {currentStep}
              </span>
              <h3 className="text-base font-black text-slate-900">
                10-Step Interactive Walkthrough
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrating the exact RecallAI cognitive memory pipeline for <strong>{scenario.customerName}</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Step"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Auto Walkthrough</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === 10}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Step"
            >
              <ArrowRight className="w-4 h-4 text-slate-700" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Numbers Grid */}
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
            const isCompleted = num < currentStep;
            const isCurrent = num === currentStep;
            return (
              <button
                key={num}
                onClick={() => setCurrentStep(num)}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                Step {num}
              </button>
            );
          })}
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="min-h-[300px] bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-center">
          {/* STEP 1: CUSTOMER MESSAGE */}
          {currentStep === 1 && (
            <div className="space-y-4 max-w-lg mx-auto text-center animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                STEP 1
              </span>
              <h4 className="text-xl font-black text-slate-900 uppercase">
                CUSTOMER MESSAGE
              </h4>
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-left space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">{scenario.customerName}:</div>
                <div className="text-base font-black text-slate-900 p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                  "{scenario.customerMessage}"
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: 🔍 Identifying customer... */}
          {currentStep === 2 && (
            <div className="space-y-4 max-w-md mx-auto text-center animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                STEP 2
              </span>
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center animate-bounce shadow-lg ring-8 ring-indigo-100">
                <Search className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                🔍 Identifying customer...
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Matching incoming session token with persistent enterprise tenant registry...
              </p>
            </div>
          )}

          {/* STEP 3: CUSTOMER FOUND */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-lg mx-auto text-center animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                STEP 3
              </span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase">
                CUSTOMER FOUND
              </h4>
              <div className="p-4 rounded-xl bg-white border border-emerald-200 text-center space-y-1">
                <div className="text-base font-black text-slate-900">{scenario.customerName}</div>
                <div className="text-xs font-semibold text-slate-500">{scenario.organization}</div>
              </div>
            </div>
          )}

          {/* STEP 4: 🧠 Searching customer memory... */}
          {currentStep === 4 && (
            <div className="space-y-4 max-w-md mx-auto text-center animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
                STEP 4
              </span>
              <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white mx-auto flex items-center justify-center animate-pulse shadow-lg ring-8 ring-purple-100">
                <Brain className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                🧠 Searching customer memory...
              </h4>
              <p className="text-xs text-slate-500">
                Scanning historical ticket graphs, previous resolutions, and failed attempts.
              </p>
            </div>
          )}

          {/* STEP 5: RELEVANT MEMORY FOUND */}
          {currentStep === 5 && (
            <div className="space-y-4 max-w-lg mx-auto animate-fade-in">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                  STEP 5
                </span>
                <h4 className="text-lg font-black text-slate-900 uppercase">
                  RELEVANT MEMORY FOUND
                </h4>
              </div>

              <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800">
                <div className="flex items-center space-x-2 text-emerald-700 p-2 bg-emerald-50 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                  <span>Previous ticket (Ticket #{scenario.ticketId})</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-700 p-2 bg-blue-50 rounded-xl">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 font-bold" />
                  <span>Previous conversation</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-700 p-2 bg-emerald-50 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                  <span>Previous solution ({scenario.workedSolution})</span>
                </div>
                <div className="flex items-center space-x-2 text-rose-700 p-2 bg-rose-50 rounded-xl">
                  <Check className="w-4 h-4 text-rose-600 shrink-0 font-bold" />
                  <span>Failed attempt ({scenario.failedSolutions[0]})</span>
                </div>
                <div className="flex items-center space-x-2 text-indigo-700 p-2 bg-indigo-50 rounded-xl">
                  <Check className="w-4 h-4 text-indigo-600 shrink-0 font-bold" />
                  <span>Current environment ({scenario.environment})</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: HINDSIGHT */}
          {currentStep === 6 && (
            <div className="space-y-4 max-w-xl mx-auto animate-fade-in text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                STEP 6
              </span>
              <h4 className="text-lg font-black text-slate-900 uppercase">
                HINDSIGHT
              </h4>
              <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs space-y-3 text-left">
                <div className="text-amber-950 font-black text-sm">
                  "This issue has happened before."
                </div>
                <p className="text-slate-800 leading-relaxed font-semibold">
                  {scenario.hindsightInsight}
                </p>
              </div>
            </div>
          )}

          {/* STEP 7: RECALLAI RESPONSE */}
          {currentStep === 7 && (
            <div className="space-y-4 max-w-xl mx-auto animate-fade-in">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                  STEP 7
                </span>
                <h4 className="text-lg font-black text-slate-900 uppercase">
                  RECALLAI RESPONSE
                </h4>
              </div>

              <div className="p-5 rounded-2xl bg-blue-950 text-white text-xs space-y-2.5 shadow-md border border-blue-800">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block pb-2 border-b border-blue-900">
                  Personalized AI Response
                </span>
                <div className="whitespace-pre-line leading-relaxed text-slate-200 font-medium">
                  {scenario.aiResponse}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: WHY THIS RESPONSE? */}
          {currentStep === 8 && (
            <div className="space-y-4 max-w-xl mx-auto animate-fade-in">
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  STEP 8
                </span>
                <h4 className="text-lg font-black text-slate-900 uppercase">
                  WHY THIS RESPONSE?
                </h4>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 text-center font-bold">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900">
                  Previous ticket (#{scenario.ticketId})
                </div>
                <div className="text-slate-400 font-black">+</div>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900">
                  Previous solution ({scenario.workedSolution})
                </div>
                <div className="text-slate-400 font-black">+</div>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-900">
                  Failed attempt ({scenario.failedSolutions[0]})
                </div>
                <div className="text-slate-400 font-black">+</div>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-900">
                  Current issue ({scenario.problem})
                </div>
                <div className="text-slate-400 font-black">=</div>
                <div className="p-3 rounded-xl bg-emerald-600 text-white font-black text-sm">
                  Personalized response
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: NEXT ACTION */}
          {currentStep === 9 && (
            <div className="space-y-4 max-w-lg mx-auto text-center animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                STEP 9
              </span>
              <h4 className="text-lg font-black text-slate-900 uppercase">
                NEXT ACTION
              </h4>

              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-xs space-y-2">
                <div className="text-base font-black text-emerald-950">
                  "{scenario.nextAction}"
                </div>
                <p className="text-emerald-800 font-medium">
                  Direct action formulated without asking the customer to repeat any previous troubleshooting steps.
                </p>
              </div>
            </div>
          )}

          {/* STEP 10: [ Resolve ] or [ Escalate ] */}
          {currentStep === 10 && (
            <div className="space-y-5 max-w-lg mx-auto text-center animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                STEP 10
              </span>
              <h4 className="text-xl font-black text-slate-900 uppercase">
                DISPOSITION
              </h4>
              <p className="text-xs text-slate-500">
                Choose the operational completion action:
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleResolveIssue}
                  className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex flex-col items-center justify-center space-y-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Resolve</span>
                  <span className="text-[10px] font-normal text-emerald-100">Log memory & close loop</span>
                </button>

                <button
                  onClick={handleEscalate}
                  className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex flex-col items-center justify-center space-y-2"
                >
                  <AlertOctagon className="w-6 h-6" />
                  <span>Escalate</span>
                  <span className="text-[10px] font-normal text-rose-100">Send Zero-Repeat Brief</span>
                </button>
              </div>

              {resolvedScenarios[scenario.id] && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 animate-fade-in">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Demonstration complete! Issue marked Resolved with 0 questions repeated.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {/* 4. FINAL SCREEN (SECTION 22) */}
      <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            The Fundamental Shift
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            THE DIFFERENCE
          </h2>
        </div>

        {/* Without RecallAI vs With RecallAI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-rose-500/30 text-xs space-y-3">
            <span className="text-[11px] font-black uppercase text-rose-400 tracking-wider block">
              WITHOUT RECALLAI
            </span>
            <p className="text-lg font-bold text-rose-200 italic">
              "Can you explain your problem again?"
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 text-xs space-y-3">
            <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider block">
              WITH RECALLAI
            </span>
            <p className="text-lg font-bold text-emerald-200 italic">
              "I remember what happened last time."
            </p>
          </div>
        </div>

        {/* Four Confidence Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-emerald-400 font-extrabold text-sm block">"I know what worked."</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-rose-400 font-extrabold text-sm block">"I know what failed."</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-blue-400 font-extrabold text-sm block">"I understand what is happening now."</span>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-amber-400 font-extrabold text-sm block">"I know what should happen next."</span>
          </div>
        </div>

        {/* Final Statement */}
        <div className="pt-6 border-t border-white/10 text-center space-y-2">
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
            RECALL<span className="text-blue-500">AI</span>
          </div>
          <div className="text-sm font-semibold text-slate-300">
            Customer Support That Remembers.
          </div>
          <p className="text-base font-extrabold text-blue-400">
            "Don't make customers repeat their story."
          </p>
          <div className="text-xs text-slate-400 font-medium pt-2">
            "Normal AI remembers conversations. RecallAI remembers customers."
          </div>
        </div>
      </div>
    </div>
  );
};
