import { Response } from "express";
import { ThoughtVisibility, TypeOfThought } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../config/db";
import { createFeedCursor, parseFeedCursor } from "../utils/cursor";
import { getPaginationLimit } from "../utils/pagination";

function getSingleString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function parseThoughtVisibility(value: unknown): ThoughtVisibility | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    if (Object.values(ThoughtVisibility).includes(value as ThoughtVisibility)) {
        return value as ThoughtVisibility;
    }
    return undefined;
}

function parseTypeOfThought(value: unknown): TypeOfThought | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    if (Object.values(TypeOfThought).includes(value as TypeOfThought)) {
        return value as TypeOfThought;
    }
    return undefined;
}

async function getVisibleThought(authId: string, thoughtId: string) {
    const thought = await prisma.thought.findUnique({
        where: { id: thoughtId },
    });
    if (!thought) {
        return null;
    }
    if (thought.authorId === authId) {
        return thought;
    }
    if (thought.visibility === ThoughtVisibility.public) {
        return thought;
    }
    return null;
}

export async function createThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { text, type, visibility } = req.body as {
        text?: string;
        type?: unknown;
        visibility?: unknown;
    };
    const trimmedText = typeof text === "string" ? text.trim() : "";
    if (!trimmedText) {
        return res.status(400).json({ message: "Text is required" });
    }

    const parsedType = type === undefined ? undefined : parseTypeOfThought(type);
    if (type !== undefined && !parsedType) {
        return res.status(400).json({ message: "Invalid thought type" });
    }

    const parsedVisibility =
        visibility === undefined ? undefined : parseThoughtVisibility(visibility);
    if (visibility !== undefined && !parsedVisibility) {
        return res.status(400).json({ message: "Invalid thought visibility" });
    }

    const thought = await prisma.thought.create({
        data: {
            text: trimmedText,
            authorId: auth.id,
            type: parsedType,
            visibility: parsedVisibility,
        },
    });
    return res.status(201).json(thought);
}

export async function getAllThoughts(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userIdParam = getSingleString(req.query.userId);
    if (req.query.userId !== undefined && !userIdParam) {
        return res.status(400).json({ message: "Invalid user id" });
    }

    const userId = userIdParam ?? auth.id;
    if (userId === auth.id) {
        const thoughts = await prisma.thought.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: "desc" },
        });
        return res.json(thoughts);
    }

    const visibilityFilter = ThoughtVisibility.public;

    const thoughts = await prisma.thought.findMany({
        where: {
            authorId: userId,
            visibility: visibilityFilter,
        },
        orderBy: { createdAt: "desc" },
    });
    return res.json(thoughts);
}

export async function getPublicThoughtFeed(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { cursor, limit, type } = req.query as {
        cursor?: string;
        limit?: string;
        type?: string;
    };

    const cursorValue = parseFeedCursor(getSingleString(cursor));
    const limitNumber = getPaginationLimit(limit);
    const parsedType = parseTypeOfThought(getSingleString(type));

    if (type !== undefined && !parsedType) {
        return res.status(400).json({ message: "Invalid thought type" });
    }

    const thoughts = await prisma.thought.findMany({
        where: {
            visibility: ThoughtVisibility.public,
            ...(parsedType ? { type: parsedType } : {}),
            ...(cursorValue
                ? {
                    OR: [
                        { createdAt: { lt: cursorValue.createdAt } },
                        {
                            createdAt: cursorValue.createdAt,
                            id: { lt: cursorValue.id },
                        },
                    ],
                }
                : {}),
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePictureUrl: true,
                    name: true,
                },
            },
        },
        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],
        take: limitNumber + 1,
    });

    const hasMore = thoughts.length > limitNumber;
    const pagedThoughts = hasMore ? thoughts.slice(0, limitNumber) : thoughts;

    const nextCursor = hasMore
        ? createFeedCursor(
            pagedThoughts[pagedThoughts.length - 1].createdAt,
            pagedThoughts[pagedThoughts.length - 1].id
        )
        : null;

    return res.json({
        data: pagedThoughts.map((thought) => ({
            id: thought.id,
            authorId: thought.authorId,
            text: thought.text,
            type: thought.type,
            visibility: thought.visibility,
            createdAt: thought.createdAt,
            updatedAt: thought.updatedAt,
            author: thought.author,
        })),
        nextCursor,
    });
}

export async function getThoughtById(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const thought = await prisma.thought.findUnique({
        where: { id: thoughtId },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePictureUrl: true,
                    name: true,
                },
            },
        },
    });
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    if (thought.authorId !== auth.id && thought.visibility !== ThoughtVisibility.public) {
        return res.status(404).json({ message: "Thought not found" });
    }

    return res.json(thought);
}

export async function deleteThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const thought = await prisma.thought.findUnique({
        where: { id: thoughtId },
    });
    if (!thought || thought.authorId !== auth.id) {
        return res.status(404).json({ message: "Thought not found" });
    }

    await prisma.thought.delete({ where: { id: thoughtId } });
    return res.json({ message: "Thought deleted" });
}

