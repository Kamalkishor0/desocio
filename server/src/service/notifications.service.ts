import prisma from "../config/db";
import {
    NotificationEntityType,
    NotificationType
} from "@prisma/client";

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
    return prisma.notification.create({
        data: {
            userId: data.userId,
            actorId: data.actorId,
            type: data.type,
            entityId: data.entityId,
            entityType: data.entityType
        }
    });
}