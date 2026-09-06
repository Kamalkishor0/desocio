import type { Server } from "socket.io";

let emitNotification: ((userId: string, notification: unknown) => void) | null = null;

export function configureNotificationEmitter(io: Server) {
    emitNotification = (userId, notification) => {
        io.to(userId).emit("notifications:new", notification);
    };
}

export function notifyUser(userId: string, notification: unknown) {
    emitNotification?.(userId, notification);
}
