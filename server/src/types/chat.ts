export interface ConversationResponse {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date;
    otherUser: {
        id: string;
        username: string;
        name: string;
        profilePictureUrl: string | null;
    };
}
export interface ConversationListItem {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt: Date;

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
        createdAt: Date;
    } | null;

    unreadCount: number;
}

export interface MessageResponse {
    id: string;
    senderId: string;
    content: string;
    status: "sent" | "delivered" | "read";
    createdAt: Date;
}

export interface MessagesResponse {
    data: MessageResponse[];
    nextCursor: string | null;
    hasMore: boolean;
}