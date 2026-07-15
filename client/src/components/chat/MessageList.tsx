"use client";

import type { MessageResponse } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";

type Props = {
  messages: MessageResponse[];
};

export function MessageList({
  messages,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-3">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
        />
      ))}
    </div>
  );
}