import { Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/auth";
import { generateConversationKey } from "../utils/chat";
import { mapConversation, mapConversationListItem } from "../utils/chat.mapper";
import { createCursorPage,getPaginationLimit } from "../utils/pagination";
import { mapMessage } from "../utils/chat.mapper";

export async function openConversation(
    req: AuthenticatedRequest,
    res: Response
) {
    const auth = req.auth;

    if (!auth) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const userId = Array.isArray(req.params.userId)
        ? req.params.userId[0]
        : req.params.userId;

    if (!userId) {
        return res.status(400).json({
            message: "User ID is required"
        });
    }

    if (userId === auth.id) {
        return res.status(400).json({
            message: "You cannot message yourself"
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                    userAId: auth.id,
                    userBId: userId
                },
                {
                    userAId: userId,
                    userBId: auth.id
                }
            ]
        },
        select: {
            id: true
        }
    });

    if (!friendship) {
        return res.status(403).json({
            message: "You can only message your friends"
        });
    }

    const conversationKey = generateConversationKey(auth.id, userId);

    const existingConversation = await prisma.conversation.findUnique({
        where: {
            conversationKey
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            profilePictureUrl: true
                        }
                    }
                }
            }
        }
    });

    if (existingConversation) {
        return res.status(200).json(
            mapConversation(existingConversation, auth.id)
        );
    }

    const conversation = await prisma.conversation.create({
        data: {
            conversationKey,
            participants: {
                create: [
                    {
                        userId: auth.id
                    },
                    {
                        userId
                    }
                ]
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            profilePictureUrl: true
                        }
                    }
                }
            }
        }
    });

    return res.status(201).json(
        mapConversation(conversation, auth.id)
    );
}

export async function getConversations(
    req: AuthenticatedRequest,
    res: Response
) {
    const auth = req.auth;

    if (!auth) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId: auth.id,
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
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            profilePictureUrl: true,
                        },
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

    const data = conversations.map((conversation) =>
        mapConversationListItem(conversation, auth.id)
    );

    return res.json(data);
}

export async function getMessages(
    req: AuthenticatedRequest,
    res: Response
) {
    const auth = req.auth;

    if (!auth) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;

    if (!conversationId) {
        return res.status(400).json({
            message: "Conversation ID is required",
        });
    }

    const limit = getPaginationLimit(req.query.limit);

    const cursor =
        typeof req.query.cursor === "string"
            ? req.query.cursor
            : undefined;

    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            participants: {
                some: {
                    userId: auth.id,
                },
            },
        },
        select: {
            id: true,
        },
    });

    if (!conversation) {
        return res.status(404).json({
            message: "Conversation not found",
        });
    }

    const messages = await prisma.message.findMany({
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

    const page = createCursorPage(messages, limit);

    page.data.reverse();

    return res.json({
        data: page.data.map(mapMessage),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
    });
}