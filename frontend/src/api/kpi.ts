import { apiClient } from './apiClient';
import type { GetKpisResult, KpiSummary } from "@/types/conversation.types";

export const kpiAPI = {
  getKpiSummary: async (): Promise<KpiSummary> => {
    const response = await apiClient.get<KpiSummary>(
      "/v1/kpis/summary/"
    );
    return response.data;
  },

  getKpis: async (): Promise<GetKpisResult> => {
    const response = await apiClient.get<GetKpisResult>(
      "/v1/kpis/"
    );
    return response.data;
  },
}

// export async function getKpis(): Promise<GetKpisResult>
// const res = await apiClient.get(
//     "/v1/conversations/kpis/summary"
//   );

//   return res.data;
