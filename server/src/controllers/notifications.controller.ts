import prisma from "../config/db";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";

function getSingleString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
}

export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.auth) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.auth.id,
      },
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
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      message: "Could not fetch notifications",
    });
  }
}

export async function updateNotificationAsRead(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.auth) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const notificationId = getSingleString(req.params.notificationId);

  if (!notificationId) {
    return res.status(400).json({
      message: "Notification ID is required",
    });
  }

  try {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: req.auth.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        isRead: true,
      },
    });

    return res.json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);

    return res.status(500).json({
      message: "Could not update notification",
    });
  }
}