import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";
import { Prisma } from "@prisma/client";
import {mapConversation,mapConversationListItem,mapMessage} from "../utils/chat.mapper";
import {createCursorPage,} from "../utils/pagination";
import { generateConversationKey } from "../utils/chat";
import type {ConversationResponse,ConversationListItem,MessagesResponse,MessageResponse,
OpenConversationInput,GetMessagesInput,ValidateConversationInput,SendMessageInput,
} from "../types/chat";

const userPreviewSelect = {
    id: true,
    name: true,
    username: true,
    profilePictureUrl: true,
} as const;

export async function validateConversation({
    currentUserId,
    conversationId,
}: ValidateConversationInput) {
    const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        userId: currentUserId,
                    },
                },
            },
        });

    if (!conversation) {
        throw new ApiError(404, "Conversation not found");
    }

    return conversation;
}

export async function openConversation({
    currentUserId,
    targetUserId,
}: OpenConversationInput): Promise<ConversationResponse> {
    if (currentUserId === targetUserId) {
        throw new ApiError(400, "You cannot message yourself");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: targetUserId,
        },
        select: userPreviewSelect,
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                    userAId: currentUserId,
                    userBId: targetUserId,
                },
                {
                    userAId: targetUserId,
                    userBId: currentUserId,
                },
            ],
        },
        select: {
            id: true,
        },
    });

    if (!friendship) {
        throw new ApiError(403, "You can only message your friends");
    }

    const conversationKey = generateConversationKey(
        currentUserId,
        targetUserId
    );

    const existingConversation =
        await prisma.conversation.findUnique({
            where: {
                conversationKey,
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: userPreviewSelect,
                        },
                    },
                },
            },
        });

    if (existingConversation) {
        return mapConversation(
            existingConversation,
            currentUserId
        );
    }

    const conversation =
        await prisma.conversation.create({
            data: {
                conversationKey,
                participants: {
                    create: [
                        {
                            userId: currentUserId,
                        },
                        {
                            userId: targetUserId,
                        },
                    ],
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: userPreviewSelect,
                        }   
                    },
                },
            },
        });

    return mapConversation(
        conversation,
        currentUserId
    );
}
export async function getConversations(
    currentUserId: string
): Promise<ConversationListItem[]> {
    const conversations =
        await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: currentUserId,
                    },
                },
            },
            orderBy: {
                lastMessageAt: "desc",
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: userPreviewSelect,
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
        });

    return conversations.map((conversation) =>
        mapConversationListItem(
            conversation,
            currentUserId
        )
    );
}
export async function getMessages({
    currentUserId,
    conversationId,
    cursor,
    limit,
}: GetMessagesInput): Promise<MessagesResponse> {
    await validateConversation({
        currentUserId,
        conversationId,
    });

    const messages =
        await prisma.message.findMany({
            where: {
                conversationId,
            },
            orderBy: [
                {
                    createdAt: "desc",
                },
                {
                    id: "desc",
                },
            ],
            take: limit + 1,
            ...(cursor && {
                cursor: {
                    id: cursor,
                },
                skip: 1,
            }),
        });

    const page = createCursorPage(
        messages,
        limit
    );

    page.data.reverse();

    return {
        data: page.data.map(mapMessage),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
    };
}
export async function sendMessage({
    currentUserId,
    conversationId,
    content,
}: SendMessageInput): Promise<MessageResponse> {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
        throw new ApiError(400, "Message cannot be empty");
    }

    if (trimmedContent.length > 2000) {
        throw new ApiError(400, "Message cannot exceed 2000 characters");
    }

    await validateConversation({
        currentUserId,
        conversationId,
    });

    const message = await prisma.$transaction(async (tx) => {
        const createdMessage = await tx.message.create({
            data: {
                conversationId,
                senderId: currentUserId,
                content: trimmedContent,
            },
        });

        await tx.conversation.update({
            where: {
                id: conversationId,
            },
            data: {
                lastMessageAt: createdMessage.createdAt,
            },
        });

        return createdMessage;
    });

    return mapMessage(message);
}

type JoinConversationInput = {
    currentUserId: string;
    conversationId: string;
};

export async function joinConversation({
    currentUserId,
    conversationId,
}: JoinConversationInput): Promise<void> {
    await validateConversation({
        currentUserId,
        conversationId,
    });
}