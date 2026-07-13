import type { Server, Socket } from "socket.io";
import * as chatService from "../../service/chat.service";
import { ApiError } from "../../utils/ApiError";

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
                await chatService.joinConversation({
                    currentUserId: socket.data.user.id,
                    conversationId,
                });

                await socket.join(conversationId);

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
        ({ conversationId }: LeaveConversationPayload) => {
            socket.leave(conversationId);

            socket.emit("chat:left", {
                conversationId,
            });
        }
    );

    socket.on(
        "chat:send-message",
        async ({ conversationId, content }: SendMessagePayload) => {
            try {
                const message = await chatService.sendMessage({
                    currentUserId: socket.data.user.id,
                    conversationId,
                    content,
                });

                io.to(conversationId).emit(
                    "chat:new-message",
                    message
                );
            } catch (error) {
                emitSocketError(socket, error);
            }
        }
    );

    socket.on("disconnect", () => {
        console.log(
            `Chat socket disconnected: ${socket.data.user.username}`
        );
    });
}