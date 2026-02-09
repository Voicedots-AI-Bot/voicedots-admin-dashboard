import axios from "axios";
import { apiClient } from "@/api/apiClient";

/* ================= TYPES ================= */

export type LeadStatus = "Qualified" | "Unqualified";

export interface Lead {
  conversation_id: string;
  name: string;
  email: string;
  phone: string;
  business_description: string;
  status: LeadStatus;
}

interface GetLeadsResponse {
  status: string;
  data: Lead[];
}

interface GetLeadDetailsResponse {
  status: string;
  data: Lead;
}

/* ================= AXIOS CLIENT ================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";



/* ================= API ================= */

const leadsApi = {
  getLeads: async (): Promise<Lead[]> => {
    try {
      const response = await apiClient.get<GetLeadsResponse>(
        "/v1/leads"
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
};

export default leadsApi;
