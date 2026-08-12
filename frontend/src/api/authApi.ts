import axios from "axios";
import axiosClient from "./axiosClient";

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

export type RefreshResponse = AuthResponse;

export const registerApi = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await axiosClient.post<AuthResponse>("/auth/register", data);
  return res.data;
};

export const loginApi = async (data: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await axiosClient.post<AuthResponse>("/auth/login", data);
  return res.data;
};

// The refresh call deliberately uses a bare axios instance (not axiosClient) so
// it never passes through the 401-refresh interceptor — that would recurse.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const refreshApi = async (
  refreshToken: string
): Promise<RefreshResponse> => {
  const res = await axios.post<RefreshResponse>(`${API_URL}/auth/refresh`, {
    refreshToken,
  });
  return res.data;
};

export const logoutApi = async (refreshToken: string): Promise<void> => {
  await axios.post(`${API_URL}/auth/logout`, { refreshToken });
};
