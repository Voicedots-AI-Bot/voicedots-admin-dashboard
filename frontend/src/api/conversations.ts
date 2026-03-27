import { apiClient } from "@/api/apiClient";
import type {
  GetConversationsListResult,
  GetConversationsResponse,
  GetConversationDetailsResult,
  GetConversationDetailsResponse,
} from "@/types/conversation.types";


const getApiVersion = (agentId?: string | null): string => {
  if (agentId && agentId.startsWith("voicedots_agent_")) {
    return "v2";
  }
  return "v1";
};

const conversationsApi = {
  /* =====================================================
     LIST CONVERSATIONS
  ===================================================== */
  getConversations: async (
    agentId?: string | null,
    cursor?: string | null
  ): Promise<GetConversationsListResult> => {
    const params: Record<string, string | null | undefined> = {
      cursor,
    };

    if (agentId) {
      params.agent_id = agentId;
    }

    const version = getApiVersion(agentId);

    const response = await apiClient.get<GetConversationsResponse>(
      `/${version}/conversations/`,
      { params }
    );

    return {
      conversations: response.data.data,
      nextPage: response.data.next_page,
    };
  },

  /* =====================================================
     CONVERSATION DETAILS
  ===================================================== */
  getConversationDetails: async (
    conversationId: string,
    agentId?: string | null
  ): Promise<GetConversationDetailsResult> => {
    const version = getApiVersion(agentId);
    const response =
      await apiClient.get<GetConversationDetailsResponse>(
        `/${version}/conversations/${conversationId}`
      );

    return {
      transcription: response.data.data,
      lead: response.data.lead,
    };
  },

  /* =====================================================
     CONVERSATION AUDIO
  ===================================================== */
  getConversationAudio: async (
    conversationId: string,
    agentId?: string | null
  ): Promise<Blob> => {
    const version = getApiVersion(agentId);
    const response = await apiClient.get(
      `/${version}/conversations/audio/${conversationId}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },
};

export default conversationsApi;
