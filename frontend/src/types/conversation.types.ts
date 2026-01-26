export interface ConversationSummary {
  // id: string
  // title: string
  // avatar: string
  // initials: string
  // cost: number
  // messages: number
  // status: 'successful' | 'error'
  // lastActive: string
  // date: string

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
  conversation_id: string;
  agent_id: string;
  transcript: Array<{
    role: 'user' | 'agent';
    message: string;
    time_in_call_secs: number;
  }>;
  audio_url?: string;
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

export interface GetAgentsResponse {
  agents: Agent[];
}