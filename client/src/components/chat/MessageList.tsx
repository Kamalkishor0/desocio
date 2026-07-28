"use client";

import { useEffect, useRef } from "react";
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
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <div className="slim-scrollbar flex-1 min-h-0 space-y-3 overflow-y-auto p-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
        />
      ))}
      <div ref={scrollAnchorRef} />
    </div>
  );
}