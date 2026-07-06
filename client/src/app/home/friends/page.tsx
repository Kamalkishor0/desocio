"use client";

import { FriendsList } from "@/components/friends-list";
import { useState } from "react";

export default function FriendsPage() {
  const [mode, setMode] = useState<"friends" | "requests">("friends");

  return (
    <div>
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 ml-3 mt-3 text-sm">
        <button
          type="button"
          onClick={() => setMode("friends")}
          aria-pressed={mode === "friends"}
          className={`rounded-full px-4 py-2 transition ${
            mode === "friends"
              ? "bg-white text-slate-950"
              : "text-slate-300"
          }`}
        >
          Friends
        </button>

        <button
          type="button"
          onClick={() => setMode("requests")}
          aria-pressed={mode === "requests"}
          className={`rounded-full px-4 py-2 transition ${
            mode === "requests"
              ? "bg-white text-slate-950"
              : "text-slate-300"
          }`}
        >
          Requests
        </button>
      </div>

      {mode === "friends" ? (
        <FriendsList />
      ) : (
        <div className="mt-4 text-center text-sm text-slate-400">
          Friend requests feature is coming soon!
        </div>
      )}
    </div>
  );
}