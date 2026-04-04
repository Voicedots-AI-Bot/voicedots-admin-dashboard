import { apiClient } from "@/api/apiClient";

/* ================= TYPES ================= */

export type LeadStatus = "Qualified" | "Unqualified" | "Follow Up";
import type { Lead } from "@/types/lead.types";

interface GetLeadsResponse {
  status: string;
  data: Lead[];
}

interface GetLeadDetailsResponse {
  status: string;
  data: Lead;
}

interface UpdateLeadStatusResponse {
  status: string;
  message: string;
  data: {
    conversation_id: string;
    status: string;
  };
}

/* ================= API ================= */

const getApiVersion = (agentId?: string | null): string => {
  if (agentId && agentId.startsWith("voicedots_agent_")) {
    return "v2";
  }
  return "v1";
};

const leadsApi = {
  getLeads: async (options?: {
    agentId?: string | null;
    startDate?: string;
    endDate?: string;
    status?: string | null;
  }): Promise<Lead[]> => {
    try {
      const version = getApiVersion(options?.agentId);
      const response = await apiClient.get<GetLeadsResponse>(
        `/${version}/leads/`,
        {
          params: {
            start_date: options?.startDate || undefined,
            end_date: options?.endDate || undefined,
            status: options?.status || undefined,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },

  getLeadDetails: async (
    conversationId: string,
    agentId?: string | null
  ): Promise<Lead> => {
    try {
      const version = getApiVersion(agentId);
      const response =
        await apiClient.get<GetLeadDetailsResponse>(
          `/${version}/leads/${conversationId}`
        );
      return response.data.data;
    } catch (error) {
      console.error(
        `Error fetching lead ${conversationId}:`,
        error
      );
      throw error;
    }
  },

  updateLeadStatus: async (
    conversationId: string,
    status: LeadStatus,
    agentId?: string | null
  ): Promise<void> => {
    try {
      const version = getApiVersion(agentId);
      await apiClient.patch<UpdateLeadStatusResponse>(
        `/${version}/leads/${conversationId}/status`,
        { status }
      );
    } catch (error) {
      console.error(
        `Error updating status for lead ${conversationId}:`,
        error
      );
      throw error;
    }
  },

  deleteLead: async (
    conversationId: string,
    agentId?: string | null
  ): Promise<void> => {
    try {
      const version = getApiVersion(agentId);
      await apiClient.delete(`/${version}/leads/${conversationId}`);
    } catch (error) {
      console.error(
        `Error deleting lead ${conversationId}:`,
        error
      );
      throw error;
    }
  },
};

export default leadsApi;
