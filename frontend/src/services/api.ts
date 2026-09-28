import type {
  Customer,
  MemoryItem,
  MemoryTimelineEvent,
  Ticket,
  TicketGraphData,
  KnowledgeArticle,
  ChatResponse,
  EscalationSummary,
  AnalyticsSummary,
  DemoScenario
} from '../types';

const API_BASE = '/api';

export const api = {
  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${API_BASE}/customers/`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async getCustomerDetail(customerId: string): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${customerId}`);
    if (!res.ok) throw new Error(`Failed to fetch customer ${customerId}`);
    return res.json();
  },

  // Memory
  async getStructuredMemory(customerId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/memory/${customerId}/structured`);
    if (!res.ok) throw new Error('Failed to fetch structured memory');
    return res.json();
  },

  async getMemoryItems(customerId: string): Promise<MemoryItem[]> {
    const res = await fetch(`${API_BASE}/memory/${customerId}/items`);
    if (!res.ok) throw new Error('Failed to fetch memory items');
    return res.json();
  },

  async getMemoryTimeline(customerId: string): Promise<MemoryTimelineEvent[]> {
    const res = await fetch(`${API_BASE}/memory/${customerId}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch memory timeline');
    return res.json();
  },

  // Tickets
  async getTickets(customerId?: string, status?: string, category?: string): Promise<Ticket[]> {
    const params = new URLSearchParams();
    if (customerId) params.append('customer_id', customerId);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/tickets/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch tickets');
    return res.json();
  },

  async getTicket(ticketId: number): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`);
    if (!res.ok) throw new Error(`Failed to fetch ticket ${ticketId}`);
    return res.json();
  },

  async updateTicket(ticketId: number, data: Partial<Ticket>): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`Failed to update ticket ${ticketId}`);
    return res.json();
  },

  async getTicketGraph(customerId: string): Promise<TicketGraphData> {
    const res = await fetch(`${API_BASE}/tickets/${customerId}/graph`);
    if (!res.ok) throw new Error('Failed to fetch ticket graph');
    return res.json();
  },

  // Knowledge Base
  async getKnowledgeArticles(query?: string, category?: string): Promise<KnowledgeArticle[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/kb/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch KB articles');
    return res.json();
  },

  // Chat
  async sendMessage(customerId: string, message: string, conversationId?: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        message,
        conversation_id: conversationId
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Chat request failed: ${err}`);
    }
    return res.json();
  },

  async getCustomerConversations(customerId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/chat/conversations/${customerId}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  // Escalation
  async getEscalationSummary(customerId: string, ticketId?: number): Promise<EscalationSummary> {
    const params = ticketId ? `?active_ticket_id=${ticketId}` : '';
    const res = await fetch(`${API_BASE}/escalation/${customerId}/summary${params}`);
    if (!res.ok) throw new Error('Failed to fetch escalation summary');
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Demo
  async getDemoScenarios(): Promise<DemoScenario[]> {
    const res = await fetch(`${API_BASE}/demo/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch demo scenarios');
    return res.json();
  },

  async resetDemo(): Promise<void> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
  }
};
