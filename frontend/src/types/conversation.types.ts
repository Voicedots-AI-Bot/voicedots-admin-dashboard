// CONVERSATIONS LIST TYPES
export interface ConversationsListSummary {
  conversation_id: string;
  title: string;
  duration: number;
  message_count: number;
  call_status: string;
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


// CONVERSATION DETAILS AND TRANSCRIPT TYPES
export interface ConversationDetailsSummary {
  role: "agent" | "user";
  message: string | null;
  avatar: string | null;
  timestamp: number;
  interrupted: boolean;
}

interface LeadDetails {
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
}

// AGENT TYPES

export interface Agent {
  agent_id: string;
  name: string;
}

export interface KpiSummary {
  total_conversations: number;
  total_messages: number;
  total_credits: number;
  total_cost_usd: number;
  avg_cost_per_conversation: number;
}
