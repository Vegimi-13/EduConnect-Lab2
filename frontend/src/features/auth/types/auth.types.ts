export type AuthUser = {
  id: number;
  email: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type AuthMessageResponse = {
  message: string;
};

export type AuthFieldErrors = Partial<
  Record<keyof LoginRequest | keyof RegisterRequest, string[]>
>;

export type AuthApiErrorResponse = {
  message?: string;
  errors?: AuthFieldErrors;
};

export type AuthApiError = Error & {
  status?: number;
  errors?: AuthFieldErrors;
};
