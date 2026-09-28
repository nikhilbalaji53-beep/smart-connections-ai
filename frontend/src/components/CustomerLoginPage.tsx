import React, { useState } from 'react';
import { Brain, ArrowRight, User } from 'lucide-react';

interface CustomerLoginPageProps {
  onLoginSuccess: (email: string) => void;
  onOpenSupportConsole?: () => void;
}

export const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({
  onLoginSuccess,
  onOpenSupportConsole
}) => {
  const [email, setEmail] = useState('marcus.vance@contoso.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(email || 'marcus.vance@contoso.com');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-white shadow-lg ring-4 ring-blue-500/20">
            <Brain className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            RECALL<span className="text-blue-500">AI</span>
          </h1>
          <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">
            Customer Support That Remembers
          </p>
          <p className="text-xs text-slate-400">
            Sign in to access your persistent, zero-repetition support portal.
          </p>
        </div>

        {/* Login Form (Section 1) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Continue with Microsoft */}
        <div>
          <button
            type="button"
            onClick={() => onLoginSuccess('marcus.vance@contoso.com')}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
              <div className="bg-[#f25022]"></div>
              <div className="bg-[#7fba00]"></div>
              <div className="bg-[#00a4ef]"></div>
              <div className="bg-[#ffb900]"></div>
            </div>
            <span>Continue with Microsoft</span>
          </button>
        </div>

        {/* 1-Click Demo Customer Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onLoginSuccess('marcus.vance@contoso.com')}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black tracking-wide shadow-md flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01]"
          >
            <User className="w-4 h-4" />
            <span>Continue as Demo Customer</span>
          </button>
        </div>

        {/* Switch to Support Console */}
        {onOpenSupportConsole && (
          <div className="text-center pt-2 text-xs text-slate-500">
            <span>Are you a support agent? </span>
            <button
              type="button"
              onClick={onOpenSupportConsole}
              className="text-blue-400 font-bold hover:underline"
            >
              Open Support Console
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
