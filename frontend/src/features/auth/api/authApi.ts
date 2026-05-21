import { isAxiosError } from "axios";

import { api } from "@/lib/axios";
import type {
  AuthApiError,
  AuthApiErrorResponse,
  AuthMessageResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth.types";

const AUTH_BASE_PATH = "/auth";

function createAuthApiError(
  message: string,
  options?: {
    status?: number;
    errors?: AuthApiErrorResponse["errors"];
  }
): AuthApiError {
  const error = new Error(message) as AuthApiError;
  error.name = "AuthApiError";
  error.status = options?.status;
  error.errors = options?.errors;

  return error;
}

function toAuthApiError(error: unknown): AuthApiError {
  if (isAxiosError<AuthApiErrorResponse>(error)) {
    return createAuthApiError(
      error.response?.data?.message ??
        error.message ??
        "Authentication request failed",
      {
        status: error.response?.status,
        errors: error.response?.data?.errors,
      }
    );
  }

  if (error instanceof Error) {
    return createAuthApiError(error.message);
  }

  return createAuthApiError("Authentication request failed");
}

async function login(payload: LoginRequest) {
  try {
    const { data } = await api.post<AuthResponse>(
      `${AUTH_BASE_PATH}/login`,
      payload
    );

    return data;
  } catch (error) {
    throw toAuthApiError(error);
  }
}

async function register(payload: RegisterRequest) {
  try {
    const { data } = await api.post<AuthResponse>(
      `${AUTH_BASE_PATH}/register`,
      payload
    );

    return data;
  } catch (error) {
    throw toAuthApiError(error);
  }
}

async function logout() {
  try {
    const { data } = await api.post<AuthMessageResponse>(
      `${AUTH_BASE_PATH}/logout`
    );

    return data;
  } catch (error) {
    throw toAuthApiError(error);
  }
}

async function refreshSession() {
  try {
    const { data } = await api.post<AuthMessageResponse>(
      `${AUTH_BASE_PATH}/refresh`
    );

    return data;
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export const authApi = {
  login,
  register,
  logout,
  refreshSession,
};
