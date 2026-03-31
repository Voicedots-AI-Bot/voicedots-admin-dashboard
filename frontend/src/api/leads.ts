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

const leadsApi = {
  getLeads: async (): Promise<Lead[]> => {
    try {
      const response = await apiClient.get<GetLeadsResponse>(
        "/v1/leads/"
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
    }
  },

  getLeadDetails: async (
    conversationId: string
  ): Promise<Lead> => {
    try {
      const response =
        await apiClient.get<GetLeadDetailsResponse>(
          `/v1/leads/${conversationId}`
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
    status: LeadStatus
  ): Promise<void> => {
    try {
      await apiClient.patch<UpdateLeadStatusResponse>(
        `/v1/leads/${conversationId}/status`,
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

  deleteLead: async (conversationId: string): Promise<void> => {
    try {
      await apiClient.delete(`/v1/leads/${conversationId}`);
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
