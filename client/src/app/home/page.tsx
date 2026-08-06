"use client";

import { FeedBoard } from "@/components/feed-board";
import { PublicThoughtFeed } from "@/components/public-thought-feed";
import { useState } from "react";

type HomeTab = "private" | "public";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<HomeTab>("private");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6 md:py-8">
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab("private")}
          aria-pressed={activeTab === "private"}
          className={`rounded-full px-4 py-2 transition ${activeTab === "private"
            ? "bg-white text-slate-950"
            : "text-slate-300"
            }`}
        >
          Private
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("public")}
          aria-pressed={activeTab === "public"}
          className={`rounded-full px-4 py-2 transition ${activeTab === "public"
            ? "bg-white text-slate-950"
            : "text-slate-300"
            }`}
        >
          Public
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "private" ? (
          <FeedBoard />
        ) : (
          <PublicThoughtFeed />
        )}
      </div>
    </div>
  );
}