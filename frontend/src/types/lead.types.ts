export type LeadStatus = "Qualified" | "Unqualified" | "Follow Up";

export interface Lead {
  conversation_id: string;
  name: string;
  email: string;
  phone: string;
  business_description: string;
  status: LeadStatus;
}
