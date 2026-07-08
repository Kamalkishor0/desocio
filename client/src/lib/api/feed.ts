import { request } from "./client";
import type { PostReactionType } from "@/types/post";

export type FeedPost = {
  id: string;
  text: string | null;
  createdAt: string;
  updatedAt: string;
  visibility: "friends" | "private";

  viewerReaction: PostReactionType | null;

  author: {
    id: string;
    username: string;
    profilePictureUrl: string | null;
    name : string;
  };

  photos: Array<{
    id: string;
    url: string;
    position: number;
  }>;
};

export type FeedResponse = {
  data: FeedPost[];
  nextCursor: string | null;
};

export const feedApi = {
  feed: (params?: { cursor?: string; limit?: number }) => {
    const search = new URLSearchParams();

    if (params?.cursor) {
      search.set("cursor", params.cursor);
    }

    if (params?.limit) {
      search.set("limit", String(params.limit));
    }

    const query = search.toString();

    return request<FeedResponse>(
      `/feed/posts${query ? `?${query}` : ""}`
    );
  },
};