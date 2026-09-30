import type { Server, Socket } from "socket.io";
import * as chatService from "../../service/chat.service";
import { ApiError } from "../../utils/ApiError";
import prisma from "../../config/db";

type JoinConversationPayload = {
    conversationId: string;
};

type LeaveConversationPayload = {
    conversationId: string;
};

type SendMessagePayload = {
    conversationId: string;
    content: string;
};

function emitSocketError(socket: Socket, error: unknown) {
    if (error instanceof ApiError) {
        socket.emit("chat:error", {
            message: error.message,
        });
        return;
    }

    console.error(error);

    socket.emit("chat:error", {
        message: "Internal server error",
    });
}

async function canSharePresence(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { showOnlineStatus: true },
    });
    return user?.showOnlineStatus ?? false;
}

export function registerChatHandlers(
    io: Server,
    socket: Socket
) {
    console.log(
        `Chat socket connected: ${socket.data.user.username}`
    );

    socket.on(
    "chat:join",
    async ({ conversationId }: JoinConversationPayload) => {
        try {
            console.log("JOIN EVENT:", conversationId);

            await chatService.joinConversation({
                currentUserId: socket.data.user.id,
                conversationId,
            });

            socket.join(conversationId);

            const roomSockets = await io.in(conversationId).fetchSockets();
            for (const roomSocket of roomSockets) {
                if (roomSocket.id !== socket.id && await canSharePresence(roomSocket.data.user.id)) {
                    socket.emit("chat:user-online", {
                        userId: roomSocket.data.user.id,
                    });
                }
            }

            if (await canSharePresence(socket.data.user.id)) {
                socket.to(conversationId).emit("chat:user-online", {
                    userId: socket.data.user.id,
                });
            }

            console.log("ROOMS:", [...socket.rooms]);

            socket.emit("chat:joined", {
                conversationId,
            });
        } catch (error) {
            emitSocketError(socket, error);
        }
    }
);

    socket.on(
        "chat:leave",
        async ({ conversationId }: LeaveConversationPayload) => {
            if (await canSharePresence(socket.data.user.id)) {
                socket.to(conversationId).emit("chat:user-offline", {
                    userId: socket.data.user.id,
                });
            }
            await socket.leave(conversationId);

            socket.emit("chat:left", {
                conversationId,
            });
        }
    );

    socket.on(
        "chat:send-message",
        async ({ conversationId, content }: SendMessagePayload) => {
            console.log(
      "Received socket message:",
      conversationId,
      content
    );
            try {
                const message = await chatService.sendMessage({
                    currentUserId: socket.data.user.id,
                    conversationId,
                    content,
                });
                console.log("Broadcasting:", message);
                io.to(conversationId).emit(
                    "chat:new-message",
                    message
                );
            } catch (error) {
                emitSocketError(socket, error);
            }
        }
    );

    socket.on(
        "chat:typing",
        ({ conversationId, isTyping }: JoinConversationPayload & { isTyping: boolean }) => {
            socket.to(conversationId).emit("chat:user-typing", {
                userId: socket.data.user.id,
                isTyping,
            });
        }
    );

    socket.on("disconnect", () => {
        canSharePresence(socket.data.user.id).then((visible) => {
            for (const room of socket.rooms) {
                if (visible && room !== socket.id) {
                    socket.to(room).emit("chat:user-offline", {
                        userId: socket.data.user.id,
                    });
                }
            }
            console.log(`Chat socket disconnected: ${socket.data.user.username}`);
        }).catch(emitSocketError.bind(null, socket));
    });
}