import React, { useState, useEffect } from 'react';
import type { Customer, Ticket, MemoryTimelineEvent, KnowledgeArticle, DemoScenario } from './types';
import { api } from './services/api';
import { TopNav } from './components/TopNav';
import { CustomerProfileBanner } from './components/CustomerProfileBanner';
import { Sidebar } from './components/Sidebar';
import type { NavView } from './components/Sidebar';
import { CustomerSupportView } from './components/CustomerSupportView';
import { Customer360View } from './components/Customer360View';
import { MainFeaturesView } from './components/MainFeaturesView';
import { ComparisonView } from './components/ComparisonView';
import { AgentDashboard } from './components/AgentDashboard';
import { EscalationModal } from './components/EscalationModal';
import { LoginPage } from './components/LoginPage';
import { WelcomeHub } from './components/WelcomeHub';
import { JudgeDemoView } from './components/JudgeDemoView';
import { HindsightView } from './components/HindsightView';
import { TechnicianConsole } from './components/TechnicianConsole';
import { CustomerChatView } from './components/CustomerChatView';
import { SupportConsoleView } from './components/SupportConsoleView';
import { DualSplitView } from './components/DualSplitView';
import { UniversalKnowledgeModal } from './components/UniversalKnowledgeModal';
import type { UserRole } from './components/TopNav';

