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

        async function load() {
            try {
                const response = await chatApi.getMessages(conversationId);

                if (!active) return;

                setMessages(response.data);

                socket.emit("chat:join", {
                    conversationId,
                });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        function handleNewMessage(message: MessageResponse) {
            setMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) {
                    return prev;
                }

                return [...prev, message];
            });
        }

        load();

        socket.on("chat:new-message", handleNewMessage);

        return () => {
            active = false;

            socket.emit("chat:leave", {
                conversationId,
            });

            socket.off("chat:new-message", handleNewMessage);
        };
    }, [conversationId, socket]);

    async function sendMessage(content: string): Promise<void> {
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