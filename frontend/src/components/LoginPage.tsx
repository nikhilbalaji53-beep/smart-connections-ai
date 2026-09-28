import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  CheckCircle2,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onDemoLogin: (role?: 'customer' | 'technician' | 'agent' | 'judge' | 'dual' | 'demo') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onDemoLogin }) => {
  const [email, setEmail] = useState('demo@recallai.ai');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email || 'demo@recallai.ai');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: BRAND STORY & ANIMATED FLOW (7 Columns) */}
        <div className="lg:col-span-7 p-8 sm:p-12 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg ring-2 ring-blue-400/30">
                <Brain className="w-6 h-6 animate-pulse-subtle" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white">
                  Recall<span className="text-blue-500">AI</span>
                </span>
                <span className="block text-[11px] text-blue-300 font-semibold tracking-wide">
                  The Post-Purchase Support Platform
                </span>
              </div>
            </div>

            {/* Tagline */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              "Bought it once. We'll remember it."
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-lg">
              Centralized AI customer-support for products purchased from connected commerce platforms (Amazon, Flipkart, Meesho, and partner stores). Customers never have to repeat their story or search for order numbers.
            </p>

            {/* Visual Value Flow Animation Representation */}
            <div className="mt-8 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 backdrop-blur-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-300 block">
                The RecallAI Architecture:
              </span>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-blue-900/40 border border-blue-400/20 text-white flex flex-col items-center">
                  <UserCheck className="w-5 h-5 text-blue-400 mb-1" />
                  <span className="font-bold text-[11px]">Customer</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-900/40 border border-indigo-400/20 text-white flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 mb-1" />
                  <span className="font-bold text-[11px]">Memory</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-900/40 border border-purple-400/20 text-white flex flex-col items-center">
                  <Brain className="w-5 h-5 text-purple-400 mb-1" />
                  <span className="font-bold text-[11px]">AI Reasoning</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-400/20 text-white flex flex-col items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
                  <span className="font-bold text-[11px]">Better Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Microsoft AI Hackathon Edition</span>
            <span className="flex items-center text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Zero-Repetition Engine
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: ENTERPRISE LOGIN FORM (5 Columns) */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-white tracking-tight">SIGN IN</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Enterprise Access</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-blue-400 hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Microsoft Entra ID Login Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => onDemoLogin('agent')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                {/* Microsoft 4-square logo */}
                <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                  <div className="bg-[#f25022]"></div>
                  <div className="bg-[#7fba00]"></div>
                  <div className="bg-[#00a4ef]"></div>
                  <div className="bg-[#ffb900]"></div>
                </div>
                <span>Continue with Microsoft Entra ID</span>
              </button>
            </div>

            {/* Role Determination Selection (Section 2) */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Select Role to Enter RecallAI:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onDemoLogin('customer')}
                  className="p-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all text-center cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDemoLogin('agent')}
                  className="p-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all text-center cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Support Agent</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDemoLogin('technician')}
                  className="p-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all text-center cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Technician</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDemoLogin('dual')}
                  className="p-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all text-center cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Admin / Dual</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onDemoLogin('demo')}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl text-xs font-black tracking-wide shadow-md flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>✨ Launch Demo Experience</span>
              </button>
            </div>

            {/* Demo Credentials Helper Box */}
            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
              <span className="font-bold text-slate-300 block mb-0.5">Demo Credentials (Pre-filled):</span>
              <div className="font-mono text-slate-400 flex justify-between">
                <span>Email: <strong className="text-blue-400">demo@recallai.ai</strong></span>
                <span>Pass: <strong className="text-blue-400">demo123</strong></span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>New to RecallAI? </span>
            <a href="#create" onClick={(e) => { e.preventDefault(); onDemoLogin(); }} className="text-blue-400 font-bold hover:underline">
              Create Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
