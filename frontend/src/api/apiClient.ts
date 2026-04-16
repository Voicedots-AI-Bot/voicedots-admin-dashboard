import axios from "axios";

export const createClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return client;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = createClient(API_BASE_URL);

export const setAuthHeader = (token: string | null) => {
  if (token) {
    localStorage.setItem("access_token", token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete apiClient.defaults.headers.common.Authorization;
  }
};