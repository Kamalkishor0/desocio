import {request} from "./client";

export interface Notification {
  id: string;
  userId: string;
  actorId: string | null;
  actor: {
    id: string;
    username: string;
    name: string;
    profilePictureUrl: string | null;
  } | null;
  type: string;
  entityId: string | null;
  entityType: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export const notificationsApi = {
  async getNotifications() {
    return request<NotificationsResponse>("/notifications");
  },
};