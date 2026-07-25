"use client";

import { useAuth } from "@/context/AuthContext";
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
  const {
    messages,
    loading,
    sendMessage,
  } = useConversation(conversationId);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList
        messages={messages}
        currentUserId={user?.id ?? null}
      />

      <MessageInput
        onSend={sendMessage}
      />
    </div>
  );
}