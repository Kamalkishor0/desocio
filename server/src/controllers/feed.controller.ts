import { Response } from "express";
import { PostVisibility } from "@prisma/client";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/auth";

function getSingleString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function parseCursor(value: string | undefined): { createdAt: Date; id: string } | undefined {
    if (!value) {
        return undefined;
    }

    const [createdAtRaw, id] = value.split("|");
    if (!createdAtRaw || !id) {
        return undefined;
    }

    const createdAt = new Date(createdAtRaw);
    if (Number.isNaN(createdAt.getTime())) {
        return undefined;
    }

    return { createdAt, id };
}

export async function getPrivateFeed(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { cursor, limit } = req.query as { cursor?: string; limit?: string };
    const cursorValue = parseCursor(getSingleString(cursor));
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));

    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [{ userAId: auth.id }, { userBId: auth.id }]
        },
        select: { userAId: true, userBId: true }
    });
    const friendIds = friendships.map((friendship) =>
        friendship.userAId === auth.id ? friendship.userBId : friendship.userAId
    );

    const authorIds = Array.from(new Set([auth.id, ...friendIds]));

    const posts = await prisma.post.findMany({
        where: {
            authorId: { in: authorIds },
            visibility: PostVisibility.friends,
            ...(cursorValue
                ? {
                    OR: [
                        { createdAt: { lt: cursorValue.createdAt } },
                        {
                            createdAt: cursorValue.createdAt,
                            id: { lt: cursorValue.id }
                        }
                    ]
                }
                : {})
        },
        include: {
            photos: true,
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePictureUrl: true,
                    name: true,
                },
            },
            reactions: {
                where: {
                    userId: auth.id,
                },
                select: {
                    type: true,
                },
            },
        },
        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],
        take: limitNumber + 1,
    });

    const hasMore = posts.length > limitNumber;
    const pagedPosts = hasMore ? posts.slice(0, limitNumber) : posts;
    const nextCursor = hasMore
        ? `${pagedPosts[pagedPosts.length - 1].createdAt.toISOString()}|${pagedPosts[pagedPosts.length - 1].id}`
        : null;

    const data = pagedPosts.map((post) => ({
        id: post.id,
        text: post.text,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        visibility: post.visibility,
        photos: post.photos,
        author: post.author,
        viewerReaction: post.reactions[0]?.type ?? null,
    }));

    return res.json({
        data,
        nextCursor,
    });
}
