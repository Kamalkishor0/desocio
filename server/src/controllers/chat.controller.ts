import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { getPaginationLimit } from "../utils/pagination";
import { getParam } from "../utils/request";
import * as chatService from "../service/chat.service";

export async function openConversation(
    req: AuthenticatedRequest,
    res: Response
) {
    const auth = req.auth;

    if (!auth) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const userId = getParam(req.params.userId);

    if (!userId) {
        return res.status(400).json({
            message: "User ID is required",
        });
    }

    const conversation = await chatService.openConversation({
        currentUserId: auth.id,
        targetUserId: userId,
    });

    return res.status(201).json(conversation);
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

    const conversationId = getParam(req.params.conversationId);

    if (!conversationId) {
        return res.status(400).json({
            message: "Conversation ID is required",
        });
    }

    const cursor =
        typeof req.query.cursor === "string"
            ? req.query.cursor
            : undefined;

    const limit = getPaginationLimit(req.query.limit);

    const messages = await chatService.getMessages({
        currentUserId: auth.id,
        conversationId,
        cursor,
        limit,
    });

    return res.json(messages);
}

export async function sendMessage(
    req: AuthenticatedRequest,
    res: Response
) {
    const auth = req.auth;

    if (!auth) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const conversationId = getParam(req.params.conversationId);

    if (!conversationId) {
        return res.status(400).json({
            message: "Conversation ID is required",
        });
    }

    const { content } = req.body as {
        content?: string;
    };

    if (typeof content !== "string") {
        return res.status(400).json({
            message: "Content is required",
        });
    }

    const message = await chatService.sendMessage({
        currentUserId: auth.id,
        conversationId,
        content,
    });

    return res.status(201).json(message);
}