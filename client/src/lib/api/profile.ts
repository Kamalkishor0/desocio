import { request } from "./client";
import type { AuthUser } from "../../types/auth";
import type { FeedPost } from "./feed";
import type { Thought } from "./thought";
import type { FriendshipStatusType } from "@/constants/friendships";

export interface ProfileResponse {
  user: AuthUser;
  posts: FeedPost[];
  thoughts: Thought[];
  friendsCount: number;
  friendshipStatus: FriendshipStatusType;
}

export type SearchUser = Pick<
  AuthUser,
  "id" | "name" | "username" | "profilePictureUrl"
>;

export interface SearchResponse {
  users: SearchUser[];
}

export const profileApi = {
  async getProfileByUsername(username: string) {
    return request<ProfileResponse>(`/profile/${username}`);
  },

  async getSearchResult(username: string) {
    return request<SearchResponse>(
      `/profile/search/${encodeURIComponent(username)}`
    );
  },
};