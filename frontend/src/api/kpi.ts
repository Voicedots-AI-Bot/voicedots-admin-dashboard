import axios from "axios";
import type { GetKpisResult } from "@/types/conversation.types";

const BASE_URL = "http://localhost:8000";

export async function getKpis(): Promise<GetKpisResult> {
  const res = await axios.get(
    `${BASE_URL}/v1/conversations/kpis/summary`
  );

  return res.data;
}
