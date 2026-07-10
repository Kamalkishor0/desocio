import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerChatHandlers } from "./message";
export let io: Server;

export function initializeSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);
        registerChatHandlers(socket);
    });
}