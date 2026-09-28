import React, { useEffect, useState } from 'react';
import type { Customer, EscalationSummary } from '../types';
import { api } from '../services/api';
import {
  X,
  AlertTriangle,
  UserCheck,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  ticketId?: number;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  customer,
  ticketId
}) => {
  const [summary, setSummary] = useState<EscalationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSummary();
    }
  }, [isOpen, customer.id, ticketId]);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const data = await api.getEscalationSummary(customer.id, ticketId);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load escalation summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (summary) {
      navigator.clipboard.writeText(summary.raw_markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Smart Escalation Handoff Brief</h3>
              <p className="text-[11px] text-blue-200">Zero-Repetition AI Case Summary for Tier-3 Specialist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Assembling persistent customer history and ruled-out troubleshooting...</span>
            </div>
          ) : summary ? (
            <>
              {/* Customer & Environment Snapshot */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{summary.customer_name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    {summary.organization} ({summary.tier})
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Environment:</strong> {summary.environment_snapshot}
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Frustration Level:</strong> <span className="text-rose-600 font-bold">{summary.frustration_level}</span>
                </div>
              </div>

              {/* Current Issue */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Current Issue</span>
                <p className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                  {summary.current_issue}
                </p>
              </div>

              {/* Ruled Out Attempts */}
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600 block mb-1">
                  Previous Troubleshooting Attempts (DO NOT ASK CUSTOMER TO REPEAT)
                </span>
                <div className="space-y-1.5">
                  {summary.previous_attempts.map((att, i) => (
                    <div key={i} className="p-2 rounded bg-rose-50 border border-rose-100 text-rose-900 text-[11px] flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mr-2 shrink-0" />
                      <span>{att}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Tickets */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Related Prior Tickets</span>
                <div className="flex flex-wrap gap-1.5">
                  {summary.related_tickets.map((tId) => (
                    <span key={tId} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px] font-bold">
                      #{tId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <span className="font-bold block mb-0.5">Recommended Next Action for Tier-3 Engineer:</span>
                <p className="text-slate-700">{summary.recommended_next_action}</p>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Failed to load escalation summary.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1" />
            Zero-Repetition Protocol Enforced
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={!summary}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
