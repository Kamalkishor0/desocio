import type { Express, Request, Response } from "express";
import { PostReactionType, PostVisibility } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth";
import prisma from "../config/db";

function getSingleString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function parsePostReactionType(value: unknown): PostReactionType | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    if (Object.values(PostReactionType).includes(value as PostReactionType)) {
        return value as PostReactionType;
    }
    return undefined;
}

async function areTheyFriends(userIdA: string, userIdB: string): Promise<boolean> {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                { userAId: userIdA, userBId: userIdB },
                { userAId: userIdB, userBId: userIdA },
            ],
        },
    });
    return Boolean(friendship);
}

export async function createPost(req:AuthenticatedRequest, res: Response) {
    
    const auth = req.auth;
    if (!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { text } = req.body as { text?: string };
    const authorId = auth.id;
    const files = (req as Request & { files?: Express.Multer.File[] }).files ?? [];
    const photos = files.map((file, index) => ({
        url: `/uploads/posts/${file.filename}`,
        position: index,
    }));
    const post = await prisma.post.create({
        data: {
            text,
            authorId,
            photos: photos.length ? { create: photos } : undefined,
        },
        include: { photos: true },
    });
    res.status(201).json(post);
}

export async function getAllPosts(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const userIdParam = getSingleString(req.query.userId);
    if (req.query.userId !== undefined && !userIdParam) {
        return res.status(400).json({ message: "Invalid user id" });
    }
    const userId = userIdParam ?? auth.id;
    if (userId !== auth.id) {
        const isFriends = await areTheyFriends(auth.id, userId);
        if (!isFriends) {
            return res.status(403).json({ message: "Forbidden" });
        }
    }
    const whereClause = userId === auth.id
        ? { authorId: userId }
        : { authorId: userId, visibility: PostVisibility.friends };
    const posts = await prisma.post.findMany({
        where: whereClause,
        include: { photos: true },
        orderBy: { createdAt: "desc" },
    });
    res.json(posts);
}

export async function getPostById(req: AuthenticatedRequest, res: Response) {   
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const postId = getSingleString(req.params.id);
    if (!postId) {
        return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: { photos: true },
    });
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== auth.id) {
        const isFriends = await areTheyFriends(auth.id, post.authorId);
        if (!isFriends || post.visibility !== PostVisibility.friends) {
            return res.status(404).json({ message: "Post not found" });
        }
    }
    res.json(post);
}
export async function deletePost(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const postId = getSingleString(req.params.id);
    if (!postId) {
        return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post || post.authorId !== auth.id) {
        return res.status(404).json({ message: "Post not found" });
    }
    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: "Post deleted" });
}

export async function reactToPost(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const postId = getSingleString(req.params.id);
    if (!postId) {
        return res.status(400).json({ message: "Invalid post id" });
    }
    const reactionType = parsePostReactionType((req.body as { type?: unknown }).type);
    if (!reactionType) {
        return res.status(400).json({ message: "Invalid reaction type" });
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== auth.id) {
        const isFriends = await areTheyFriends(auth.id, post.authorId);
        if (!isFriends || post.visibility !== PostVisibility.friends) {
            return res.status(404).json({ message: "Post not found" });
        }
    }

    const existingReaction = await prisma.postReaction.findFirst({
        where: { postId, userId: auth.id },
    });
    if (existingReaction) {
        if (existingReaction.type === reactionType) {
            await prisma.postReaction.delete({ where: { id: existingReaction.id } });
            return res.json({ message: "Reaction removed" });
        } else {
            await prisma.postReaction.update({
                where: { id: existingReaction.id },
                data: { type: reactionType },
            });
            return res.json({ message: "Reaction updated" });
        }
    } else {
        await prisma.postReaction.create({
            data: { postId, userId: auth.id, type: reactionType },
        });
        return res.json({ message: "Reaction added" });
    }
}

export async function commentOnPost(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const postId = getSingleString(req.params.id);
    if (!postId) {
        return res.status(400).json({ message: "Invalid post id" });
    }
    const { text } = req.body as { text?: string };
    if (!text) {
        return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== auth.id) {
        const isFriends = await areTheyFriends(auth.id, post.authorId);
        if (!isFriends || post.visibility !== PostVisibility.friends) {
            return res.status(404).json({ message: "Post not found" });
        }
    }

    const comment = await prisma.postComment.create({
        data: {
            postId,
            authorId: auth.id,
            text,
        },
    });
    res.status(201).json(comment);
}

export async function getCommentsForPost(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const postId = getSingleString(req.params.id);
    if (!postId) {
        return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== auth.id) {
        const isFriends = await areTheyFriends(auth.id, post.authorId);
        if (!isFriends || post.visibility !== PostVisibility.friends) {
            return res.status(404).json({ message: "Post not found" });
        }
    }

    const comments = await prisma.postComment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
    });
    res.json(comments);
}

export async function deleteComment(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const commentId = getSingleString(req.params.commentId);
    if (!commentId) {
        return res.status(400).json({ message: "Invalid comment id" });
    }

    const comment = await prisma.postComment.findUnique({
        where: { id: commentId },
    });
    if (!comment || comment.authorId !== auth.id) {
        return res.status(404).json({ message: "Comment not found" });
    }
    await prisma.postComment.delete({ where: { id: commentId } });
    res.json({ message: "Comment deleted" });
}

export async function getReactOfPost(req: AuthenticatedRequest, res: Response) {
    const auth = req.auth;
    if(!auth) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const postId = getSingleString(req.params.id);
    if (!postId) {
        return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }
    if (post.authorId !== auth.id) {
        return res.status(404).json({ message: "Post not found" });
    }

    const reaction = await prisma.postReaction.findFirst({
        where: { postId, userId: auth.id },
    });
    res.json({ reaction: reaction?.type ?? null });
}