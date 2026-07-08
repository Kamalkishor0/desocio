"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  FriendRequest,
} from "@/lib/api/friends";
import { FriendRequestCard } from "./friend-request-card";

export function FriendRequests() {
  const [mode, setMode] = useState<"received" | "sent">("received");

  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      setLoading(true);

      const [receivedRequests, sentRequests] = await Promise.all([
        api.receivedRequests(),
        api.sentRequests(),
      ]);

      setReceived(receivedRequests.data);
      setSent(sentRequests.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(senderId: string) {
    try {
      await api.acceptFriendRequest(senderId);

      setReceived((current) =>
        current.filter((request) => request.sender?.id !== senderId)
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReject(senderId: string) {
    try {
      await api.rejectFriendRequest(senderId);

      setReceived((current) =>
        current.filter((request) => request.sender?.id !== senderId)
      );
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
        Loading friend requests...
      </div>
    );
  }

  const requests = mode === "received" ? received : sent;

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("received")}
          className={`rounded-full px-4 py-2 transition ${
            mode === "received"
              ? "bg-white text-slate-950"
              : "text-slate-300"
          }`}
        >
          Received ({received.length})
        </button>

        <button
          type="button"
          onClick={() => setMode("sent")}
          className={`rounded-full px-4 py-2 transition ${
            mode === "sent"
              ? "bg-white text-slate-950"
              : "text-slate-300"
          }`}
        >
          Sent ({sent.length})
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">
          {mode === "received"
            ? "No pending friend requests."
            : "You haven't sent any friend requests."}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              type={mode}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}