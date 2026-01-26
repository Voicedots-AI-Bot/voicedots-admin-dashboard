import axios from 'axios';
import type { Agent, ConversationSummary, ConversationDetail, GetConversationsResponse, GetAgentsResponse } from '@/types/conversation.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


const conversationsApi = {
  getAgents: async (): Promise<Agent[]> => {
    try {
      const response = await apiClient.get<GetAgentsResponse>('/agents');

      return response.data.agents;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  getConversations: async (agentId?: string): Promise<ConversationSummary[]> => {
    try {
      const params = agentId ? { agent_id: agentId } : {};
      const response = await apiClient.get<GetConversationsResponse>('/v1/conversations', { 
        params 
      });
      return response.data.data.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  getConversationDetails: async (conversationId: string): Promise<ConversationDetail> => {
    try {
      const response = await apiClient.get<ConversationDetail>(`/v1/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching details for conversation ${conversationId}:`, error);
      throw error;
    }
  },
};

export default conversationsApi;