export interface ConversationResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;

  otherUser: {
    id: string;
    name: string;
    username: string;
    profilePictureUrl: string | null;
  };
}

export interface ConversationListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;

  otherUser: {
    id: string;
    name: string;
    username: string;
    profilePictureUrl: string | null;
  };

  lastMessage: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  } | null;

  unreadCount: number;
}

export interface MessageResponse {
  id: string;
  senderId: string;
  content: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

export interface MessagesResponse {
  data: MessageResponse[];
  nextCursor: string | null;
  hasMore: boolean;
}