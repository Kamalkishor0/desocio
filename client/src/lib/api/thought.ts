import { request } from "./client";

export type ThoughtType =
  | "thoughts"
  | "recommendations"
  | "ideas"
  | "discussions";

export type ThoughtVisibility = "public" | "private";

export type Thought = {
  id: string;
  authorId: string;
  text: string;
  type: ThoughtType;
  visibility: ThoughtVisibility;
  createdAt: string;
  updatedAt: string;
};

export type ThoughtAuthor = {
  id: string;
  username: string;
  profilePictureUrl: string | null;
  name: string;
};

export type PublicThought = Thought & {
  author: ThoughtAuthor;
};

export type ThoughtComment = {
  id: string;
  thoughtId: string;
  authorId: string;
  parentId: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  author: ThoughtAuthor;
  replies?: ThoughtComment[];
};

export type ThoughtCommentResponse = {
  data: ThoughtComment[];
  page: number;
  limit: number;
  total: number;
};

export type ThoughtMembership = {
  id: string;
  user: ThoughtAuthor;
  createdAt: string;
};

export type ThoughtMembershipResponse = {
  data: ThoughtMembership[];
  page: number;
  limit: number;
  total: number;
};

export type ThoughtFeedResponse = {
  data: PublicThought[];
  nextCursor: string | null;
};

export interface CreateThoughtRequest {
  text: string;
  type?: ThoughtType;
  visibility?: ThoughtVisibility;
}

export const thoughtApi = {
  getById: (id: string) => request<PublicThought>(`/thoughts/${id}`),

  list: (userId?: string) => {
    const url = userId
      ? `/thoughts?userId=${encodeURIComponent(userId)}`
      : "/thoughts";
    return request<Thought[]>(url);
  },

  publicFeed: (params?: { cursor?: string; limit?: number; type?: ThoughtType }) => {
    const search = new URLSearchParams();

    if (params?.cursor) {
      search.set("cursor", params.cursor);
    }

    if (params?.limit) {
      search.set("limit", String(params.limit));
    }

    if (params?.type) {
      search.set("type", params.type);
    }

    const query = search.toString();

    return request<ThoughtFeedResponse>(
      `/thoughts/public${query ? `?${query}` : ""}`
    );
  },

  getComments: (id: string, params?: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();

    if (params?.page) {
      search.set("page", String(params.page));
    }

    if (params?.limit) {
      search.set("limit", String(params.limit));
    }

    const query = search.toString();

    return request<ThoughtCommentResponse>(
      `/thoughts/${id}/comments${query ? `?${query}` : ""}`
    );
  },

  comment: (id: string, text: string, parentId?: string | null) =>
    request<ThoughtComment>(`/thoughts/${id}/comments`, {
      method: "POST",
      body: parentId ? { text, parentId } : { text },
    }),

  support: (id: string) =>
    request(`/thoughts/${id}/support`, {
      method: "POST",
    }),

  unsupport: (id: string) =>
    request(`/thoughts/${id}/support`, {
      method: "DELETE",
    }),

  getSupporters: (id: string, params?: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();

    if (params?.page) {
      search.set("page", String(params.page));
    }

    if (params?.limit) {
      search.set("limit", String(params.limit));
    }

    const query = search.toString();

    return request<ThoughtMembershipResponse>(
      `/thoughts/${id}/support${query ? `?${query}` : ""}`
    );
  },

  save: (id: string) =>
    request(`/thoughts/${id}/save`, {
      method: "POST",
    }),

  unsave: (id: string) =>
    request(`/thoughts/${id}/save`, {
      method: "DELETE",
    }),

  getSavers: (id: string, params?: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();

    if (params?.page) {
      search.set("page", String(params.page));
    }

    if (params?.limit) {
      search.set("limit", String(params.limit));
    }

    const query = search.toString();

    return request<ThoughtMembershipResponse>(
      `/thoughts/${id}/save${query ? `?${query}` : ""}`
    );
  },

  create: (data: CreateThoughtRequest) =>
    request<Thought>("/thoughts", {
      method: "POST",
      body: {
        text: data.text,
        type: data.type,
        visibility: data.visibility,
      },
    }),
};