export const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [timeline, setTimeline] = useState<MemoryTimelineEvent[]>([]);
  const [kbArticles, setKbArticles] = useState<KnowledgeArticle[]>([]);
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  
  // Auth & View States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcomeHub, setShowWelcomeHub] = useState(true);
  const [currentView, setCurrentView] = useState<NavView>('support');
  const [currentRole, setCurrentRole] = useState<UserRole>('agent');
  
  const [presetPrompt, setPresetPrompt] = useState<string | undefined>(undefined);
  const [isResetting, setIsResetting] = useState(false);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [escalationTicketId, setEscalationTicketId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initApp();

    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h.includes('customer')) {
        setIsLoggedIn(true);
        setCurrentRole('customer');
        setCurrentView('customer_chat');
        setShowWelcomeHub(false);
      } else if (h.includes('support')) {
        setIsLoggedIn(true);
        setCurrentRole('agent');
        setCurrentView('support_console');
        setShowWelcomeHub(false);
      } else if (h.includes('technician')) {
        setIsLoggedIn(true);
        setCurrentRole('technician');
        setCurrentView('technicians');
        setShowWelcomeHub(false);
      } else if (h.includes('dual')) {
        setIsLoggedIn(true);
        setCurrentRole('dual');
        setCurrentView('dual_view');
        setShowWelcomeHub(false);
      } else if (h.includes('judge') || h.includes('demo')) {
        setIsLoggedIn(true);
        setCurrentView('judge');
        setShowWelcomeHub(false);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const initApp = async () => {
    setIsLoading(true);
    try {
      const [custList, scList, kbList] = await Promise.all([
        api.getCustomers(),
        api.getDemoScenarios(),
        api.getKnowledgeArticles()
      ]);
      setCustomers(custList);
      setScenarios(scList);
      setKbArticles(kbList);

      if (custList.length > 0) {
        const marcus = custList.find(c => c.id === 'cust_marcus') || custList[0];
        setActiveCustomer(marcus);
        await loadCustomerDetails(marcus.id);
      }
    } catch (err) {
      console.error('Failed to initialize RecallAI:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      const [tList, tLine] = await Promise.all([
        api.getTickets(customerId),
        api.getMemoryTimeline(customerId)
      ]);
      setTickets(tList);
      setTimeline(tLine);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    }
  };

  const handleSelectCustomer = async (cust: Customer) => {
    setActiveCustomer(cust);
    await loadCustomerDetails(cust.id);
  };

  const handleSelectScenario = async (scenario: DemoScenario) => {
    const cust = customers.find(c => c.id === scenario.customer_id);
    if (cust) {
      setActiveCustomer(cust);
      await loadCustomerDetails(cust.id);
    }
    setShowWelcomeHub(false);
    setCurrentView('support');
    setPresetPrompt(scenario.prompt);
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      await initApp();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenEscalation = (ticketId?: number) => {
    setEscalationTicketId(ticketId);
    setEscalationModalOpen(true);
  };

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    setShowWelcomeHub(false);
    if (role === 'customer') {
      window.location.hash = '/customer';
      setCurrentView('customer_chat');
    } else if (role === 'agent') {
      window.location.hash = '/support';
      setCurrentView('support_console');
    } else if (role === 'technician') {
      window.location.hash = '/technician';
      setCurrentView('technicians');
    } else if (role === 'dual') {
      window.location.hash = '/dual';
      setCurrentView('dual_view');
    }
  };

  const handleWelcomeOption = (option: 'support' | 'dashboard' | 'judge') => {
    setShowWelcomeHub(false);
    if (option === 'support') {
      setCurrentRole('customer');
      window.location.hash = '/customer';
      setCurrentView('customer_chat');
    } else if (option === 'dashboard') {
      setCurrentRole('agent');
      window.location.hash = '/support';
      setCurrentView('support_console');
    } else if (option === 'judge') {
      setCurrentView('judge');
    }
  };

  // 1. LOADING SCREEN
  if (isLoading || !activeCustomer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse shadow-lg ring-4 ring-blue-500/20">
          <span className="font-extrabold text-xl">R</span>
        </div>
        <div className="text-sm font-bold tracking-tight text-slate-300">
          Loading RecallAI Enterprise Memory Suite...
        </div>
      </div>
    );
  }

  // 2. AUTH SCREEN (ENTERPRISE LOGIN / MICROSOFT ENTRA ID)
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setIsLoggedIn(true);
          setShowWelcomeHub(true);
        }}
        onDemoLogin={(role) => {
          setIsLoggedIn(true);
          if (role === 'customer') {
            setCurrentRole('customer');
            setShowWelcomeHub(false);
            window.location.hash = '/customer';
            setCurrentView('customer_chat');
          } else if (role === 'technician') {
            setCurrentRole('technician');
            setShowWelcomeHub(false);
            window.location.hash = '/technician';
            setCurrentView('technicians');
          } else if (role === 'dual') {
            setCurrentRole('dual');
            setShowWelcomeHub(false);
            window.location.hash = '/dual';
            setCurrentView('dual_view');
          } else if (role === 'judge' || role === 'demo') {
            setShowWelcomeHub(false);
            setCurrentView('judge');
          } else {
            setCurrentRole('agent');
            setShowWelcomeHub(false);
            window.location.hash = '/support';
            setCurrentView('support_console');
          }
        }}
      />
    );
  }

  const activeTicket = tickets.find(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Investigating') || tickets[0] || null;

  // ROUTE 1: PURE CUSTOMER CHAT (No internal dashboard leakage per Section 1, 2, 21, 24)
  if (currentRole === 'customer' || currentView === 'customer_chat') {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
        <TopNav
          customers={customers}
          activeCustomer={activeCustomer}
          onSelectCustomer={handleSelectCustomer}
          scenarios={scenarios}
          onSelectScenario={handleSelectScenario}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenWelcomeHub={() => setShowWelcomeHub(true)}
          onOpenKnowledgeTrainer={() => setKnowledgeModalOpen(true)}
          onOpenJudgeDemo={() => {
            setShowWelcomeHub(false);
            setCurrentView('judge');
          }}
          currentRole={currentRole}
          onSelectRole={handleRoleSelect}
        />
        <div className="flex-1 flex overflow-hidden">
          <CustomerChatView
            customer={activeCustomer}
            activeTicket={activeTicket}
            onOpenSupportAgent={() => handleRoleSelect('agent')}
          />
        </div>
        <UniversalKnowledgeModal
          isOpen={knowledgeModalOpen}
          onClose={() => setKnowledgeModalOpen(false)}
        />
      </div>
    );
  }

  // DUAL VIEW: REAL-TIME SYNCHRONIZED SIDE-BY-SIDE (Customer on Left, Support on Right)
  if (currentView === 'dual_view' || currentRole === 'dual') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
        <TopNav
          customers={customers}
          activeCustomer={activeCustomer}
          onSelectCustomer={handleSelectCustomer}
          scenarios={scenarios}
          onSelectScenario={handleSelectScenario}
          onResetDemo={handleResetDemo}
          isResetting={isResetting}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenWelcomeHub={() => setShowWelcomeHub(true)}
          onOpenKnowledgeTrainer={() => setKnowledgeModalOpen(true)}
          onOpenJudgeDemo={() => {
            setShowWelcomeHub(false);
            setCurrentView('judge');
          }}
          currentRole={currentRole}
          onSelectRole={handleRoleSelect}
        />
        <div className="flex-1 flex overflow-hidden">
          <DualSplitView
            customer={activeCustomer}
            tickets={tickets}
            onOpenCustomerOnly={() => handleRoleSelect('customer')}
            onOpenSupportOnly={() => handleRoleSelect('agent')}
            onOpenTechnicianConsole={() => handleRoleSelect('technician')}
          />
        </div>
        <UniversalKnowledgeModal
          isOpen={knowledgeModalOpen}
          onClose={() => setKnowledgeModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* 1. TOP NAVIGATION */}
      <TopNav
        customers={customers}
        activeCustomer={activeCustomer}
        onSelectCustomer={handleSelectCustomer}
        scenarios={scenarios}
        onSelectScenario={handleSelectScenario}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenWelcomeHub={() => setShowWelcomeHub(true)}
        onOpenKnowledgeTrainer={() => setKnowledgeModalOpen(true)}
        onOpenJudgeDemo={() => {
          setShowWelcomeHub(false);
          setCurrentView('judge');
        }}
        currentRole={currentRole}
        onSelectRole={handleRoleSelect}
      />

      {/* 2. CUSTOMER PROFILE BANNER & CURRENT PROBLEM CONTEXT */}
      {currentView !== 'support_console' && (
        <CustomerProfileBanner
          customer={activeCustomer}
          activeTicket={activeTicket}
        />
      )}

      {/* 3. MAIN WORKSPACE WITH SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Professional Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={(view) => {
            setShowWelcomeHub(false);
            setCurrentView(view);
          }}
          openTicketsCount={tickets.filter(t => t.status !== 'Resolved').length}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          {showWelcomeHub ? (
            <WelcomeHub onSelectOption={handleWelcomeOption} />
          ) : (
            <>
              {currentView === 'support_console' && (
                <SupportConsoleView
                  customer={activeCustomer}
                  tickets={tickets}
                  onOpenCustomerChat={() => handleRoleSelect('customer')}
                  onOpenTechnicianConsole={() => handleRoleSelect('technician')}
                />
              )}

              {currentView === 'support' && (
                <CustomerSupportView
                  customer={activeCustomer}
                  tickets={tickets}
                  timeline={timeline}
                  kbArticles={kbArticles}
                  onOpenEscalation={handleOpenEscalation}
                  onOpenTimelineView={() => setCurrentView('timeline')}
                  onOpenKBArticle={() => setCurrentView('kb')}
                  presetPrompt={presetPrompt}
                  onClearPresetPrompt={() => setPresetPrompt(undefined)}
                />
              )}

              {currentView === 'judge' && (
                <JudgeDemoView
                  customers={customers}
                  onOpenCustomerSupport={(prompt) => {
                    setCurrentRole('customer');
                    setCurrentView('support');
                    if (prompt) setPresetPrompt(prompt);
                  }}
                  onOpenEscalationModal={handleOpenEscalation}
                  onOpenTechnicianConsole={() => {
                    setCurrentRole('technician');
                    setCurrentView('technicians');
                  }}
                />
              )}

              {currentView === 'hindsight' && (
                <HindsightView
                  customers={customers}
                  activeCustomer={activeCustomer}
                  tickets={tickets}
                  onSelectCustomer={handleSelectCustomer}
                  onOpenCustomerSupport={(prompt) => {
                    setCurrentView('support');
                    if (prompt) setPresetPrompt(prompt);
                  }}
                />
              )}

              {currentView === 'customer360' && (
                <Customer360View
                  customer={activeCustomer}
                  tickets={tickets}
                  timeline={timeline}
                />
              )}

              {currentView === 'features' && (
                <MainFeaturesView />
              )}

              {currentView === 'comparison' && (
                <ComparisonView />
              )}

              {currentView === 'technicians' && (
                <TechnicianConsole
                  customer={activeCustomer}
                  tickets={tickets}
                  onOpenCustomerSupport={() => {
                    setCurrentRole('customer');
                    setCurrentView('support');
                  }}
                  onOpenKnowledgeArticle={() => setCurrentView('kb')}
                />
              )}

              {/* Views mapped to full AgentDashboard tabs */}
              {['dashboard', 'tickets', 'kb', 'timeline', 'graph', 'escalations', 'analytics', 'settings'].includes(currentView) && (
                <AgentDashboard
                  customers={customers}
                  activeCustomer={activeCustomer}
                  onSelectCustomer={handleSelectCustomer}
                  onOpenCustomerPortal={() => setCurrentView('support')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* 4. SMART ESCALATION CASE SUMMARY MODAL */}
      <EscalationModal
        isOpen={escalationModalOpen}
        onClose={() => setEscalationModalOpen(false)}
        customer={activeCustomer}
        ticketId={escalationTicketId}
      />

      {/* 5. UNIVERSAL KNOWLEDGE & REAL-TIME WEB TRAINER MODAL */}
      <UniversalKnowledgeModal
        isOpen={knowledgeModalOpen}
        onClose={() => setKnowledgeModalOpen(false)}
      />
    </div>
  );
};

export default App;
