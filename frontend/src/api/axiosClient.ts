import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../lib/tokens";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Endpoints that must never trigger the refresh-and-retry flow: they either
// legitimately return 401 (bad credentials) or are the refresh call itself.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];
const isAuthEndpoint = (url?: string) =>
  !!url && AUTH_ENDPOINTS.some((path) => url.includes(path));

// Clears the local session and sends the user to the login screen. A full
// navigation resets all in-memory state (stores, sockets, query cache).
const forceLogout = () => {
  clearTokens();
  localStorage.removeItem("auth-storage");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Single-flight refresh: concurrent 401s share one refresh request instead of
// firing a stampede of them.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data.accessToken;
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Only handle expired-token 401s on non-auth endpoints, and retry each
    // request at most once.
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthEndpoint(original.url)
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return axiosClient(original);
    } catch (refreshError) {
      refreshPromise = null;
      forceLogout();
      return Promise.reject(refreshError);
    }
  }
);

export default axiosClient;
