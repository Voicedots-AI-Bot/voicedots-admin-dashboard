import axios from "axios";
import { apiClient } from "@/api/apiClient";
import type {
  GetConversationsListResult,
  GetConversationsResponse,
  GetConversationDetailsResult,
  GetConversationDetailsResponse,
  KpiSummary,
  GetKpisResult,
} from "@/types/conversation.types";


const conversationsApi = {
  /* =====================================================
     KPI SUMMARY ONLY (USED BY OLD SCREENS – KEEP)
  ===================================================== */
  getKpiSummary: async (): Promise<KpiSummary> => {
    const response = await apiClient.get<KpiSummary>(
      "/v1/conversations/kpis/summary"
    );
    return response.data;
  },

  /* =====================================================
     KPI SUMMARY + TIMESERIES (NEW – FOR GRAPHS)
     Backend response:
     {
       summary: {...},
       timeseries: [...]
     }
  ===================================================== */
  getKpis: async (): Promise<GetKpisResult> => {
    const response = await apiClient.get<GetKpisResult>(
      "/v1/conversations/kpis"
    );
    return response.data;
  },

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
      "/v1/conversations",
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
