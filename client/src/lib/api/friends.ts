import { request } from "./client";

export type Friend = {
  id: string;
  name: string;
  username: string;
  profilePictureUrl: string | null;
};

export type FriendsResponse = {
  data: Friend[];
  page: number;
  limit: number;
  total: number;
};

export type FriendRequest = {
  id: string;
  createdAt: string;
  sender?: Friend;
  receiver?: Friend;
};

export type FriendRequestsResponse = {
  data: FriendRequest[];
};

export const friendsApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();

    if (params?.page) search.set("page", String(params.page));
    if (params?.limit) search.set("limit", String(params.limit));

    const query = search.toString();

    return request<FriendsResponse>(`/friends${query ? `?${query}` : ""}`);
  },

  receivedRequests: () =>
    request<FriendRequestsResponse>("/friends/friend-requests/received"),

  sentRequests: () =>
    request<FriendRequestsResponse>("/friends/friend-requests/sent"),

  sendFriendRequest: (receiverId: string) =>
    request<{ message: string }>("/friends/request", {
      method: "POST",
      body: { receiverId },
    }),

  acceptFriendRequest: (senderId: string) =>
    request<{ message: string }>("/friends/accept", {
      method: "POST",
      body: { senderId },
    }),

  rejectFriendRequest: (senderId: string) =>
    request<{ message: string }>("/friends/reject", {
      method: "POST",
      body: { senderId },
    }),
  cancelFriendRequest: (receiverId: string) =>
    request<{ message: string }>("/friends/cancel", {
      method: "POST",
      body: { receiverId },
    }),
  remove: (friendId: string) =>
    request<{ message: string }>("/friends/remove", {
      method: "DELETE",
      body: { friendId },
    }),
};