"use client";

import { FriendsList } from "@/components/friendships/friends-list";
import { FriendRequests } from "@/components/friendships/friend-request";
import { useEffect, useState } from "react";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FriendsPage() {
  const [mode, setMode] = useState<"friends" | "requests">("friends");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function shareInvite() {
    const code = user?.referralCode;
    if (!code) return;
    const link = `${window.location.origin}/invite/${encodeURIComponent(code)}`;
    const message = `${user.name} has invited you on DeSocio. Accept their friend request: ${link}`;

    if (navigator.share) {
      await navigator.share({ title: "Join me on DeSocio", text: message, url: link });
      return;
    }
    setShowShareOptions(true);
  }

  async function copyInvite() {
    if (!user?.referralCode) return;
    await navigator.clipboard.writeText(`${window.location.origin}/invite/${encodeURIComponent(user.referralCode)}`);
    setNotice("Invite link copied");
    setShowShareOptions(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
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
        <button type="button" onClick={shareInvite} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
          <Share2 size={16} /> Invite Friends
        </button>
      </div>

      {showShareOptions ? (
        <div className="mx-3 mt-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
          <a href={`https://wa.me/?text=${encodeURIComponent(`${user?.name ?? "A friend"} has invited you on DeSocio. Accept their friend request: ${origin}/invite/${encodeURIComponent(user?.referralCode ?? "")}`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white">
            <MessageCircle size={16} /> WhatsApp
          </a>
          <button type="button" onClick={copyInvite} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white">
            <Copy size={16} /> Copy link
          </button>
        </div>
      ) : null}
      {notice ? <p className="px-3 pt-2 text-sm text-gray-400">{notice}</p> : null}

      {mode === "friends" ? (
        <FriendsList />
      ) : (
        <FriendRequests />
      )}
    </div>
  );
}