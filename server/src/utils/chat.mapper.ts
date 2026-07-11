import { ConversationResponse } from "../types/chat";
import { MessageResponse } from "../types/chat";
import { Message } from "@prisma/client";

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
import { ConversationListItem } from "../types/chat";
import { Prisma } from "@prisma/client";

type ConversationListPayload =
    Prisma.ConversationGetPayload<{
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true;
                            name: true;
                            username: true;
                            profilePictureUrl: true;
                        };
                    };
                };
            };
            messages: true;
        };
    }>;

export function mapConversationListItem(
    conversation: ConversationListPayload,
    currentUserId: string
): ConversationListItem {
    const otherUser = conversation.participants.find(
        (participant) => participant.userId !== currentUserId
    )!.user;

    const lastMessage = conversation.messages[0] ?? null;

    return {
        id: conversation.id,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        lastMessageAt: conversation.lastMessageAt,

        otherUser,

        lastMessage: lastMessage
            ? {
                  id: lastMessage.id,
                  senderId: lastMessage.senderId,
                  content: lastMessage.content,
                  createdAt: lastMessage.createdAt,
              }
            : null,

        unreadCount: 0,
    };
}

export function mapMessage(message: Message): MessageResponse {
    return {
        id: message.id,
        senderId: message.senderId,
        content: message.content,
        status: message.status,
        createdAt: message.createdAt,
    };
}