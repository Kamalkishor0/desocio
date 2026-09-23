import { API_BASE_URL, request } from "./client";
import type { AuthUser } from "../../types/auth";

const AUTH = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
} as const;

export type LoginRequest = {
  userOrEmail: string;
  password: string;
};

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export type RegisterRequest = {
  email: string;
  password: string;
  username: string;
  name: string;
};

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

export type GoogleCompleteRequest = {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export interface GoogleCompleteResponse {
  message: string;
  user: AuthUser;
}

export const authApi = {
  login(body: LoginRequest) {
    return request<LoginResponse>(AUTH.LOGIN, {
      method: "POST",
      body,
    });
  },
  register(body: RegisterRequest) {
    return request<RegisterResponse>(AUTH.REGISTER, {
      method: "POST",
      body,
    });
  },
  googleComplete(body: GoogleCompleteRequest) {
    return request<GoogleCompleteResponse>("/auth/google/complete", {
      method: "POST",
      body,
    });
  },
  me() {
    return request<{ user: AuthUser }>(AUTH.ME);
  },
  logout() {
    return request<{ message: string }>(AUTH.LOGOUT, { method: "POST" });
  },
  googleUrl() {
    return `${API_BASE_URL}/auth/google`;
  },
};