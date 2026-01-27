export interface ConversationSummary {
  agent_id: string,
  branch_id: string,
  version_id: string,
  agent_name: string,
  conversation_id: string,
  start_time_unix_secs: number,
  call_duration_secs: number,
  message_count: number,
  status: string,
  call_successful: string,
  call_summary_title: string,
  transcript_summary: null,
  direction: null,
  rating: null
}

export interface ConversationDetail {
  role: "agent" | "user";
  message: string | null;
  original_message: string | null;
  time_in_call_secs: number;
  interrupted: boolean;
  source_medium: string | null;
  agent_metadata: {
    agent_id: string;
    branch_id: string;
    workflow_node_id: string;
  } | null;
  tool_calls: Array<Record<string, unknown>>;
  tool_results: Array<Record<string, unknown>>;
  conversation_turn_metrics: unknown | null;
  rag_retrieval_info: unknown | null;
  llm_usage: unknown | null;
  multivoice_message: unknown | null;
  feedback: unknown | null;
  llm_override: unknown | null;
}

export interface Agent {
  agent_id: string;
  name: string;
}

export interface GetConversationsResponse {
  status: string;
  data: {
    conversations: ConversationSummary[];
    has_more?: boolean;
    next_cursor?: string | null;
  };
}

export interface ConversationDetailsResponse {
  status: string;
  data: Record<string, string | ConversationDetail | any>;
}