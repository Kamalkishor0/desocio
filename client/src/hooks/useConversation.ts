"use client";

import { useEffect, useState } from "react";
import { chatApi } from "@/lib/api/chat";
import { useSocket } from "@/context/SocketContext";
import type { MessageResponse } from "@/types/chat";

export function useConversation(conversationId: string) {
    const socket = useSocket();

    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        setLoading(true);
        setMessages([]);

        function handleNewMessage(message: MessageResponse) {
            console.log("Received new message:", message);

            setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) {
                    return prev;
                }

                return [...prev, message];
            });
        }

        function joinConversation() {
            console.log("Joining room:", conversationId);

            socket.emit("chat:join", {
                conversationId,
            });
        }

        async function load() {
            try {
                const response = await chatApi.getMessages(conversationId);

                if (!active) return;

                setMessages(response.data);

                if (socket.connected) {
                    joinConversation();
                } else {
                    socket.once("connect", joinConversation);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        socket.on("chat:new-message", handleNewMessage);

        load();

        return () => {
            active = false;

            socket.emit("chat:leave", {
                conversationId,
            });

            socket.off("chat:new-message", handleNewMessage);
            socket.off("connect", joinConversation);
        };
    }, [conversationId, socket]);

    async function sendMessage(content: string): Promise<void> {
        console.log("Sending socket message", {
            conversationId,
            content,
        });

        socket.emit("chat:send-message", {
            conversationId,
            content,
        });
    }

    return {
        messages,
        loading,
        sendMessage,
    };
}