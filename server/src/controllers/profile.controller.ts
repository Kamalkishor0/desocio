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

    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            createdAt: true,
            lastSeenAt: true,
            profilePictureUrl: true,
            bio: true,
        }
    });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
}