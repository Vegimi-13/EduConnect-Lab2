import axios from "axios";

import { useAuthStore } from "@/features/auth/store/authStore";
import type { AuthResponse } from "@/features/auth/types/auth.types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let refreshRequest: Promise<AuthResponse> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= axios
        .post<AuthResponse>("/auth/refresh", undefined, {
          baseURL: api.defaults.baseURL,
          withCredentials: true,
        })
        .then((response) => response.data)
        .finally(() => {
          refreshRequest = null;
        });

      const auth = await refreshRequest;
      useAuthStore.getState().setAuth(auth);
      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    }
  }
);
