import { request } from "./client";

export type AuthUser = {
  id: string;
  username: string;
  userOrEmail: string;
  email: string;
  createdAt?: string;
  profilePictureUrl?: string | null;
  bio?: string | null;
};

export const authApi = {
  login: (body: { userOrEmail?: string; password: string }) =>
    request<{ message: string }>("/auth/login", { method: "POST", body }),
  register: (body: { email: string; password: string; username: string; name: string }) =>
    request<{ message: string; newUser: AuthUser }>("/auth/register", { method: "POST", body }),
  me: () => request<{ user: AuthUser }>("/auth/me"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
};