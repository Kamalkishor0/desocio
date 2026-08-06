"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";

type Props = {
  onSend: (content: string) => Promise<void>;
};

export function MessageInput({ onSend }: Props) {
  const [content, setContent] = useState("");

  async function handleSend() {
    const trimmed = content.trim();

    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setContent("");
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="shrink-0 border-t border-gray-700 p-3 backdrop-blur">
      <div className="flex items-center gap-2 rounded-2xl border border-gray-700 bg-[#080809] px-3 py-2 shadow-lg shadow-black/10">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-gray-400"
          placeholder="Type a message..."
        />

        <button
          type="button"
          onClick={handleSend}
          aria-label="Send message"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 bg-white text-[#080809] transition hover:bg-gray-200 hover:text-[#080809]"
        >
          <SendHorizontal size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}