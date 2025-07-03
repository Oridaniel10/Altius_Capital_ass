// Deals service and types
import { api } from "./api";

// Deal types
interface Deal {
  id: number;
  title: string;
  created_at: string;
  firm: string;
  asset_class: string;
  deal_status: string;
  currency: string;
  user_id: number;
  deal_capital_seeker_email: string;
}

interface FileInfo {
  id: number | string;
  name: string;
  size: number;
  url: string;
  type: string;
  download_url: string;
  created_at?: string;
  state?: string;
}

interface DealsResponse {
  deals: Deal[];
  total: number;
}

interface FilesResponse {
  files: FileInfo[];
  total: number;
  error?: string;
}

// Deals functions
export async function getDeals(): Promise<DealsResponse> {
  // Token and website are automatically added by interceptor
  const response = await api.post("/deals/list", {});
  return response.data;
}

export async function getDealFiles(dealId: number): Promise<FilesResponse> {
  const response = await api.post(`/deals/${dealId}/files`, {
    deal_id: dealId
  });
  return response.data;
} 

export type { Deal, FileInfo, DealsResponse, FilesResponse };