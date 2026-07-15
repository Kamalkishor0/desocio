"use client";

import type { MessageResponse } from "@/types/chat";

type Props = {
  message: MessageResponse;
};

export function MessageBubble({
  message,
}: Props) {
  return (
    <div className="max-w-md rounded-xl bg-slate-800 p-3 text-white">
      {message.content}
    </div>
  );
}