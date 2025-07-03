// Authentication service and types
import { api } from "./api";

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

interface FilesResponse {
  files: FileInfo[];
  total: number;
  error?: string;
}

// Auth types only
interface LoginPayload {
  username: string;
  password: string;
  website: string;
}

interface LoginResponse {
  token: string;
  website: string;
}

// Auth functions only
export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export function logout(): void {
  localStorage.removeItem("authToken");
  localStorage.removeItem("deals");
  localStorage.removeItem("selectedWebsite");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("authToken");
}

export function getStoredToken(): string | null {
  return localStorage.getItem("authToken");
}

export function getStoredWebsite(): string | null {
  return localStorage.getItem("selectedWebsite");
}
export type { LoginPayload, LoginResponse, FileInfo, FilesResponse };

