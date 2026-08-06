"use client";

import type { MessageResponse } from "@/types/chat";

type Props = {
  message: MessageResponse;
  isOwnMessage: boolean;
};

export function MessageBubble({
  message,
  isOwnMessage,
}: Props) {
  return (
    <div className={`flex w-full ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`whitespace-pre-wrap max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
          isOwnMessage
            ? "rounded-br-md bg-white text-[#080809]"
            : "rounded-bl-md bg-[#080809] text-white"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}