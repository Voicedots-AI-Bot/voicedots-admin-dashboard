import axios from 'axios';
import type { GetConversationsListResult, GetConversationsResponse, GetConversationDetailsResult, GetConversationDetailsResponse } from '@/types/conversation.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


const conversationsApi = {
  // getAgents: async (): Promise<Agent[]> => {
  //   try {
  //     const response = await apiClient.get<GetAgentsResponse>('/agents');

  //     return response.data.agents;
  //   } catch (error) {
  //     console.error('Error fetching agents:', error);
  //     throw error;
  //   }
  // },

  getConversations: async (agentId?: string | null, cursor?: string | null): Promise<GetConversationsListResult> => {
    try {
      const params = agentId ? { agent_id: null, cursor: cursor } : { cursor: cursor };
      const response = await apiClient.get<GetConversationsResponse>('/v1/conversations', { 
        params 
      });
      return {
        conversations: response.data.data,
        nextPage: response.data.next_page
      };
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getConversationDetails: async (conversationId: string): Promise<GetConversationDetailsResult> => {
    try {
      const response = await apiClient.get<GetConversationDetailsResponse>(`/v1/conversations/${conversationId}`);
      return {
        transcription: response.data.data,
        lead: response.data.lead
      };
    } catch (error) {
      console.error(`Error fetching details for conversation ${conversationId}:`, error);
      throw error;
    }
  },

  getConversationAudio: async (conversationId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/v1/conversations/audio/${conversationId}`, {
        responseType: 'blob', 
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching audio for conversation ${conversationId}:`, error);
      throw error;
    }
  },
};

export default conversationsApi;