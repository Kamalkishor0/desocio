import { request } from "./client";

export type InviteProfile = {
  name: string;
  username: string;
  bio: string | null;
  profilePictureUrl: string | null;
  friendsCount: number;
};

export type InviteResponse =
  | { authenticated: true; profile: { username: string } }
  | { authenticated: false; profile: InviteProfile };

export const inviteApi = {
  get: (code: string) => request<InviteResponse>(`/invite/${encodeURIComponent(code)}`),
};