export async function supportThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const thought = await getVisibleThought(auth.id, thoughtId);
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    const existingSupport = await prisma.thoughtSupport.findFirst({
        where: { thoughtId, userId: auth.id },
    });
    if (existingSupport) {
        return res.status(200).json({ message: "Support already added" });
    }

    const support = await prisma.thoughtSupport.create({
        data: { thoughtId, userId: auth.id },
    });
    return res.status(201).json(support);
}

export async function unsupportThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const existingSupport = await prisma.thoughtSupport.findFirst({
        where: { thoughtId, userId: auth.id },
    });
    if (!existingSupport) {
        return res.status(404).json({ message: "Support not found" });
    }

    await prisma.thoughtSupport.delete({ where: { id: existingSupport.id } });
    return res.json({ message: "Support removed" });
}

export async function saveThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const thought = await getVisibleThought(auth.id, thoughtId);
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    const existingSave = await prisma.savedThought.findFirst({
        where: { thoughtId, userId: auth.id },
    });
    if (existingSave) {
        return res.status(200).json({ message: "Thought already saved" });
    }

    const saved = await prisma.savedThought.create({
        data: { thoughtId, userId: auth.id },
    });
    return res.status(201).json(saved);
}

export async function unsaveThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const existingSave = await prisma.savedThought.findFirst({
        where: { thoughtId, userId: auth.id },
    });
    if (!existingSave) {
        return res.status(404).json({ message: "Saved thought not found" });
    }

    await prisma.savedThought.delete({ where: { id: existingSave.id } });
    return res.json({ message: "Thought unsaved" });
}

export async function commentOnThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const { text, parentId: parentIdRaw } = req.body as { text?: string; parentId?: unknown };
    const trimmedText = typeof text === "string" ? text.trim() : "";
    if (!trimmedText) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    const parentIdInput = getSingleString(parentIdRaw);

    const thought = await getVisibleThought(auth.id, thoughtId);
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    if (parentIdInput && thought.type !== TypeOfThought.discussions) {
        return res.status(400).json({ message: "Replies are only available for discussion thoughts" });
    }

    let parentId: string | null = null;
    if (parentIdInput) {
        const parent = await prisma.thoughtComment.findUnique({
            where: { id: parentIdInput },
            select: { id: true, thoughtId: true, parentId: true },
        });

        if (!parent || parent.thoughtId !== thoughtId) {
            return res.status(404).json({ message: "Parent comment not found" });
        }

        parentId = parent.parentId ?? parent.id;
    }

    const comment = await prisma.thoughtComment.create({
        data: {
            thoughtId,
            authorId: auth.id,
            text: trimmedText,
            parentId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePictureUrl: true,
                    name: true,
                },
            },
        },
    });
    return res.status(201).json(comment);
}

export async function getCommentsForThought(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const thought = await getVisibleThought(auth.id, thoughtId);
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const where = { thoughtId };
    const total = await prisma.thoughtComment.count({ where });
    const comments = await prisma.thoughtComment.findMany({
        where: { thoughtId, parentId: null },
        orderBy: { createdAt: "asc" },
        skip,
        take: limitNumber,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePictureUrl: true,
                    name: true,
                },
            },
            replies: {
                orderBy: { createdAt: "asc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            profilePictureUrl: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    return res.json({
        data: comments.map((comment) => ({
            id: comment.id,
            thoughtId: comment.thoughtId,
            authorId: comment.authorId,
            parentId: comment.parentId,
            text: comment.text,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            author: comment.author,
            replies: comment.replies.map((reply) => ({
                id: reply.id,
                thoughtId: reply.thoughtId,
                authorId: reply.authorId,
                parentId: reply.parentId,
                text: reply.text,
                createdAt: reply.createdAt,
                updatedAt: reply.updatedAt,
                author: reply.author,
                replies: [],
            })),
        })),
        page: pageNumber,
        limit: limitNumber,
        total,
    });
}

export async function getThoughtSupporters(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const thought = await getVisibleThought(auth.id, thoughtId);
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const where = { thoughtId };
    const total = await prisma.thoughtSupport.count({ where });
    const supporters = await prisma.thoughtSupport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
        include: {
            user: {
                select: { id: true, username: true, profilePictureUrl: true, name: true },
            },
        },
    });

    return res.json({
        data: supporters.map((support) => ({
            id: support.id,
            user: support.user,
            createdAt: support.createdAt,
        })),
        page: pageNumber,
        limit: limitNumber,
        total,
    });
}

export async function getThoughtSavers(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const thoughtId = getSingleString(req.params.id);
    if (!thoughtId) {
        return res.status(400).json({ message: "Invalid thought id" });
    }

    const thought = await getVisibleThought(auth.id, thoughtId);
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    const { page, limit } = req.query as { page?: string; limit?: string };
    const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number.parseInt(limit ?? "20", 10) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const where = { thoughtId };
    const total = await prisma.savedThought.count({ where });
    const savers = await prisma.savedThought.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
        include: {
            user: {
                select: { id: true, username: true, profilePictureUrl: true, name: true },
            },
        },
    });

    return res.json({
        data: savers.map((saved) => ({
            id: saved.id,
            user: saved.user,
            createdAt: saved.createdAt,
        })),
        page: pageNumber,
        limit: limitNumber,
        total,
    });
}

