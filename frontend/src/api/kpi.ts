import { apiClient } from './apiClient';
import type { GetKpisResult, KpiSummary } from "@/types/conversation.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getApiVersion = (agentId?: string | null): string => {
  if (agentId && agentId.startsWith("voicedots_agent_")) {
    return "v3";
  }
  if (agentId && (agentId.startsWith("agent_") || agentId.startsWith("agenet_"))) {
    return "v1";
  }
  return "v1"; // Default to v1
};

export const kpiAPI = {
  getKpiSummary: async (agentId?: string | null): Promise<KpiSummary> => {
    const version = getApiVersion(agentId);
    const response = await apiClient.get<KpiSummary>(
      `/${version}/kpis/summary`
    );
    return response.data;
  },

  getKpis: async (agentId?: string | null): Promise<GetKpisResult> => {
    const version = getApiVersion(agentId);
    const response = await apiClient.get<GetKpisResult>(
      `/${version}/kpis/`
    );
    return response.data;
  },
}

// export async function getKpis(): Promise<GetKpisResult>
// const res = await apiClient.get(
//     "/v1/conversations/kpis/summary"
//   );

//   return res.data;
