import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Axios instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * In-memory token (source of truth = localStorage)
 */
let accessToken: string | null = localStorage.getItem("access_token");

/**
 * Set / remove auth header globally
 */
export const setAuthHeader = (token: string | null) => {
  accessToken = token;

  if (token) {
    localStorage.setItem("access_token", token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete apiClient.defaults.headers.common.Authorization;
  }
};

/**
 * Get current token
 */
export const getAuthToken = () => accessToken;

/**
 * Attach token automatically on every request
 */
apiClient.interceptors.request.use((config) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
