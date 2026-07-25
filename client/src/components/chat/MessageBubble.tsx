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
            ? "rounded-br-md bg-cyan-600 text-white"
            : "rounded-bl-md bg-slate-800 text-slate-100"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}