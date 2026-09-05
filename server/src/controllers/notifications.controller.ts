import prisma from "../config/db";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";

export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.auth.id },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ message: "Could not fetch notifications" });
  }
}