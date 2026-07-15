import { request } from "./client";
import type {
  ConversationListItem,
  ConversationResponse,
  MessagesResponse,
  MessageResponse,
} from "@/types/chat";

export const chatApi = {
  openConversation(userId: string) {
    return request<ConversationResponse>(
      `/chat/conversations/${userId}`,
      {
        method: "POST",
      }
    );
  },

  getConversations() {
    return request<ConversationListItem[]>("/chat/conversations");
  },

  getMessages(
    conversationId: string,
    cursor?: string
  ) {
    const params = new URLSearchParams();

    if (cursor) {
      params.set("cursor", cursor);
    }

    return request<MessagesResponse>(
      `/chat/conversations/${conversationId}/messages?${params.toString()}`
    );
  },
};