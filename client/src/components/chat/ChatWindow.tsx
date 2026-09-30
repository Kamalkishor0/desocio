"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { chatApi } from "@/lib/api/chat";
import { resolveMediaUrl } from "@/lib/media";
import type { ConversationResponse } from "@/types/chat";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useConversation } from "@/hooks/useConversation";

type Props = {
  conversationId: string;
};

export function ChatWindow({
  conversationId,
}: Props) {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversation, setConversation] = useState<ConversationResponse | null>(null);
  const [onlineUserId, setOnlineUserId] = useState<string | null>(null);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const {
    messages,
    loading,
    sendMessage,
  } = useConversation(conversationId);

  useEffect(() => {
    let active = true;

    setConversation(null);
    setOnlineUserId(null);
    setTypingUserId(null);

    chatApi.getConversation(conversationId).then((data) => {
      if (active) {
        setConversation(data);
      }
    }).catch((error) => {
      console.error("Failed to load conversation:", error);
    });

    return () => {
      active = false;
    };
  }, [conversationId]);

  useEffect(() => {
    const handleOnline = ({ userId }: { userId: string }) => {
      setOnlineUserId(userId);
    };
    const handleOffline = ({ userId }: { userId: string }) => {
      setOnlineUserId((current) => current === userId ? null : current);
      setTypingUserId((current) => current === userId ? null : current);
    };
    const handleTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUserId(isTyping ? userId : null);
    };

    socket.on("chat:user-online", handleOnline);
    socket.on("chat:user-offline", handleOffline);
    socket.on("chat:user-typing", handleTyping);

    return () => {
      socket.off("chat:user-online", handleOnline);
      socket.off("chat:user-offline", handleOffline);
      socket.off("chat:user-typing", handleTyping);
    };
  }, [socket]);

  const handleTyping = useCallback((isTyping: boolean) => {
    socket.emit("chat:typing", { conversationId, isTyping });
  }, [conversationId, socket]);

  const avatarUrl = resolveMediaUrl(conversation?.otherUser.profilePictureUrl);
  const online = onlineUserId === conversation?.otherUser.id;
  const typing = typingUserId === conversation?.otherUser.id;

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {conversation ? (
        <Link
          href={`/home/profile/${conversation.otherUser.username}`}
          className="flex shrink-0 items-center gap-3 border-b border-white/10 px-5 py-3 transition hover:bg-white/5"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={conversation.otherUser.username}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 font-semibold text-white">
              {conversation.otherUser.username[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {conversation.otherUser.name}
            </p>
            <p className="truncate text-sm text-gray-400">
              @{conversation.otherUser.username} · {typing ? "Typing..." : online ? "Online" : "Offline"}
            </p>
          </div>
          <span className={`ml-auto h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-400" : "bg-gray-600"}`} />
        </Link>
      ) : null}

      <MessageList
        messages={messages}
        currentUserId={user?.id ?? null}
      />

      <MessageInput
        onSend={sendMessage}
        onTyping={handleTyping}
      />
    </div>
  );
}