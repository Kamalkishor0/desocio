import { Response } from "express";
import { FriendRequestStatus } from "@prisma/client";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/auth";

export async function getFriends(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;
    const where = {
        OR: [{ userAId: auth.id }, { userBId: auth.id }]
    };

    const total = await prisma.friendship.count({ where });
    const friendships = await prisma.friendship.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
        include: {
            userA: {
                select: { id: true, username: true, profilePictureUrl: true }
            },
            userB: {
                select: { id: true, username: true, profilePictureUrl: true }
            }
        }
    });

    const friends = friendships.map((friendship) =>
        friendship.userAId === auth.id ? friendship.userB : friendship.userA
    );

    res.json({
        data: friends,
        page: pageNumber,
        limit: limitNumber,
        total
    });
    
}

export async function getReceivedFriendRequests(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
        receiverId: auth.id,
        status: FriendRequestStatus.pending
    };

    const total = await prisma.friendRequest.count({ where });
    const requests = await prisma.friendRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
        include: {
            sender: {
                select: { id: true, username: true, profilePictureUrl: true }
            }
        }
    });

    res.json({
        data: requests.map((request) => ({
            id: request.id,
            sender: request.sender,
            createdAt: request.createdAt
        })),
        page: pageNumber,
        limit: limitNumber,
        total
    });
}

export async function getSentFriendRequests(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
        senderId: auth.id,
        status: FriendRequestStatus.pending
    };

    const total = await prisma.friendRequest.count({ where });
    const requests = await prisma.friendRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
        include: {
            receiver: {
                select: { id: true, username: true, profilePictureUrl: true }
            }
        }
    });

    res.json({
        data: requests.map((request) => ({
            id: request.id,
            receiver: request.receiver,
            createdAt: request.createdAt
        })),
        page: pageNumber,
        limit: limitNumber,
        total
    });
}
export async function sendFriendRequest(req: AuthenticatedRequest, res: Response) {
    // Implementation for sending a friend request
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { receiverId } = req.body as { receiverId?: string };
    if (!receiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
    }
    if (receiverId === auth.id) {
        return res.status(400).json({ message: "Cannot send friend request to yourself" });
    }

    const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { id: true }
    });
    if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
    }

    const existingFriendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { userAId: auth.id, userBId: receiverId },
                { userAId: receiverId, userBId: auth.id }
            ]
        },
        select: { id: true }
    });
    if (existingFriendship) {
        return res.status(409).json({ message: "Already friends" });
    }

    const existingRequest = await prisma.friendRequest.findFirst({
        where: {
            OR: [
                { senderId: auth.id, receiverId },
                { senderId: receiverId, receiverId: auth.id }
            ],
            status: FriendRequestStatus.pending
        },
        select: { id: true, senderId: true, receiverId: true, status: true }
    });

    if (
        existingRequest?.status === "pending" &&
        existingRequest.senderId === receiverId &&
        existingRequest.receiverId === auth.id
    ) {
        const [userAId, userBId] =
            receiverId < auth.id
                ? [receiverId, auth.id]
                : [auth.id, receiverId];

        await prisma.$transaction([
            prisma.friendship.createMany({
                data: [
                    {
                        userAId,
                        userBId
                    }
                ],
                skipDuplicates: true
            }),
            prisma.friendRequest.delete({
                where: { id: existingRequest.id }
            })
        ]);

        return res.status(200).json({ message: "Friend request accepted" });
    }

    if (existingRequest?.status === "pending") {
        return res.status(409).json({ message: "Friend request already pending" });
    }

    await prisma.friendRequest.deleteMany({
        where: {
            OR: [
                { senderId: auth.id, receiverId },
                { senderId: receiverId, receiverId: auth.id }
            ],
            status: { not: "pending" }
        }
    });

    await prisma.friendRequest.create({
        data: {
            senderId: auth.id,
            receiverId,
            status: "pending"
        }
    });

    return res.status(201).json({ message: "Friend request sent" });
}

export async function acceptFriendRequest(req: AuthenticatedRequest, res: Response) {
    // Implementation for accepting a friend request
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { senderId } = req.body as { senderId?: string };
    if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
    }

    const friendRequest = await prisma.friendRequest.findFirst({
        where: {
            senderId,
            receiverId: auth.id,
            status: "pending"
        },
        select: { id: true }
    });
    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
    }

    const [userAId, userBId] =
        senderId < auth.id
            ? [senderId, auth.id]
            : [auth.id, senderId];

    await prisma.$transaction([
        prisma.friendship.createMany({
            data: [
                {
                    userAId,
                    userBId
                }
            ],
            skipDuplicates: true
        }),
        prisma.friendRequest.delete({
            where: { id: friendRequest.id }
        })
    ]);

    return res.status(200).json({ message: "Friend request accepted" });
}

export async function rejectFriendRequest(req: AuthenticatedRequest, res: Response) {
    // Implementation for rejecting a friend request
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { senderId } = req.body as { senderId?: string };
    if (!senderId) {
        return res.status(400).json({ message: "Sender ID is required" });
    }

    const friendRequest = await prisma.friendRequest.findFirst({
        where: {
            senderId,
            receiverId: auth.id,
            status: "pending"
        },
        select: { id: true }
    });
    if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
    }

    await prisma.friendRequest.delete({
        where: { id: friendRequest.id }
    });

    return res.status(200).json({ message: "Friend request rejected" });
}

export async function removeFriend(req: AuthenticatedRequest, res: Response) {
    // Implementation for removing a friend
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { friendId } = req.body as { friendId?: string };
    if (!friendId) {
        return res.status(400).json({ message: "Friend ID is required" });
    }

    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { userAId: auth.id, userBId: friendId },
                { userAId: friendId, userBId: auth.id }
            ]
        },
        select: { id: true }
    });
    if (!friendship) {
        return res.status(404).json({ message: "Friendship not found" });
    }

    await prisma.friendship.delete({
        where: { id: friendship.id }
    });

    return res.status(200).json({ message: "Friend removed" });
}