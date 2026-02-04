import axios from 'axios';

import type {
  GetConversationsListResult,
  GetConversationsResponse,
  GetConversationDetailsResult,
  GetConversationDetailsResponse,
  KpiSummary,
} from '@/types/conversation.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const conversationsApi = {
  // ----------------------------------
  // KPI SUMMARY
  // ----------------------------------
  getKpiSummary: async (): Promise<KpiSummary> => {
    const response = await apiClient.get<KpiSummary>(
      '/v1/conversations/kpis/summary'
    );
    return response.data;
  },

  // ----------------------------------
  // LIST CONVERSATIONS
  // ----------------------------------
  getConversations: async (
    agentId?: string | null,
    cursor?: string | null
  ): Promise<GetConversationsListResult> => {
    try {
      const params: Record<string, string | null | undefined> = {
        cursor,
      };

      if (agentId) {
        params.agent_id = agentId;
      }

      const response = await apiClient.get<GetConversationsResponse>(
        '/v1/conversations',
        { params }
      );

      return {
        conversations: response.data.data,
        nextPage: response.data.next_page,
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // ----------------------------------
  // CONVERSATION DETAILS
  // ----------------------------------
  getConversationDetails: async (
    conversationId: string
  ): Promise<GetConversationDetailsResult> => {
    try {
      const response =
        await apiClient.get<GetConversationDetailsResponse>(
          `/v1/conversations/${conversationId}`
        );

      return {
        transcription: response.data.data,
        lead: response.data.lead,
      };
    } catch (error) {
      console.error(
        `Error fetching details for conversation ${conversationId}:`,
        error
      );
      throw error;
    }
  },

  // ----------------------------------
  // CONVERSATION AUDIO
  // ----------------------------------
  getConversationAudio: async (
    conversationId: string
  ): Promise<Blob> => {
    try {
      const response = await apiClient.get(
        `/v1/conversations/audio/${conversationId}`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching audio for conversation ${conversationId}:`,
        error
      );
      throw error;
    }
  },
};

export default conversationsApi;
