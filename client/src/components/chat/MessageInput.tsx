"use client";

import { useState } from "react";

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
    <div className="flex gap-3 border-t border-white/10 p-4">
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 rounded-lg bg-slate-900 p-3 text-white outline-none"
        placeholder="Type a message..."
      />

      <button
        type="button"
        onClick={handleSend}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
}