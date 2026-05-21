import { create } from "zustand";

import type { AuthResponse, AuthUser } from "../types/auth.types";

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
};

const unauthenticatedState = {
  user: null,
  accessToken: null,
  status: "unauthenticated" as const,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "idle",
  isAuthenticated: false,

  setAuth: ({ user, accessToken }) =>
    set({
      user,
      accessToken,
      status: "authenticated",
      isAuthenticated: true,
    }),

  setUser: (user) =>
    set((state) => ({
      user,
      status: user ? "authenticated" : state.status,
      isAuthenticated: user ? true : state.isAuthenticated,
    })),

  clearAuth: () => set(unauthenticatedState),
}));
