"use client";

import type { MessageResponse } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: MessageResponse[];
  currentUserId: string | null;
};

export function MessageList({
  messages,
  currentUserId,
}: Props) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
        />
      ))}
    </div>
  );
}