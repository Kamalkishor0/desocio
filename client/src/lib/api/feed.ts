import { request } from "./client";

export type FeedPost = {
  id: string;
  text: string | null;
  createdAt: string;
  updatedAt: string;
  visibility: "friends" | "private";
  author: {
    id: string;
    username: string;
    profilePictureUrl: string | null;
  };
  photos: Array<{
    id: string;
    url: string;
    position: number;
  }>;
};

export const feedApi = {
  feed: (params?: { cursor?: string; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set("cursor", params.cursor);
    if (params?.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return request<{ data: FeedPost[]; limit: number; total: number; nextCursor: string | null }>(
      `/feed/posts${query ? `?${query}` : ""}`
    );
  }
};