import { Response } from "express";
import { PostVisibility } from "@prisma/client";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/auth";

const FEED_HALF_LIFE_HOURS = 48;
const MAX_FEED_CANDIDATES = 200;

function getSingleString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function calculateRecencyDecay(createdAt: Date, now: Date): number {
    const ageHours = (now.getTime() - createdAt.getTime()) / 36e5;
    return Math.pow(0.5, ageHours / FEED_HALF_LIFE_HOURS);
}

export async function getPrivateFeed(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [{ userAId: auth.id }, { userBId: auth.id }]
        },
        select: { userAId: true, userBId: true }
    });

    const friendIds = friendships.map((friendship) =>
        friendship.userAId === auth.id ? friendship.userBId : friendship.userAId
    );

    if (!friendIds.length) {
        return res.json({
            data: [],
            page: pageNumber,
            limit: limitNumber,
            total: 0
        });
    }

    const [interactionScores, total] = await Promise.all([
        prisma.friendshipInteraction.findMany({
            where: {
                userId: auth.id,
                friendId: { in: friendIds }
            },
            select: { friendId: true, score: true }
        }),
        prisma.post.count({
            where: {
                authorId: { in: friendIds },
                visibility: PostVisibility.friends
            }
        })
    ]);

    const scoreByFriendId = new Map(
        interactionScores.map((interaction) => [interaction.friendId, interaction.score])
    );

    const candidateLimit = Math.min(MAX_FEED_CANDIDATES, limitNumber * 10);
    const posts = await prisma.post.findMany({
        where: {
            authorId: { in: friendIds },
            visibility: PostVisibility.friends
        },
        include: {
            photos: true,
            author: { select: { id: true, username: true, profilePictureUrl: true } }
        },
        orderBy: { createdAt: "desc" },
        take: candidateLimit
    });

    const now = new Date();
    const rankedPosts = posts
        .map((post) => {
            const interactionScore = scoreByFriendId.get(post.authorId) ?? 0;
            const recencyDecay = calculateRecencyDecay(post.createdAt, now);
            const feedScore = (interactionScore + 1) * recencyDecay;
            return { post, feedScore };
        })
        .sort((a, b) => b.feedScore - a.feedScore)
        .slice(skip, skip + limitNumber)
        .map((entry) => entry.post);

    return res.json({
        data: rankedPosts,
        page: pageNumber,
        limit: limitNumber,
        total
    });
}
