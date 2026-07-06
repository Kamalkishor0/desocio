import { request } from "./client";
import type { AuthUser } from "../../types/auth";
import type { FeedPost } from "./feed";
import type { Thought } from "./thought";
export interface ProfileResponse {
  user: AuthUser;
  posts: FeedPost[];
  thoughts: Thought[];
  friendsCount: number;
}
export const profileApi = {
    async getProfileByUsername (username: string){
        return request<ProfileResponse>(`/profile/${username}`);
    }
};
