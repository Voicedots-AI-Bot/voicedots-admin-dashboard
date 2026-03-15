import { apiClient } from "@/api/apiClient";
import type {
  GetConversationsListResult,
  GetConversationsResponse,
  GetConversationDetailsResult,
  GetConversationDetailsResponse,
} from "@/types/conversation.types";


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

    const response = await apiClient.get<GetConversationsResponse>(
      "/v1/conversations/",
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
    conversationId: string
  ): Promise<GetConversationDetailsResult> => {
    const response =
      await apiClient.get<GetConversationDetailsResponse>(
        `/v1/conversations/${conversationId}`
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
    conversationId: string
  ): Promise<Blob> => {
    const response = await apiClient.get(
      `/v1/conversations/audio/${conversationId}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },
};

export default conversationsApi;
