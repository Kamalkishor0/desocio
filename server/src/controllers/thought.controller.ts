import { Response } from "express";
import { ThoughtVisibility, TypeOfThought } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../config/db";

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

export async function getThoughtById(req: AuthenticatedRequest, res: Response) {
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

    const { text } = req.body as { text?: string };
    const trimmedText = typeof text === "string" ? text.trim() : "";
    if (!trimmedText) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    const thought = await getVisibleThought(auth.id, thoughtId);
    if (!thought) {
        return res.status(404).json({ message: "Thought not found" });
    }

    const comment = await prisma.thoughtComment.create({
        data: {
            thoughtId,
            authorId: auth.id,
            text: trimmedText,
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
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take: limitNumber,
    });

    return res.json({
        data: comments,
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
                select: { id: true, username: true, profilePictureUrl: true },
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
                select: { id: true, username: true, profilePictureUrl: true },
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

