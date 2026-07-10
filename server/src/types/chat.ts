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