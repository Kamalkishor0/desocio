import type { Server, Socket } from "socket.io";
import { NotificationType, NotificationEntityType } from "@prisma/client";
import { ApiError } from "../../utils/ApiError";
import { createNotification } from "../../service/notifications.service";

type CreateNotificationPayload = {
    userId: string;
    actorId?: string;
    type: NotificationType;
    entityId?: string;
    entityType?: NotificationEntityType;
};

function emitSocketError(socket: Socket, error: unknown) {
    if (error instanceof ApiError) {
        socket.emit("notifications:error", {
            message: error.message,
        });
        return;
    }

    console.error(error);

    socket.emit("notifications:error", {
        message: "Internal server error",
    });
}
export async function registerNotificationHandlers(_io: Server, socket: Socket) {
    console.log(
        `notifications socket connected: ${socket.data.user.username}`
    );

    socket.on(
        "notifications:create",
        async ({
            userId,
            actorId,
            type,
            entityId,
            entityType,
        }: CreateNotificationPayload) => {
            try {
                await createNotification({
                    userId,
                    actorId,
                    type,
                    entityId,
                    entityType,
                });
            } catch (error) {
                emitSocketError(socket, error);
            }
        }
    );

    socket.on("disconnect", () => {
        console.log(
            `notifications socket disconnected: ${socket.data.user.username}`
        );
    });
}