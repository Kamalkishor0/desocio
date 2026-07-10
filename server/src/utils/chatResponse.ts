import { ConversationResponse } from "../types/chat";

type ConversationWithParticipants = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  participants: {
    userId: string;
    user: {
      id: string;
      name: string;
      username: string;
      profilePictureUrl: string | null;
    };
  }[];
};

export function mapConversation(
  conversation: ConversationWithParticipants,
  currentUserId: string
): ConversationResponse {
  const otherParticipant = conversation.participants.find(
    (participant) => participant.userId !== currentUserId
  );

  if (!otherParticipant) {
    throw new Error("Conversation must contain another participant");
  }

  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    lastMessageAt: conversation.lastMessageAt,
    otherUser: {
      id: otherParticipant.user.id,
      name: otherParticipant.user.name,
      username: otherParticipant.user.username,
      profilePictureUrl: otherParticipant.user.profilePictureUrl,
    },
  };
}