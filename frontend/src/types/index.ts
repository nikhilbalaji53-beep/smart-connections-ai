export interface CustomerEnvironment {
  id: number;
  customer_id: string;
  operating_system: string;
  os_version: string;
  cloud_provider: string;
  application_name: string;
  application_version: string;
  hardware_tier: string;
  runtime_environment: string;
  details_json: string;
  updated_at: string;
}

export interface CustomerPreference {
  id: number;
  customer_id: string;
  communication_style: string;
  preferred_contact: string;
  timezone: string;
  language: string;
  auto_escalation_threshold: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  organization: string;
  role_title: string;
  team?: string;
  customer_since?: string;
  account_id?: string;
  location?: string;
  customer_status?: string;
  tier: string;
  avatar_url?: string;
  baseline_frustration: number;
  environment?: CustomerEnvironment;
  preferences?: CustomerPreference;
  open_tickets_count?: number;
  resolved_tickets_count?: number;
  recurring_issues_count?: number;
}

export interface MemoryItem {
  id: number;
  customer_id: string;
  memory_type: 'known_issue' | 'failed_solution' | 'successful_solution' | 'environment_spec' | 'preference' | string;
  key: string;
  value: string;
  context?: string;
  confidence: number;
  source_ticket_id?: number;
  created_at: string;
}

export interface MemoryTimelineEvent {
  id: number;
  customer_id: string;
  event_date: string;
  event_type: string;
  title: string;
  description: string;
  badge_variant: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  related_ticket_id?: number;
}

export interface Ticket {
  id: number;
  customer_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated' | 'Investigating';
  created_at: string;
  updated_at: string;
  ai_summary?: string;
  troubleshooting_performed: string;
  resolution?: string;
  assigned_agent: string;
  escalation_status: string;
  related_ticket_ids: string;
}

export interface TicketGraphNode {
  id: string;
  label: string;
  category: string;
  status: string;
  priority: string;
  date: string;
}

export interface TicketGraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface TicketGraphData {
  nodes: TicketGraphNode[];
  edges: TicketGraphEdge[];
}

export interface KnowledgeArticle {
  id: number;
  article_id: string;
  title: string;
  category: string;
  product: string;
  summary: string;
  content: string;
  error_codes: string;
  recommended_steps: string;
  tags: string;
  updated_at: string;
}

export interface MemoryUsedItem {
  type: string;
  title: string;
  detail: string;
  source_id?: string;
}

export interface ChatMessage {
  id?: string | number;
  sender: 'user' | 'assistant' | 'system' | 'agent' | 'customer' | 'technician' | 'technician_internal';
  content: string;
  created_at: string;
  memory_used?: MemoryUsedItem[];
  sentiment_tag?: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: string;
  sentiment: 'CALM' | 'CONFUSED' | 'FRUSTRATED' | 'URGENT';
  frustration_score: number;
  memory_used: MemoryUsedItem[];
  active_ticket_id?: number;
  related_tickets_found: number[];
  failed_solutions_avoided: string[];
  recommended_action?: string;
  contingency_step?: string;
  should_escalate: boolean;
  new_memory_extracted: string[];
}

export interface EscalationSummary {
  customer_name: string;
  organization: string;
  tier: string;
  environment_snapshot: string;
  current_issue: string;
  relevant_history: string;
  previous_attempts: string[];
  successful_solutions: string[];
  failed_solutions: string[];
  related_tickets: number[];
  current_status: string;
  recommended_next_action: string;
  frustration_level: string;
  raw_markdown: string;
}

export interface AnalyticsSummary {
  active_conversations: number;
  open_tickets: number;
  escalated_cases: number;
  resolved_today: number;
  average_resolution_time_mins: number;
  repeat_issue_reduction_rate: number;
  ai_resolution_rate: number;
  frustration_distribution: Record<string, number>;
  category_breakdown: Record<string, number>;
}

export interface DemoScenario {
  id: string;
  name: string;
  customer_id: string;
  role: string;
  prompt: string;
  description: string;
  expected_avoidance: string[];
  expected_environment: string;
}

export interface PurchasedProduct {
  id: string;
  name: string;
  category: string;
  icon: string;
  platform: 'Amazon' | 'Flipkart' | 'Meesho' | 'Demo Partner Store' | string;
  orderNumber: string;
  purchaseDate: string;
  deliveryStatus: 'Delivered' | 'In Transit' | 'Processing';
  warrantyStatus: 'Active' | 'Expired';
  warrantyExpiry?: string;
  serialNumber?: string;
  previousIssue?: string;
  previousSolution?: string;
  commonProblems: string[];
}

export interface ConnectedPlatform {
  name: string;
  status: 'Demo Connected' | 'Connected' | 'Disconnected';
  ordersCount: number;
  lastSync: string;
  logo: string;
  accentColor: string;
}
