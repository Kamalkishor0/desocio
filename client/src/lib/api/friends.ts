import { request } from "./client";

export type Friend = {
  id: string;
  username: string;
  profilePictureUrl: string | null;
};

export type FriendsResponse = {
  data: Friend[];
  page: number;
  limit: number;
  total: number;
};

export const friendsApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));
    const query = search.toString();
    return request<FriendsResponse>(`/friends${query ? `?${query}` : ""}`);
  },
  remove: (friendId: string) =>
    request<{ message: string }>("/friends/remove", {
      method: "DELETE",
      body: { friendId },
    }),
};
