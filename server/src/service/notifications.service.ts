import prisma from "../config/db";
import {
    NotificationEntityType,
    NotificationType
} from "@prisma/client";
import { notifyUser } from "../socket/notifications";

type CreateNotificationInput = {
    userId: string;
    actorId?: string;
    type: NotificationType;
    entityId?: string;
    entityType?: NotificationEntityType;
};

export async function createNotification(
    data: CreateNotificationInput
) {
    const notification = await prisma.notification.create({
        data: {
            userId: data.userId,
            actorId: data.actorId,
            type: data.type,
            entityId: data.entityId,
            entityType: data.entityType
        },
        include: {
            actor: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    profilePictureUrl: true
                }
            }
        }
    });

    notifyUser(data.userId, notification);

    return notification;
}