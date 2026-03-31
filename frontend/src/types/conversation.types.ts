/* =============================
   CONVERSATIONS LIST TYPES
============================= */

export interface ConversationsListSummary {
  conversation_id: string;
  title: string;
  duration: number;
  message_count: number;
  call_status: string;
  start_time: number;
  end_time: number;
  time_format: string
}

export interface GetConversationsResponse {
  status: string;
  data: ConversationsListSummary[];
  next_page: string | null;
}

export interface GetConversationsListResult {
  conversations: ConversationsListSummary[];
  nextPage: string | null;
}

/* =============================
   CONVERSATION DETAILS
============================= */

export interface ConversationDetailsSummary {
  role: "agent" | "user";
  message: string | null;
  avatar: string | null;
  timestamp: number;
  interrupted: boolean;
}

export interface LeadDetails {
  name: string;
  email: string;
  phone_number: string;
  business_desc: string;
}

export interface GetConversationDetailsResponse {
  status: string;
  data: ConversationDetailsSummary[];
  lead: LeadDetails | null;
}

export interface GetConversationDetailsResult {
  transcription: ConversationDetailsSummary[];
  lead: LeadDetails | null;
  start_time: string;
  end_time: string;
  duration: number;
}

/* =============================
   KPI SUMMARY (CARDS)
============================= */

export interface KpiSummary {
  total_conversations: number;
  total_messages: number;

  total_cost_usd: number;
  avg_cost_per_conversation_usd: number;

  total_call_duration_secs: number;
  avg_call_duration_secs: number;
}

/* =============================
   KPI TIMESERIES (GRAPHS)
============================= */

export interface KpiTimeseriesPoint {
  date: string; // YYYY-MM-DD
  conversations: number;
  messages: number;
  cost_usd: number;
  avg_call_duration_secs: number;
}

/* =============================
   KPI API RESPONSE
============================= */

export interface GetKpisResult {
  summary: KpiSummary;
  timeseries: KpiTimeseriesPoint[];
}
