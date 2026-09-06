import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerChatHandlers } from "./handlers/chat.handler";
import { registerNotificationHandlers } from "./handlers/notifications.handler";
import { configureNotificationEmitter } from "./notifications";
import { authenticateSocket } from "./auth";
export let io: Server;

export function initializeSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            credentials: true,
        },
    });
    configureNotificationEmitter(io);
    io.use((socket, next) => {
        try {
            authenticateSocket(socket);
            next();
        } catch (err) {
            next(err as Error);
        }
    });
    io.on("connection", (socket) => {
        socket.join(socket.data.user.id);

        console.log(
            `${socket.data.user.username} connected`
        );

        registerChatHandlers(io, socket);
        registerNotificationHandlers(io, socket);
    });
}