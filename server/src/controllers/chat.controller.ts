import { Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/auth";
import { generateConversationKey } from "../utils/chat";
import { mapConversation } from "../utils/chatResponse";

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