import React from 'react';
import {
  MessageSquare,
  LayoutDashboard,
  UserCheck,
  FileText,
  BookOpen,
  Clock,
  AlertOctagon,
  BarChart3,
  Sparkles,
  Layers,
  Brain,
  History,
  Settings,
  Wrench,
  Headphones,
  Split,
  X
} from 'lucide-react';

export type NavView =
  | 'customer_chat'
  | 'support_console'
  | 'dual_view'
  | 'support'
  | 'judge'
  | 'dashboard'
  | 'technicians'
  | 'customer360'
  | 'tickets'
  | 'timeline'
  | 'hindsight'
  | 'kb'
  | 'escalations'
  | 'analytics'
  | 'features'
  | 'comparison'
  | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  openTicketsCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  openTicketsCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'customer_chat', label: 'Customer Chat', icon: MessageSquare, badge: 'Route 1' },
    { id: 'support_console', label: 'Support Console', icon: Headphones, badge: 'Route 2' },
    { id: 'technicians', label: 'Technician Console', icon: Wrench, badge: 'Route 3' },
    { id: 'dual_view', label: 'Dual Live View', icon: Split, badge: 'Side-by-Side' },
    { id: 'judge', label: 'Judge Demo', icon: Sparkles, badge: 'Interactive', isJudge: true },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customer360', label: 'Customers', icon: UserCheck },
    { id: 'tickets', label: 'Tickets', icon: FileText, badge: openTicketsCount },
    { id: 'timeline', label: 'Customer Memory', icon: Clock },
    { id: 'hindsight', label: 'Hindsight', icon: History, badge: 'Core' },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'escalations', label: 'Escalations', icon: AlertOctagon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'features', label: 'Main Features', icon: Sparkles },
    { id: 'comparison', label: 'Why Normal AI Fails', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (viewId: NavView) => {
    onNavigate(viewId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <>
      {/* Brand Subtitle Header */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight">RecallAI Suite</span>
            <span className="block text-[10px] text-slate-400 font-medium">Enterprise Memory Platform</span>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 md:hidden"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as NavView)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? item.id === 'judge'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md'
                    : 'bg-blue-600 text-white font-semibold shadow-xs'
                  : item.id === 'judge'
                  ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? item.id === 'judge' ? 'text-slate-950' : 'text-white'
                    : item.id === 'judge' ? 'text-amber-400' : 'text-slate-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive
                    ? item.id === 'judge' ? 'bg-slate-950 text-amber-300' : 'bg-blue-800 text-white'
                    : item.id === 'judge' ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Professional Taglines */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/60">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center">
            <Brain className="w-3 h-3 mr-1" />
            AI That Remembers
          </div>
          <p className="text-[11px] text-slate-300 font-medium leading-snug">
            "Past issues. Real context.<br />Better support."
          </p>
          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
            Don't make customers repeat their story.
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Only visible on md screens and larger) */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-slate-300 flex-col shrink-0 border-r border-slate-900 select-none">
        {navContent}
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-950 text-slate-300 flex flex-col border-r border-slate-900 select-none shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};

