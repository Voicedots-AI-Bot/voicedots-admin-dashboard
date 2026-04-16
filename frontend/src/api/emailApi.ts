import { createClient } from "./apiClient";

const EMAIL_API_URL = "http://195.35.20.203:7008";
const emailClient = createClient(EMAIL_API_URL);

export interface DnsRecord {
  type: string;
  host: string;
  value: string;
  status?: string;
}

export interface EmailSettings {
  from_name: string;
  from_email: string;
  reply_to: string;
  signature: string;
  auto_reply_enabled: boolean;
  domain_status: string | null;
  dns_records: DnsRecord[];
  dns_provider: string | null;
  daily_limit: number;
  sent_today: number;
}

export interface EmailTemplate {
  content: any[];
  html_content: string;
  type: "visual" | "html";
}

export interface EmailAsset {
  id: string;
  file_name: string;
  url: string;
  size_mb: number;
  mime_type: string;
  created_at: string;
}

export interface AssetListResponse {
  assets: EmailAsset[];
  total_usage_mb: number;
  quota_mb: number;
}

export interface ProviderDetection {
  provider_id: string | null;
  provider_name: string;
  can_auto_connect: boolean;
}

export interface TemplatePreset {
  id: string;
  name: string;
  html_content: string;
}

export const emailApi = {
  getSettings: async () => (await emailClient.get<EmailSettings>("/settings/email")).data,

  updateSettings: async (data: Partial<EmailSettings>) =>
    (await emailClient.post<{ ok: boolean; domain_status: string; dns_records: DnsRecord[] }>("/settings/email", data)).data,

  verifyDomain: async () =>
    (await emailClient.post<{ domain_status: string; dns_records: DnsRecord[] }>("/settings/email/verify-domain")).data,

  detectProvider: async (domain: string) =>
    (await emailClient.get<ProviderDetection>(`/settings/email/detect-provider?domain=${domain}`)).data,

  getPresets: async () => (await emailClient.get<{ presets: TemplatePreset[] }>("/settings/email/presets")).data,

  // Template Methods
  getTemplate: async () => (await emailClient.get<EmailTemplate>("/settings/email/template")).data,

  saveTemplate: async (data: Partial<EmailTemplate>) =>
    (await emailClient.post<{ ok: boolean }>("/settings/email/template", data)).data,

  // Asset Methods
  getAssets: async () => (await emailClient.get<AssetListResponse>("/settings/email/assets")).data,

  uploadAsset: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return (await emailClient.post<EmailAsset>("/settings/email/assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })).data;
  },

  deleteAsset: async (assetId: string) =>
    (await emailClient.delete(`/settings/email/assets/${assetId}`)).data
};

export default emailApi;
