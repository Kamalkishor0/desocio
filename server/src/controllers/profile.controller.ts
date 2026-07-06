import { Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/auth";

function getSingleString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

export async function getProfileByUsername(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const username = getSingleString(req.params.username);
    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    const profile = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            bio: true,
            profilePictureUrl: true,
            createdAt: true,
            lastSeenAt: true,

            posts: {
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    photos: {
                        orderBy: {
                            position: "asc",
                        },
                    },
                },
            },

            thoughts: {
                orderBy: {
                    createdAt: "desc",
                },
            },

            _count: {
                select: {
                    userAFriendships: true,
                    userBFriendships: true,
                },
            },
        },
    });

    if (!profile) {
        return res.status(404).json({ message: "User not found" });
    }
    const {
        _count,
        ...user
    } = profile;

    res.json({
        user: {
            id: profile.id,
            name: profile.name,
            username: profile.username,
            email: profile.email,
            bio: profile.bio,
            profilePictureUrl: profile.profilePictureUrl,
            createdAt: profile.createdAt,
            lastSeenAt: profile.lastSeenAt,
        },
        posts: profile.posts,
        thoughts: profile.thoughts,
        friendsCount:
            profile._count.userAFriendships +
            profile._count.userBFriendships,
    });
}